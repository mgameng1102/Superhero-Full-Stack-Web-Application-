const mongoose = require('mongoose');
const User = require('./user'); // Adjust the path as needed

const express = require("express");
const cors = require("cors");
const app = express();
const crypto = require('crypto');
const validator = require('validator');
const superheroInfo = require('./superhero_info.json');
const superheroPowers = require('./superhero_powers.json');

const passport = require('passport');
const LocalStrategy = require('passport-local');
const userRouter = express.Router();
const session = require('express-session');



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

passport.use(new LocalStrategy({ usernameField: 'email' }, function verify(email, password, cb) {
    console.log(`Attempting authentication for email: ${email} and password: ${password}`);

    const users = userStore.get('users') || {}; // Retrieve users object from storage or initialize an empty object
    const user = Object.values(users).find(u => u && u.email === email);

    if (!user) {
        return cb(null, false, { message: 'Incorrect email or password.' });
    }

    crypto.pbkdf2(password, user.ca.salt, 310000, 32, 'sha256', function (err, hashedPassword) {
        if (err) {
            return cb(err);
        }
        if (!crypto.timingSafeEqual(Buffer.from(user.ca.password, 'hex'), hashedPassword)) {
            return cb(null, false, { message: 'Incorrect email or password.' });
        }
        return cb(null, user);
    });
}));


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

userRouter.post('/delete/:email', (req, res) => {
    const email = req.params.email;
    if (userStore.get(email) === null || userStore.get(email) === undefined) {
        return res.status(400).json({ message: `List ${listName} does not exist!` });
    }

    userStore.remove(email);
    res.json({ message: `Email "${email}" deleted successfully.` });
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

        // Generate a random salt
        const salt = crypto.randomBytes(16).toString('hex');

        // Hash the password using the salt
        const hashedPassword = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');

        // Create a new user using the User model
        const newUser = new User({
            email,
            username,
            password: hashedPassword,
            nickname,
            salt,
            verified: false,
            disabled: false,
            superheroLists: [],
        });

        // Save the user to MongoDB
        await newUser.save();

        console.log(`New user created:`, newUser);

        console.log(`Verification email sent to: ${email}`);

        res.json({ message: 'User created successfully. Check your email for verification.' });
    } catch (error) {
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
