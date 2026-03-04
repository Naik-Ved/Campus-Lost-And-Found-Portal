require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose'); 
const app = express();
app.use(cors()); // Cross-Origin Resource Sharing (allows frontend to talk to backend)
app.use(express.json({ limit: '10mb' })); // Increased limit to allow Base64 image strings!
app.use(express.static(path.join(__dirname, 'public')));

// 1. DATABASE CONNECTION 
const dbUrl = process.env.MONGO_URI;
mongoose.connect(dbUrl)
    .then(() => console.log("MongoDB Connected Successfully!"))
    .catch(err => console.log("MongoDB Connection Failed:", err));

// 2. MONGOOSE SCHEMA (The Blueprint)
const itemSchema = new mongoose.Schema({
    type: String,        
    item: String,        
    name: String,        
    contact: String,
    description: String,
    image: String,
    collegeName: String,  
    secretPIN: String,    // Stored here for security checks
    createdAt: { type: Date, default: Date.now }
});

const Item = mongoose.model('Item', itemSchema);

// 3. API ROUTES

// I use GET ROUTE to Fetch items ONLY for the selected college
// I use req.params to grab the college name from the URL
app.get('/items/:collegeName', async (req, res) => {
    try {
        const targetCollege = req.params.collegeName;
        // I use Mongoose's .find() to strictly return documents matching the user's campus. It sorts by newest first.
        const campusItems = await Item.find({ collegeName: targetCollege }).sort({ createdAt: -1 });
        res.json(campusItems);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch items" });
    }
});

// I use POST ROUTE to Receive data from frontend and save to DataBase
// I Uses req.body to grab the JSON Objects sent by the fetch API
app.post('/add-item', async (req, res) => {
    try {
        const { type, item, name, contact, description, image, collegeName, secretPIN } = req.body;
        
        const newItem = new Item({ type, item, name, contact, description, image, collegeName, secretPIN });
        await newItem.save(); // Saves to MongoDB
        
        console.log(` [LOG] Saved to DB with PIN protection: ${item}`);
        res.json({ message: "Item Reported Successfully!" });
    } catch (err) {
        res.status(500).json({ error: "Failed to save item" });
    }
});

// DELETE ROUTE and Security Guard checks the PIN before deleting
app.delete('/delete-item/:id', async (req, res) => {
    try {
        const { id } = req.params; // The ID of the item to delete
        const { pin } = req.body; // The PIN the user typed in the pop-up

        const item = await Item.findById(id); 
        
        if (!item) return res.status(404).json({ error: "Item not found" });

        // I implemented backend validation here. I compare the PIN sent from the frontend against the PIN stored in the MongoDB document.
        //  If they don't match, the server rejects the request with a 403 status."
        if (item.secretPIN !== pin) {
            return res.status(403).json({ error: "Incorrect PIN! Access Denied." });
        }

        await Item.findByIdAndDelete(id); // Only runs if the PIN was correct
        res.json({ message: "Item claimed securely!" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete item" });
    }
});

// Serve frontend for any other routes
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// SERVER INITIALIZATION
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server Running on Port ${PORT}`);
});