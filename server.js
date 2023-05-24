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
    // Define the route '/books' for POST requests. 
    //This function is asynchronous, meaning it can work in the background, allowing your server to handle other requests concurrently.
    try {
        // From the request body, get the title, description, and status of the book to be created.
        let title = req.body.title
        let description = req.body.description
        let status = req.body.status

        // Connect to the database. The DATABASE_URL environment variable holds the connection string.
        // 'await' is used here because this operation is asynchronous and we need to ensure the connection is established before proceeding.
        await mongoose.connect(process.env.DATABASE_URL)

        // Create a new book document in the database. The 'await' keyword is used because 'Book.create()' is an asynchronous function.
        let newBook = await Book.create({
            title: title,
            description: description,
            status: status
        });

        // After creating the new book, send it as the response to the client. 
        //This could be used to confirm that the book was created successfully.
        res.send(newBook)

        // Disconnect from the database to free up resources.
        mongoose.disconnect();

    } catch (error) {
        // If any error occurred above (database connection, book creation, etc.), send a 500 (Internal Server Error) status code along with the error message to the client.
        res.status(500).send(error.message);
    }
}).delete('/books/:id', async (req, res) => {
    try {
        const id = req.params.id; // Get the id from the request parameters

        // Connect to the MongoDB database
        await mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true });

        // Delete the book with the given id
        const result = await Book.findByIdAndDelete(id);

        if (!result) {
            res.status(404).send('No book found with the given id');
            return;
        }

        res.send('Book deleted successfully');
    } catch (error) {
        // If an error occurred, send back a 500 status and the error message
        res.status(500).send(error.message);
    } finally {
        // Always disconnect from the database when you're done
        mongoose.disconnect();
    }

});

// Start our server listening on the specified PORT.
app.listen(PORT, () => console.log(`listening on ${PORT}`));


