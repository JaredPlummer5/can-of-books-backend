require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Book = require('./models/Books');
const mongoose = require('mongoose');
const Seed = require("./seed");
const app = express();
const axios = require('axios')
const { expressjwt: jwt } = require('express-jwt')
const jwks = require('jwks-rsa');

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

const verifyJWT = jwt({
    secret: jwks.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: 'https://dev-swwedz5mied7hhq5.us.auth0.com/.well-known/jwks.json'
    }),
    audience: 'http://localhost:3001',
    issuer: 'https://dev-swwedz5mied7hhq5.us.auth0.com/',
    algorithms: ['RS256']
}).unless({ path: ['/books'] });

app.use(verifyJWT);

app.get('/test', async (req, res) => {
    console.log(req.auth);
    const accessToken = req.headers.authorization.split(' ')[1];
    try {
        const user = await axios.get('https://dev-swwedz5mied7hhq5.us.auth0.com/userinfo', {
            headers: {
                authorization: `Bearer ${accessToken}`
            }
        });
        const userinfo = user.data;
        console.log(userinfo);
        res.send(userinfo);
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/books', async (req, res) => {
    try {
        await mongoose.connect(process.env.DATABASE_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        const accessToken = req.headers.authorization.split(' ')[1];
        const user = await axios.get('https://dev-swwedz5mied7hhq5.us.auth0.com/userinfo', {
            headers: {
                authorization: `Bearer ${accessToken}`
            }
        });
        const userinfo = user.data;
        console.log(userinfo);
        // Get the user from the JWT
        const books = await Book.find({ userEmail: userinfo.email }); // Query books based on user email

        mongoose.disconnect();
        res.json(books);
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/books', async (req, res) => {
    try {
        await mongoose.connect(process.env.DATABASE_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });


        console.log(req.headers.authorization.split(' ')[1])
        const { title, description, status } = req.body;
        const accessToken = req.headers.authorization.split(' ')[1];
        const user = await axios.get('https://dev-swwedz5mied7hhq5.us.auth0.com/userinfo', {
            headers: {
                authorization: `Bearer ${accessToken}`
            }
        });
        const userinfo = user.data;
        console.log(userinfo);
        const newBook = await Book.create({
            title: title,
            description: description,
            status: status,
            userEmail: userinfo.email // Save the user's email with the book
        });
console.log(newBook)
        res.send(newBook);
        mongoose.disconnect();
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
});

app.delete('/books/:id', async (req, res) => {
    try {
        await mongoose.connect(process.env.DATABASE_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        const id = req.params.id;
        const accessToken = req.headers.authorization.split(' ')[1];
        const user = await axios.get('https://dev-swwedz5mied7hhq5.us.auth0.com/userinfo', {
            headers: {
                authorization: `Bearer ${accessToken}`
            }
        });

        const userinfo = user.data;
        console.log(userinfo);
        const result = await Book.findOneAndDelete({ _id: id, userEmail: userinfo.email }); // Query book based on id and user email

        if (!result) {
            res.status(404).send('No book found with the given id');
            return;
        }

        const booksLeft = await Book.find({ userEmail: userinfo.email }); // Fetch the remaining books based on user email
        res.send(booksLeft);
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    } finally {
        mongoose.disconnect();
    }
});

app.put('/books/:id', async (req, res) => {
    try {
        await mongoose.connect(process.env.DATABASE_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        const id = req.params.id;
        const { title, description, status } = req.body;
        const accessToken = req.headers.authorization.split(' ')[1];
        const user = await axios.get('https://dev-swwedz5mied7hhq5.us.auth0.com/userinfo', {
            headers: {
                authorization: `Bearer ${accessToken}`
            }
        });

        const userinfo = user.data;
        console.log(userinfo);
        const updatedBook = await Book.findOneAndUpdate(
            { _id: id, userEmail: userinfo.email }, // Query book based on id and user email
            { title: title, description: description, status: status },
            { new: true }
        );

        if (!updatedBook) {
            res.status(404).send('No book found with the given id');
            return;
        }

        const booksWithUpdate = await Book.find({ userEmail: userinfo.email }); // Fetch the updated books based on user email
        res.send(booksWithUpdate);
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    } finally {
        mongoose.disconnect();
    }
});

app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    const status = error.status || 500;
    const message = error.message || 'Internal server error';
    res.status(status).send(message);
});

app.listen(PORT, () => console.log(`listening on ${PORT}`));
