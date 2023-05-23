// This line loads the dotenv module, which manages environment variables in a separate file.
require('dotenv').config();

// Load express module for creating our server.
const express = require('express');

// Load cors module for enabling cross-origin requests.
const cors = require('cors');

// Load our Book model, which defines the structure of book objects in our database.
const Book = require('./models/Books');

// Load mongoose, a MongoDB object modeling tool to provide a straightforward, schema-based solution to model our application data.
const mongoose = require('mongoose');

// Load seed data.
const Seed = require('./seed')

// Create an instance of an express app.
const app = express();

// Use CORS middleware to allow cross-origin requests.
app.use(cors());

app.use(express.json());

// Use the PORT specified in our environment, or default to 3001.
const PORT = process.env.PORT || 3001;


// Setup a route handler for GET requests to /test. Responds with 'test request received'.
app.get('/test', (request, response) => {
    response.send('test request received')
});


// Setup a route handler for GET requests to /books. Connects to the database, retrieves all books, disconnects, and sends the books to the client.
app.get('/books', async (request, response) => {
    try {
        // Connect to the MongoDB database using mongoose.
        await mongoose.connect(process.env.DATABASE_URL)

        // Find all books in the database.
        const books = await Book.find()

        // Disconnect from the database.
        mongoose.disconnect();

        // Send the found books back to the client in JSON format.
        response.json(books)
    } catch (error) {
        // If there's an error in the try block, log it to the console.
        console.log(error)
    }
}).post('/books', async function (req, res) {
    try {
        let title = req.body.title
        let description = req.body.description
        let status = req.body.status
        await mongoose.connect(process.env.DATABASE_URL)

        let newBook = await Book.create({
            title: title,
            description: description,
            status: status
        });
        res.send(newBook)
        mongoose.disconnect();

    } catch (error) {
        res.status(500).send(error.message);
    }
})

// Start our server listening on the specified PORT.
app.listen(PORT, () => console.log(`listening on ${PORT}`));


