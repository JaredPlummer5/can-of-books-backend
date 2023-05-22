'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Book = require('./models/Books');
const mongoose = require('mongoose');
const Seed = require('./seed')

// console.log(Seed)
const app = express();
app.use(cors());

const PORT = process.env.PORT || 3001;


app.get('/test', (request, response) => {

  response.send('test request received')
})
app.get('/books', async (request, response) => {
  try {
    await mongoose.connect(process.env.DATABASE_URL)

    const books = await Book.find()
    mongoose.disconnect();
    response.json(books)
  }catch(error){
    console.log(error)
  }
})
// mongoose.disconnect();
app.listen(PORT, () => console.log(`listening on ${PORT}`));
