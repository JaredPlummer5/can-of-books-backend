require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Book = require('./models/Books');
const mongoose = require('mongoose');
const Seed = require("./seed");
const verifyUser = require('./auth/authorize.js');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 3001;
//mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true });
app.use(verifyUser);
app.get('/test', (request, response) => {
    response.send('test request received');
});


app.get('/books', async (req, res) => {
    console.log(req.user)
    let decoded = jwt.decode(req.headers.authorization)
  console.log(decoded, "wewewewew")
    try {
        await mongoose.connect(process.env.DATABASE_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        const books = await Book.find({ email: req.user?.email });
        mongoose.disconnect();
        res.json(books);
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
    
}).post('/books', async (req, res) => {
    
    try {
        await mongoose.connect(process.env.DATABASE_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        let title = req.body.title;
        let description = req.body.description;
        let status = req.body.status;

        let newBook = await Book.create({
            title: title,
            description: description,
            status: status,
            email: req.user.email 
        });
        res.send(newBook);
        mongoose.disconnect();
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
}).delete('/books/:id', async (req, res) => {
    
    try {
        await mongoose.connect(process.env.DATABASE_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        const id = req.params.id;

        const result = await Book.findByIdAndDelete({_id: id, email:req.user.email });
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
}).put('/books/:id', async (req, res) => {
    
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
            status: status,
            email: req.user.email 
        }, { new: true,
            overwrite: true });

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
}).get("./user", async(req, res) => {
    console.log('Getting the user');
    res.send(req.user);
})


app.listen(PORT, () => console.log(`listening on ${PORT}`));
