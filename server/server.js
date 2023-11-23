const express = require("express");
const cors = require("cors");
const storage = require('node-storage');
const app = express();
const bcrypt = require('bcrypt');
const validator = require('validator');

app.use(express.json());
app.use(cors());

const userRouter = express.Router();
app.use('/api/users', userRouter);

// Create or load the storage for user data
const userStore = new storage('./user');

app.use((req, res, next) => {
    console.log(`${req.method} request for ${req.url}`);
    next();
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

    // Hash the password
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            console.error('Error hashing password:', err);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        // Create a user object
        const newUser = {
            email,
            username,
            password: hashedPassword,
            nickname,
            verified: false,
            disabled: false,
            superheroLists: [],
        };

        userStore.put(email, newUser);

        console.log(`New user created:`, newUser);
    });
});





app.get("/message", (req, res) => {
    res.json({ message: "wassup" });
});

app.listen(8000, () => {
    console.log(`Server is running on port 8000.`);
});
