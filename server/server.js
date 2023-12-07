const mongoose = require('mongoose');
const User = require('./user'); // Adjust the path as needed
const express = require("express");
const cors = require("cors");
const app = express();
const bcrypt = require('bcrypt');
const validator = require('validator');
const superheroInfo = require('./superhero_info.json');
const superheroPowers = require('./superhero_powers.json');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');

const path = require('path');


const passport = require('passport');
const LocalStrategy = require('passport-local');
const userRouter = express.Router();
const session = require('express-session');



//Mongoose Connection
mongoose.connect("mongodb+srv://markgameng2:mark1102@cluster0.okwqgu4.mongodb.net/<database>", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log("Mongoose Is Connected");
})
.catch((err) => {
    console.error("Error connecting to MongoDB:", err);
});

app.use(session({
  secret: 'secret', // Choose a secret key for session management
  resave: false,
  saveUninitialized: false
}));

app.use(express.json());
app.use(cors());
app.use('/api/users', userRouter);
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    console.log(`${req.method} request for ${req.url}`);
    next();
});

// Add a secret key for JWT token generation
const jwtSecretKey = 'secretjwt';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  jwt.verify(token, jwtSecretKey, (err, user) => {
    console.log(token);
    console.log('JWT Secret Key:', jwtSecretKey);
    if (err) {
      console.log('Invalid token error:', err);

      return res.status(403).json({ message: 'Please Login!' });
    }

    req.user = user;
    next();
  });
};




//Email and Password authentication
passport.use(new LocalStrategy({ usernameField: 'email' }, async function verify(email, password, cb) {
    console.log(`${email} and ${password}`);
    try {
      // Find user by email in MongoDB
      const user = await User.findOne({ email });
  
      if (!user) {
        return cb(null, false, { message: 'Incorrect email or password.' });
      }
      if (user.disabled === true) {
        return cb(null, false, { message: 'Contact the site administrator' });
      }
  
      // Compare hashed password using bcrypt.compare
      const passwordMatch = await bcrypt.compare(password, user.password);
  
      if (!passwordMatch) {
        console.log('Hashed passwords do not match:');
        console.log('Stored Password:', user.password);
        console.log('Entered Password:', password);
        return cb(null, false, { message: 'Incorrect email or password.' });
      }
  
      return cb(null, user, {message: 'Valid User'});
    } catch (error) {
      console.error(error);
      return cb(error);
    }
  }));

  passport.serializeUser((user, done) => {
    done(null, user._id.toString());
  });
  
  passport.deserializeUser((id, done) => {
    User.findById(id)
      .then((user) => {
        done(null, user);
      })
      .catch((err) => {
        done(err, null);
      });
  });
  
  


  app.post('/login/password', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
        if (!user) {
            return res.status(401).json({ message: info.message || 'Authentication failed' });
        }

        req.login(user, async (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Internal Server Error' });
            }

          
            // Generate a JWT token
            const token = jwt.sign({ userId: user._id, email: user.email , privileges: user.privilege}, 'secretjwt', {
                expiresIn: '2h' // Set the expiration time for the token (e.g., 1 hour)
            });

            // Send the token to the client
            res.status(200).json({
                message: info.message || 'User authenticated successfully',
                token: token
                
            });
            console.log(token)
        });
    })(req, res, next);
});

app.get('/user-info', authenticateToken, async (req, res) => {
  try {
    // Extract the user information from the token
    const token = req.headers.authorization;
    const decoded = jwt.verify(token, 'secretjwt'); // Replace with your actual secret key
    const { email } = decoded;

    // Find the user by email in MongoDB
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: `User with email ${email} not found.` });
    }

    // Send the user information
    res.json({
      email: user.email,
      username: user.username,
      nickname: user.nickname,
      privilege: user.privilege,
      verified: user.verified,
      disabled: user.disabled,
      superheroLists: user.superheroLists,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});




// Iterate through superheroInfo and add powers to corresponding superheroes
superheroInfo.forEach(superhero => {
    const powers = superheroPowers.find(power => power.hero_names === superhero.name);
    if (powers) {
        superhero.Powers = Object.keys(powers).filter(power => powers[power] === 'True');
    }
});

