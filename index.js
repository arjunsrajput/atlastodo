import express from 'express';
import path from 'path';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middleware
const publicPath = path.resolve('public');
app.use(express.static(publicPath));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// DB config
const dbName = 'Node-Project';
const url = process.env.MONGO_URI;

const client = new MongoClient(url);

let db;

// Connect once (BEST PRACTICE)
async function connectDB() {
    try {
        await client.connect();
        db = client.db(dbName);
        console.log("✅ MongoDB Atlas Connected");
    } catch (err) {
        console.error("❌ DB Connection Error:", err);
    }
}

connectDB();

// View engine
app.set('view engine', 'ejs');

// Routes

// Home
app.get("/", async (req, res) => {
    const result = await db.collection("Todo").find().toArray();
    res.render('list', { data: result });
});

// Add page
app.get("/add", (req, res) => {
    res.render('add');
});

// Update page (empty)
app.get("/update", (req, res) => {
    res.render('update');
});

// Add data
app.post("/add", async (req, res) => {
    const collection = db.collection("Todo");
    const data = await collection.insertOne(req.body);

    if (data) {
        res.redirect("/");
    } else {
        res.redirect("/add");
    }
});

// Delete
app.get("/delete/:id", async (req, res) => {
    const collection = db.collection("Todo");
    await collection.deleteOne({ _id: new ObjectId(req.params.id) });
    res.redirect("/");
});

// Update page with data
app.get("/update/:id", async (req, res) => {
    const collection = db.collection("Todo");
    const result = await collection.findOne({ _id: new ObjectId(req.params.id) });

    res.render('update', { result });
});

// Update data
app.post("/update/:id", async (req, res) => {
    const collection = db.collection('Todo');

    await collection.updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: req.body }
    );

    res.redirect("/");
});

// Server
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});