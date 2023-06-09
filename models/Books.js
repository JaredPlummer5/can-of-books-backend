// Load the mongoose module, which provides a straightforward, schema-based solution to model application data for MongoDB.
const mongoose = require('mongoose');

// Destructure Schema from mongoose, which provides the structure for each document in a MongoDB collection.
const { Schema } = mongoose;

// Create a new Schema for books, with three fields: title, description, status and email. Each of these fields is a string.
const bookSchema = new Schema({
    title: String,
    description: String,
    status: String,
    userEmail: String
  });
// Create a model named 'Book' using the bookSchema. This model is a constructor that will create new documents in our MongoDB collection.
const Book = mongoose.model('Book', bookSchema);

// Export the Book model, so it can be used elsewhere in our application.
module.exports = Book;
