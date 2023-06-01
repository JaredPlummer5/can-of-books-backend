require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Book = require("./models/Books");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
mongoose
  .connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.log("Failed to connect to MongoDB:", error);
  });

app.get("/test", (req, res) => {
  res.send("test request received");
});

// Middleware to verify the access token
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  console.log(token)

  if (!token) {
    return res.status(401).json({ error: "Access token is missing" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: err.message });
    }
    console.log(user)
    req.user = user;
    next();
  });
}

app.get("/books", authenticateToken, async (req, res) => {
  try {
    const books = await Book.find({ email: req.user.email });
    res.json(books);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/books", authenticateToken, async (req, res) => {
  try {
    const { title, description, status } = req.body;

    const newBook = await Book.create({
      title: title,
      description: description,
      status: status,
      email: req.user.email,
    });

    res.send(newBook);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

app.delete("/books/:id", authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;

    const result = await Book.findOneAndDelete({
      _id: id,
      email: req.user.email,
    });
    if (!result) {
      res.status(404).send("No book found with the given id");
      return;
    }

    const booksLeft = await Book.find();
    res.send(booksLeft);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

app.put("/books/:id", authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    const { title, description, status } = req.body;

    const updatedBook = await Book.findOneAndUpdate(
      { _id: id, email: req.user.email },
      { title: title, description: description, status: status },
      { new: true, overwrite: true }
    );

    if (!updatedBook) {
      res.status(404).send("No book found with the given id");
      return;
    }

    const booksWithUpdate = await Book.find();
    res.send(booksWithUpdate);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
