const mongoose = require('mongoose');
const User = require('./user'); // Adjust the path as needed
const express = require("express");
const cors = require("cors");
const app = express();
const bcrypt = require('bcrypt');
const validator = require('validator');
const superheroInfo = require('./superhero_info.json');
const superheroPowers = require('./superhero_powers.json');

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
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });
  


app.post('/login/password', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            console.error(err); // Log the error
            return res.status(500).json({ message: 'Internal Server Error' });
        }
        if (!user) {
            return res.status(401).json({ message: info.message || 'Authentication failed' });
        }

        req.login(user, (err) => {
            if (err) {
                console.error(err); // Log the error
                return res.status(500).json({ message: 'Internal Server Error' });
            }
            return res.status(200).json({ message: info.message || 'User authenticated successfully' });
        });
    })(req, res, next);
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
      const verificationLink = `http://localhost:8000/api/users/verify/${email}/${newUser._id}`;
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

  


// userRouter.post('/add-list/:email/:listName/:description?/:visibility?/:ids', (req, res) => {
//     const { email, listName, description, visibility } = req.params;
//     const ids = req.params.ids.split(',').map(id => parseInt(id));

//     // Check if the user exists
//     const user = userStore.get(email);
//     if (!user) {
//         return res.status(404).json({ message: `User with email ${email} not found.` });
//     }

//     // Check if the user already has 20 lists
//     if (user.superheroLists.length >= 20) {
//         return res.status(400).json({ message: `User has reached the maximum limit of 20 lists.` });
//     }

//     // Check if the list name is unique
//     const isListNameUnique = user.superheroLists.every(list => list.listName !== listName);
//     if (!isListNameUnique) {
//         return res.status(400).json({ message: `List name ${listName} already exists for this user.` });
//     }

//     // Create a superhero list object
//     const newList = {
//         listName,
//         description: description || '',
//         visibility: visibility || 'private',
//         heroes: [],
//         reviews: [],
//     };

//     // Add superheroes to the list
//     let heroNotFoundFlag = false;
//     for (const id of ids) {
//         const hero = superheroInfo.find(h => h.id === id);

//         if (hero) {
//             // Add the hero to the list
//             newList.heroes.push(hero);
//         } else {
//             console.log(`Hero ${id} was not found!`);
//             res.status(404).json({ message: `Hero ${id} was not found!` });
//             heroNotFoundFlag = true;
//             break;
//         }
//     }

//     if (!heroNotFoundFlag) {
//         // Add the new list to the user's superheroLists array
//         user.superheroLists.push(newList);

//         // Update the user object
//         userStore.put(email, user);

//         console.log(`New superhero list added to ${email}:`, newList);

//         res.json({ message: 'Superhero list added successfully.' });
//     }
// });


// userRouter.post("/delete-list/:email/:listName", (req, res) => {
//     const { email, listName } = req.params;

//     // Check if the user exists
//     const user = userStore.get(email);
//     if (!user) {
//         return res.status(404).json({ message: `User with email ${email} not found.` });
//     }

//     // Find the index of the list with a case-insensitive comparison
//     const index = user.superheroLists.findIndex(list => list.listName.toLowerCase() === listName.toLowerCase());

//     if (index === -1) {
//         return res.status(400).json({ message: `List name ${listName} doesn't exist.` });
//     }

//     // Remove the list at the specified index
//     user.superheroLists.splice(index, 1);

//     userStore.put(email, user);

//     res.json({ message: `List "${listName}" deleted successfully.` });
// });


app.get("/message", (req, res) => {
    res.json({ message: "wassup" });
});

app.listen(8000, () => {
    console.log(`Server is running on port 8000.`);
});