userRouter.post('/delete/:email', async (req, res) => {
    const email = req.params.email;

    try {
        // Check if the user exists in MongoDB
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: `User with email ${email} does not exist!` });
        }

        // Remove the user from MongoDB
        await User.deleteOne({ email });

        res.json({ message: `Email "${email}" deleted successfully.` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

userRouter.post('/create/:email/:username/:password/:nickname', async (req, res) => {
    const { email, username, password, nickname } = req.params;
  
    // Input validation for email
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format.' });
    }
  
    try {
      // Check if the email already exists in MongoDB
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: `Email ${email} already exists.` });
      }
  
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return res.status(400).json({ message: `Username ${username} already exists.` });
      }
  
  
      // Generate a random salt
      const salt = await bcrypt.genSalt(10);
  
      // Hash the password using bcrypt
      const hashedPassword = await bcrypt.hash(password, salt);
  
      // Create a new user using the User model
      const newUser = new User({
        email,
        username,
        password: hashedPassword,
        salt, // Store the salt in the user document
        nickname,
        verified: false,
        disabled: false,
        superheroLists: [],
      });
  
      // Save the user to MongoDB
      await newUser.save();

      // Generate a unique verification link (you may use a hash of user information)
      const verificationLink = `http://${req.headers.host}:/api/users/verify/${email}/${newUser._id}`;
      // Display the verification link to the user (you may send it to the client in the response)
  
      console.log('New user created:', newUser);

        console.log(verificationLink) 
      console.log(`Verification email sent to: ${email}`);
  
      res.json({ message: `User created successfully. Copy and past this link to verify your account ${verificationLink}` });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: `Internal Server Error.` });
    }
  });
  
  userRouter.get('/verify/:email/:userId', async (req, res) => {
    const { email, userId } = req.params;

    try {
        // Find the user by email and ID
        const user = await User.findOne({ email, _id: userId });

        if (!user) {
            return res.status(400).json({ message: 'Invalid verification link.' });
        }

        // Mark the user as verified
        user.verified = true;
        await user.save();

        res.json({ message: 'Email address verified successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


  userRouter.post('/updatePass/:email/:newPass/:confPass', async (req, res) => {
        const {email, newPass, confPass} = req.params;

        try{
            const existingUser = await User.findOne({ email });
           
            if (!existingUser) {
                return res.status(400).json({ message: `User does not exist.` });
            }

            if (newPass !== confPass) {
                return res.status(400).json({ message: 'New password and confirm password do not match.' });
            }

             // Generate a new salt and hash the new password
            const newSalt = await bcrypt.genSalt(10);
            const newHashedPassword = await bcrypt.hash(newPass, newSalt);

            const newPasswordMatch = await bcrypt.compare(newPass, existingUser.password);

            if (newPasswordMatch) {
                return res.status(400).json({ message: 'New password cannot be the same as the current password.' });
            }

            // Update the user's password and salt in MongoDB
            existingUser.password = newHashedPassword;
            existingUser.salt = newSalt;

            // Save the updated user
            await existingUser.save();

            res.json({ message: 'Password updated successfully.' });



        } catch(error){
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error' });

        }
  });
  app.post('/disable-user/:userEmail', async (req, res) => {
    const { userEmail } = req.params;
    const token = req.headers.authorization;
    console.log('Received token:', token);

    try {
        const decoded = jwt.verify(token, 'secretjwt');
        console.log('Decoded token:', decoded);

        const { email, privileges } = decoded;
        console.log(email);

        console.log(userEmail);
        // Check if the user has privileges to disable other users
        if (privileges) {
            // Update the user specified by the email to be disabled
            const updatedUser = await User.findOneAndUpdate(
                { email: userEmail },
                { $set: { disabled: true } },
                { new: true }
            );

            if (!updatedUser) {
                return res.status(404).json({ message: `User with email ${userEmail} not found.` });
            }

            console.log(`User with email ${userEmail} has been disabled by a user with privileges.`);
            res.status(200).json({ message: `User with email ${userEmail} has been disabled by a user with privileges.` });
        } else {
            // If the user does not have privileges, return unauthorized
            res.status(401).json({ message: 'Unauthorized: Insufficient privileges to disable accounts.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});



app.post('/enable-user/:userEmail', async (req, res) => {
    const { userEmail } = req.params;
    const token = req.headers.authorization;
    console.log('Received token:', token);

    try {
        const decoded = jwt.verify(token, 'secretjwt');
        console.log('Decoded token:', decoded);

        const { email, privileges } = decoded;
        console.log(email);

        console.log(userEmail);
        // Check if the user has privileges to enable other users
        if (privileges) {
            // Update the user specified by the email to be enabled
            const updatedUser = await User.findOneAndUpdate(
                { email: userEmail },
                { $set: { disabled: false } },
                { new: true }
            );

            if (!updatedUser) {
                return res.status(404).json({ message: `User with email ${userEmail} not found.` });
            }

            console.log(`User with email ${userEmail} has been enabled by a user with privileges.`);
            res.status(200).json({ message: `User with email ${userEmail} has been enabled by a user with privileges.` });
        } else {
            // If the user does not have privileges, return unauthorized
            res.status(401).json({ message: 'Unauthorized: Insufficient privileges to enable accounts.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.post('/grant-privileges/:userEmail', async (req, res) => {
  const { userEmail } = req.params;
  const token = req.headers.authorization;
  console.log('Received token:', token);

  try {
    const decoded = jwt.verify(token, 'secretjwt');
    console.log('Decoded token:', decoded);

    const { email } = decoded;
    console.log(email);

    console.log(userEmail);
    // Check if the user is an admin with the username "add admin"
    if (email === 'admin@gmail.com') {
      // Update the user specified by the email to have privileges
      const updatedUser = await User.findOneAndUpdate(
        { email: userEmail },
        { $set: { privilege: true } },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ message: `User with email ${userEmail} not found.` });
      }

      console.log(`User with email ${userEmail} has been granted privileges by admin.`);
      res.status(200).json({ message: `User with email ${userEmail} has been granted privileges by admin.` });
    } else {
      // If the user is not an admin, return unauthorized
      res.status(401).json({ message: 'Unauthorized: Only admin users can grant privileges.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

  
  
  
userRouter.post('/add-list', authenticateToken, async (req, res) => {
  console.log('Request Body:', req.body);
  console.log('Request Headers:', req.headers);
  const { listName, description, visibility} = req.body;
  if (typeof req.body.ids !== 'string') {
    return res.status(400).json({ message: 'Invalid superhero IDs format.' });
  }

  // Split the string into an array of integers
  const ids = req.body.ids.split(',').map(id => parseInt(id));
  // Extract the token from the request headers
  const token = req.headers.authorization;
  console.log('Received token:', token);

  if (!token) {
      return res.status(401).json({ message: 'Authorization token not provided.' });
  }

  try {
      // Verify the token and extract user information
      const decoded = jwt.verify(token, 'secretjwt'); // Replace 'your_secret_key' with your actual secret key
      const { email} = decoded;

     

      // Find the user by email in MongoDB
      const user = await User.findOne({ email });

      if (!user) {
          return res.status(404).json({ message: `User with email ${email} not found.` });
      }


      if(!user.verified){
        return res.status(404).json({ message: `User not verified. Can't create list` });
      }

      // Check if the user already has 20 lists
      if (user.superheroLists.length >= 20) {
          return res.status(400).json({ message: `User has reached the maximum limit of 20 lists.` });
      }

      // Check if the list name is unique
      const isListNameUnique = user.superheroLists.every(list => list.listName !== listName);
      if (!isListNameUnique) {
          return res.status(400).json({ message: `List name ${listName} already exists for this user.` });
      }

      // Create a superhero list object with lastModified property
      const newList = {
          listName,
          description: description || '', // Use empty string if description is falsy
          visibility: visibility || 'private', // Use 'private' if visibility is falsy
          heroes: [],
          reviews: [],
          lastModified: new Date(), // Adding lastModified property with the current date and time
      };

      // Add superheroes to the list
      let heroNotFoundFlag = false;
      for (const id of ids) {
          const hero = superheroInfo.find(h => h.id === id);

          if (hero) {
              // Add the hero to the list
              newList.heroes.push(hero);
          } else {
              console.log(`Hero ${id} was not found!`);
              res.status(404).json({ message: `Hero ${id} was not found!` });
              heroNotFoundFlag = true;
              break;
          }
      }

      if (!heroNotFoundFlag) {
          // Add the new list to the user's superheroLists array
          user.superheroLists.push(newList);

          await user.save();

          console.log(`New superhero list added to ${email}:`, newList);

          res.json({ message: 'Superhero list added successfully.' });
      }
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
});


  




app.post("/delete-list/:listName",authenticateToken, async (req, res) => {
  const { listName } = req.params;
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: 'Authorization token not provided.' });
  }
  try {
      const decoded = jwt.verify(token, 'secretjwt'); // Replace 'your_secret_key' with your actual secret key
      console.log('Decoded token:', decoded);

      const { email } = decoded;


      // Find the user by email in MongoDB
      const user = await User.findOne({ email });

      if (!user) {
          return res.status(404).json({ message: `User with email ${email} not found.` });
      }

      // Find the index of the list with a case-insensitive comparison
      const index = user.superheroLists.findIndex(list => list.listName.toLowerCase() === listName.toLowerCase());

      if (index === -1) {
          return res.status(400).json({ message: `List name ${listName} doesn't exist.` });
      }

      // Remove the list at the specified index
      user.superheroLists.splice(index, 1);

      // Save the updated user to MongoDB
      await user.save();

      res.json({ message: `List "${listName}" deleted successfully.` });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.post('/edit-list/:listName', authenticateToken, async (req, res) => {
  const { listName } = req.params;
  const { newListName, newDescription, newVisibility, newIds } = req.body;
  const newHeroIds = newIds ? newIds.split(',').map(id => parseInt(id)) : [];

  console.log({ newListName, newDescription, newVisibility, newIds })

  // Extract the token from the request headers
  const token = req.headers.authorization;
  console.log('Received token:', token);

  if (!token) {
    return res.status(401).json({ message: 'Authorization token not provided.' });
  }

  try {
    const decoded = jwt.verify(token, 'secretjwt'); // Replace 'your_secret_key' with your actual secret key
    console.log('Decoded token:', decoded);

    const { email } = decoded;

    // Find the user by email in MongoDB
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: `User with email ${email} not found.` });
    }

    // Find the index of the list by name
    const listIndex = user.superheroLists.findIndex(list => list.listName === listName);

    if (listIndex === -1) {
      return res.status(404).json({ message: `List with name ${listName} not found for this user.` });
    }

    if (newListName !== undefined && newListName !== listName) {
      const isListNameUnique = user.superheroLists.every(list => list.listName !== newListName);
      if (!isListNameUnique) {
        return res.status(400).json({ message: `List name ${newListName} already exists for this user.` });
      }
    }

    // Update aspects of the existing list
    const editedList = user.superheroLists[listIndex];

    // Update list properties if provided
    if (newListName !== undefined && newListName !== '') {
      editedList.listName = newListName;
    }

    if (newDescription !== undefined && newDescription !== '') {
      editedList.description = newDescription;
    }

    if (newVisibility !== undefined && newVisibility !== '') {
      editedList.visibility = newVisibility;
    }

    // Add new heroes to the list
    let heroNotFoundFlag = false;
    for (const id of newHeroIds) {
      const hero = superheroInfo.find(h => h.id === id);

      if (hero) {
        // Add the hero to the list only if not already present
        if (!editedList.heroes.some(existingHero => existingHero.id === hero.id)) {
          editedList.heroes.push(hero);
        }
      } else {
        console.log(`Hero ${id} was not found!`);
        res.status(404).json({ message: `Hero ${id} was not found!` });
        heroNotFoundFlag = true;
        break;
      }
    }

    if (!heroNotFoundFlag) {
      // Update last edited time
      editedList.lastModified = new Date();

      // Update the user object
      user.superheroLists[listIndex] = editedList;

      await user.save();

      console.log(`List ${listName} edited successfully. Last edited time: ${editedList.lastModified}`);

      res.json({ message: 'List edited successfully.'});
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});




app.get("/view-lists", authenticateToken, async (req, res) => {
  try {
    // Extract the user information from the token
    const token = req.headers.authorization;
    const decoded = jwt.verify(token, 'secretjwt'); // Replace with your actual secret key
    const { email } = decoded;

    // Find the user by email in MongoDB
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: `User with email ${email} not found.` });
    }

    // Retrieve and send the superhero lists associated with the user
    const superheroLists = user.superheroLists;
    res.json(superheroLists);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get("/public-lists", async (req, res) => {
  try {
    // Find public superhero lists (limit to 10) and sort by last modified date
    const publicLists = await User.aggregate([
      { $unwind: "$superheroLists" },  // Unwind the superheroLists array
      { $match: { "superheroLists.visibility": "public" } },  // Match only public lists
      { $sort: { "superheroLists.lastModified": -1 } },  // Sort by last modified date (descending order)
      { $limit: 10 },  // Limit the result to 10 lists
      {
        $project: {
          _id: 0,  // Exclude _id from the result
          listName: "$superheroLists.listName",
          creatorNickname: "$nickname",
          numberOfHeroes: { $size: "$superheroLists.heroes" },  // Calculate the number of heroes in the list
          averageRating: { $avg: "$superheroLists.reviews.rating" },  // Calculate the average rating
          lastModified: "$superheroLists.lastModified",
          description: "$superheroLists.description",
          heroes: "$superheroLists.heroes"
        }
      }
    ]);

    res.json({ publicLists });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});



const validateRating = check('rating').isInt({ min: 1, max: 10 }).withMessage('Rating must be an integer between 1 and 5');

app.post("/add-review", validateRating, async (req, res) => {
  const { listName, rating, comment, visibility } = req.body;

  const token = req.headers.authorization;
  console.log('Received token:', token);

  if (!token) {
    return res.status(401).json({ message: 'Authorization token not provided.' });
  }

  try {
    const decoded = jwt.verify(token, 'secretjwt');
    console.log('Decoded token:', decoded);

    const { email } = decoded;
    const reviewUser = await User.findOne({email});
    // Find the user whose list needs to be updated
    const user = await User.findOne({
      'superheroLists.listName': listName,
      'superheroLists.visibility': 'public',
    });

    if(!reviewUser.verified){
      return res.status(403).json({ message: `User not verified. Can't add Review` });
    }

    console.log('User found:', user);

    if (!user) {
      return res.status(404).json({ message: `Superhero list ${listName} not found or not public for the user.` });
    }

    // Find the superhero list within the user's superheroLists
    const superheroListIndex = user.superheroLists.findIndex(list => list.listName === listName && list.visibility === 'public');

    if (superheroListIndex === -1) {
      return res.status(404).json({ message: `Superhero list ${listName} not found or not public for the user.` });
    }

    // Log relevant information for debugging
    console.log(`Adding review for user ${user.email} and list ${listName}`);
    console.log('Before adding review:', user.superheroLists[superheroListIndex].reviews);

    // Update the superhero list with the new review
    user.superheroLists[superheroListIndex].reviews.push({
      'Reviewed by': email,
      rating: parseInt(rating),
      comment: comment || '',
      visibility: visibility || false,
    });

    // Save the updated user to MongoDB
    const updatedUser = await user.save();

    console.log('Updated user:', updatedUser);

    // Log relevant information for debugging
    console.log('User superheroLists:', updatedUser.superheroLists);

    console.log('After adding review:', updatedUser.superheroLists[superheroListIndex].reviews);

    res.status(200).json({ message: 'Review added successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});



app.get('/search', (req, res) => {
  const { name, race, publisher, power } = req.query;
  let results = superheroInfo;

  // Function to remove white spaces from a string
  const removeWhiteSpace = str => str.replace(/\s/g, '');

  // Function to compare two strings with a tolerance of up to two characters difference
  const softMatch = (str1, str2) => {
    if (str1 === str2 || str1.startsWith(str2)) {
      return true;
    }

    if (str2.length > 3) {
      const minLength = str2.length;
      let diffCount = 0;

      for (let i = 0; i < minLength; i++) {
        if (str1[i] !== str2[i]) {
          diffCount++;
          if (diffCount > 2 || str1.length < 2) {
            return false;
          }
        }
      }

      return true;
    }

    return false;
  };

  // Apply soft-matching to each field
  if (name) {
    results = results.filter(hero => softMatch(hero.name, name));
  }
  if (race) {
    results = results.filter(hero => softMatch(hero.Race, race));
  }
  if (publisher) {
    results = results.filter(hero => softMatch(hero.Publisher, publisher));
  }

  if (power) {
    results = results.filter(hero => {
      if (hero.Powers && hero.Powers.length > 0) {
        const lowercasePower = power.toLowerCase().replace(/\s/g, '');
        return hero.Powers.some(p => softMatch(p, lowercasePower));
      }
      return false;
    });
  }

  // Ensure that all conditions are satisfied using soft matching
  results = results.filter(hero =>
    (!name || softMatch(hero.name, name)) &&
    (!race || softMatch(hero.Race, race)) &&
    (!publisher || softMatch(hero.Publisher, publisher)) &&
    (!power || (hero.Powers && hero.Powers.some(p => softMatch(p, power))))
  );

  res.json(results);
});


// Serving static files from the client directory
app.use(express.static(path.join(__dirname, '../client/build')));

// All other GET requests not handled before will return the React app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

app.listen(8000, () => {
  console.log(`Server is running on port 8000.`);
});
