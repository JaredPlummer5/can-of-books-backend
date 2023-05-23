const mongoose = require('mongoose');
require('dotenv').config();

// Connect to the MongoDB database using mongoose to seed initial data.
mongoose.connect(process.env.DATABASE_URL);

//Requiring Books schema from the models folder
const Book = require('./models/Books');

// Seed the database with some books.
async function seed() {
    // Create a new book in the database.a
    await Book.create({
        title: 'Hunger Games',
        description: '"The Hunger Games" is a popular dystopian young adult novel written by Suzanne Collins. Set in a future post-apocalyptic society known as Panem, the story revolves around a yearly event called the Hunger Games.',
        status: 'Published',
    });
    
    // Create a new book in the database.
    await Book.create({
        title: 'Cant Hurt Me',
        description: 'For David Goggins, childhood was a nightmare -- poverty, prejudice, and physical abuse colored his days and haunted his nights. But through self-discipline, mental toughness, and hard work, Goggins transformed himself from a depressed, overweight young man with no future into a U.S. Armed Forces icon and one of the worlds top endurance athletes.',
        status: 'Published',
    });
    
    // Create a new book in the database.
    await Book.create({
        title: 'Divergent',
        description: 'In a dystopian society divided into factions based on virtues, a young girl named Tris discovers she is Divergent, possessing multiple virtues. As she navigates a treacherous initiation process and uncovers a plot to overthrow the system, Tris must confront her own identity and fight for her freedom in Veronica Roth’s electrifying novel, ‘Divergent’.',
        status: 'Published',
    });

    // Log a success message to the console after the books have been created.
    console.log('Books Saved');

    // Disconnect from the database.
    mongoose.disconnect();
}

// Call the seed function to populate the database.

seed();