require('dotenv').config(); // Load environment variables from a .env file

const express = require('express');
const cors = require('cors');
const Book = require('./models/Books'); // Import the Book model
const mongoose = require('mongoose'); // Import Mongoose for database operations
const Seed = require("./seed"); // Import the seed data (if required)
const app = express();
const axios = require('axios'); // Import Axios for making HTTP requests
const { expressjwt: jwt } = require('express-jwt'); // Import express-jwt for JWT verification
const jwks = require('jwks-rsa'); // Import jwks-rsa for JWT verification

app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON request bodies

const PORT = process.env.PORT || 3001; // Set the port for the server

// Middleware for JWT verification
const verifyJWT = jwt({
    secret: jwks.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${process.env.JWKS_URI}` // Retrieve JWKS URI from environment variables
    }),
    audience: `${process.env.AUDIENCE}`, // Set the JWT audience from environment variables
    issuer: `${process.env.ISSUER}`, // Set the JWT issuer from environment variables
    algorithms: ['RS256'] // Set the allowed JWT signing algorithms
}).unless({ path: ['/books'] }); // Exclude the '/books' path from JWT verification

app.use(verifyJWT); // Apply JWT verification to all routes except '/books'

// Route to test JWT authentication
app.get('/test', async (req, res) => {
    console.log(req.auth); // Log the authenticated user information
    const accessToken = req.headers.authorization.split(' ')[1]; // Extract the access token from the authorization header
    try {
        const user = await axios.get(`${process.env.ISSUER}/userinfo`, {
            headers: {
                authorization: `Bearer ${accessToken}` // Set the access token in the authorization header
            }
        });
        // Process the user data
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
});


// Route to get books
app.get('/books', async (req, res) => {

    try {
        await mongoose.connect(process.env.DATABASE_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }); // Connect to the MongoDB database using the provided URL

        const accessToken = req.headers.authorization.split(' ')[1]; // Extract the access token from the authorization header
        console.log("Here",req.headers.authorization.split(' ')[1]);

        const user = await axios.get(`${process.env.ISSUER}/userinfo`, {
            headers: {
                authorization: `Bearer ${accessToken}` // Set the access token in the authorization header
            }
        });

        const userinfo = user.data; // Get the user information from the response

        const books = await Book.find({ userEmail: userinfo.email }); // Query books based on user email

        mongoose.disconnect(); // Disconnect from the database
        res.json(books); // Send the books as a JSON response

    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }

});

// Route to add a new book
app.post('/books', async (req, res) => {

    try {
        await mongoose.connect(process.env.DATABASE_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }); // Connect to the MongoDB database using the provided URL

        console.log(req.headers.authorization.split(' ')[1]);

        const { title, description, status } = req.body; // Extract the book details from the request body
        const accessToken = req.headers.authorization.split(' ')[1]; // Extract the access token from the authorization header

        const user = await axios.get(`${process.env.ISSUER}/userinfo`, {
            headers: {
                authorization: `Bearer ${accessToken}` // Set the access token in the authorization header
            }
        });
        const userinfo = user.data; // Get the user information from the response

        const newBook = await Book.create({
            title: title,
            description: description,
            status: status,
            userEmail: userinfo.email // Save the user's email with the book
        });

        console.log(newBook); // Log the newly created book object

        res.send(newBook); // Send the newly created book as a response
        mongoose.disconnect(); // Disconnect from the database
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
});

// Route to delete a book
app.delete('/books/:id', async (req, res) => {
    try {
        await mongoose.connect(process.env.DATABASE_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }); // Connect to the MongoDB database using the provided URL

        const id = req.params.id; // Get the book ID from the request parameters
        const accessToken = req.headers.authorization.split(' ')[1]; // Extract the access token from the authorization header

        const user = await axios.get(`${process.env.ISSUER}/userinfo`, {
            headers: {
                authorization: `Bearer ${accessToken}` // Set the access token in the authorization header
            }
        });
        const userinfo = user.data; // Get the user information from the response

        const result = await Book.findOneAndDelete({ _id: id, userEmail: userinfo.email }); // Query book based on id and user email

        if (!result) {
            res.status(404).send('No book found with the given id');
            return;
        }

        const booksLeft = await Book.find({ userEmail: userinfo.email }); // Fetch the remaining books based on user email
        res.send(booksLeft); // Send the remaining books as a response
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    } finally {
        mongoose.disconnect(); // Disconnect from the database
    }
});

// Route to update a book
app.put('/books/:id', async (req, res) => {
    try {
        await mongoose.connect(process.env.DATABASE_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }); // Connect to the MongoDB database using the provided URL

        const id = req.params.id; // Get the book ID from the request parameters
        const { title, description, status } = req.body; // Extract the updated book details from the request body
        const accessToken = req.headers.authorization.split(' ')[1]; // Extract the access token from the authorization header

        const user = await axios.get(`${process.env.ISSUER}/userinfo`, {
            headers: {
                authorization: `Bearer ${accessToken}` // Set the access token in the authorization header
            }
        });
        const userinfo = user.data; // Get the user information from the response

        const updatedBook = await Book.findOneAndUpdate(
            { _id: id, userEmail: userinfo.email }, // Query book based on id and user email
            { title: title, description: description, status: status }, // Update the book details
            { new: true } // Return the updated document
        );

        if (!updatedBook) {
            res.status(404).send('No book found with the given id');
            return;
        }

        const booksWithUpdate = await Book.find({ userEmail: userinfo.email }); // Fetch the updated books based on user email
        res.send(booksWithUpdate); // Send the updated books as a response
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    } finally {
        mongoose.disconnect(); // Disconnect from the database
    }
});

// Error handling middleware for 404 Not Found errors
app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

// Error handling middleware for other errors
app.use((error, req, res, next) => {
    const status = error.status || 500;
    const message = error.message || 'Internal server error';
    res.status(status).send(message);
});

app.listen(PORT, () => console.log(`listening on ${PORT}`)); // Start the server and listen on the specified port
