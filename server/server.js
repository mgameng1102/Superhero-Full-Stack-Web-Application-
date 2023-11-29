const express = require("express");
const cors = require("cors");
const storage = require('node-storage');
const app = express();
const crypto = require('crypto');
const validator = require('validator');
const superheroInfo = require('./superhero_info.json');
const superheroPowers = require('./superhero_powers.json');


// var passport = require('passport');
// var LocalStrategy = require('passport-local');
// app.use(passport.initialize());
// app.use(passport.session());




app.use(express.json());
app.use(cors());

const userRouter = express.Router();
app.use('/api/users', userRouter);

// Create or load the storage for user data
const userStore = new storage('./user');

// passport.use(new LocalStrategy(function verify(username, password, cb) {
//     const user = Object.values(userStore.storage).find(user => user.username === username);

//     if (!user) {
//         return cb(null, false, { message: 'Incorrect username or password.' });
//     }

//     crypto.pbkdf2(password, user.salt, 310000, 32, 'sha256', function (err, hashedPassword) {
//         if (err) {
//             return cb(err);
//         }
//         if (!crypto.timingSafeEqual(Buffer.from(user.password, 'hex'), hashedPassword)) {
//             return cb(null, false, { message: 'Incorrect username or password.' });
//         }
//         return cb(null, user);
//     });
// }));

// app.get('/login', function(req, res, next) {
//     res.render('login');
//   });

// app.post('/login/password', passport.authenticate('local', {
//     successRedirect: '/',
//     failureRedirect: '/login'
//   }));


app.use((req, res, next) => {
    console.log(`${req.method} request for ${req.url}`);
    next();
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

userRouter.post('/create/:email/:username/:password/:nickname', (req, res) => {
    const { email, username, password, nickname } = req.params;

    // Input validation for email
    if (!validator.isEmail(email)) {
        return res.status(400).json({ message: 'Invalid email format.' });
    }

    // Check if the email already exists in your in-memory storage
    if (userStore.get(email) !== undefined) {
        return res.status(400).json({ message: `Email ${email} already exists.` });
    }

    if (userStore.get(username) !== undefined) {
        return res.status(400).json({ message: `Username ${username} already exists.` });
    }

    // Generate a random salt
    const salt = crypto.randomBytes(16).toString('hex');

    // Hash the password using the salt
    const hashedPassword = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');

    const newUser = {
        email,
        username,
        password: hashedPassword,
        salt,
        nickname,
        verified: false,
        disabled: false,
        superheroLists: [],
    };

    userStore.put(email, newUser);

    console.log(`New user created:`, newUser);

    console.log(`Verification email sent to: ${email}`);

    res.json({ message: 'User created successfully. Check your email for verification.' });

});

userRouter.post('/add-list/:email/:listName/:description?/:visibility?/:ids', (req, res) => {
    const { email, listName, description, visibility } = req.params;
    const ids = req.params.ids.split(',').map(id => parseInt(id));

    // Check if the user exists
    const user = userStore.get(email);
    if (!user) {
        return res.status(404).json({ message: `User with email ${email} not found.` });
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

    // Create a superhero list object
    const newList = {
        listName,
        description: description || '',
        visibility: visibility || 'private',
        heroes: [],
        reviews: [],
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

        // Update the user object
        userStore.put(email, user);

        console.log(`New superhero list added to ${email}:`, newList);

        res.json({ message: 'Superhero list added successfully.' });
    }
});


userRouter.post("/delete-list/:email/:listName", (req, res) => {
    const { email, listName } = req.params;

    // Check if the user exists
    const user = userStore.get(email);
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

    userStore.put(email, user);

    res.json({ message: `List "${listName}" deleted successfully.` });
});


app.get("/message", (req, res) => {
    res.json({ message: "wassup" });
});

app.listen(8000, () => {
    console.log(`Server is running on port 8000.`);
});
