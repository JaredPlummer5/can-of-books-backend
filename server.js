require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Book = require('./models/Books');
const mongoose = require('mongoose');
const Seed = require("./seed");
const app = express();
const { auth } = require("express-oauth2-jwt-bearer");
app.use(cors());
app.use(express.json());


const checkJwt = auth({
    audience: "https://dev-swwedz5mied7hhq5.us.auth0.com/api/v2/",
    issuerBaseURL: `https://${process.env.DOMAIN_URL}/`,
    algorithms: ["RS256"]
});

const PORT = process.env.PORT || 3001;
//mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true });
app.get('/test', checkJwt, (request, response) => {
    console.log(request)
    response.send('test request received');
});

app.get('/books', checkJwt, async (request, response) => {
    try {
        await mongoose.connect(process.env.DATABASE_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        const books = await Book.find();
        console.log(request)
        //console.log(request.headers.authorization.user)
        mongoose.disconnect();
        response.json(books);
    } catch (error) {
        console.log(error);
        response.status(500).send('Internal Server Error');
    }
}).post('/books',checkJwt, async (req, res) => {
    try {
        await mongoose.connect(process.env.DATABASE_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log(request)
        let title = req.body.title;
        let description = req.body.description;
        let status = req.body.status;

        let newBook = await Book.create({
            title: title,
            description: description,
            status: status
        });
        res.send(newBook);
        mongoose.disconnect();
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
}).delete('/books/:id', checkJwt, async (req, res) => {
    try {
        await mongoose.connect(process.env.DATABASE_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        const id = req.params.id;

        const result = await Book.findByIdAndDelete(id);
        if (!result) {
            res.status(404).send('No book found with the given id');
            return;
        }
        const booksLeft = await Book.find()
    

        res.send(booksLeft);
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    } finally {
        mongoose.disconnect();
    }
}).put('/books/:id',checkJwt, async (req, res) => {
    try {
        await mongoose.connect(process.env.DATABASE_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        const id = req.params.id;
        const { title, description, status } = req.body;
        

        const updatedBook = await Book.findByIdAndUpdate(id, {
            title: title,
            description: description,
            status: status
        }, { new: true });

        if (!updatedBook) {
            res.status(404).send('No book found with the given id');
            return;
        }
        const booksWithUpdate = await Book.find()
        res.send(booksWithUpdate);
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    } finally {
        mongoose.disconnect();
    }
})
app.listen(PORT, () => console.log(`listening on ${PORT}`));

