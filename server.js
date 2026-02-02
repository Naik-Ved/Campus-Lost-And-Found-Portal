// PROJECT: Campus Lost & Found Portal
// DEVELOPER: Vedant

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

//MIDDLEWARE CONFIGURATION
//I use CORS to allows My frontend to communicate with the backend securely.
app.use(cors());

//(load Management)I Increased JSON limit to 10mb to handle Base64 Image strings.
app.use(express.json({ limit: '10mb' })); 

//Thos is the Most Important Line which is use to search localhost on address bar
//(Helps to connect Frontend Files to Public Folder)
app.use(express.static(path.join(__dirname, 'public')));

//DATABASE(I don't Learn Any DATABASE Yet) So i am using the iN Memory Array Here
//I struggle to add MONGODB for 1 hour But it Didn't Work so i use when i master it
//The Problem of in-Memory Array is When i Restarted the Server The DATA IS LOST
let lostItems = [
    { 
        id: "1", 
        type: "Lost",
        item: "Red Calculator", 
        name: "Raj", 
        contact: "999-888-7777",
        description: "It has a scratch on the back that says 'RAJ'",
        image: "https://cdn-icons-png.flaticon.com/512/265/265686.png", 
        status: "Active"
    }
];

// API ROUTES(RESTful) 

// 1. GET Request:It is use to Fetch all active items
app.get('/items', (req, res) => {
    // Returns data as JSON for user-side rendering
    res.json(lostItems);
});

// 2. POST Request Use to Add a new Lost/Found Report
app.post('/add-item', (req, res) => {
    //Here i Am taking DATA from the Body(or the Data which is Inserted By user)
    const { type, item, name, contact, description, image } = req.body;
    
    const newItem = {
        id: Date.now().toString(), // Generating unique ID based on timestamp
        type,        
        item,
        name,
        contact,
        description,
        image, 
        status: "Active"
    };
    
    // Unshift is use to add the new item to the first item in the Array(Just like Stcaks Works on LIFO - Last In First Out)
    lostItems.unshift(newItem); 
    console.log(`✅ [LOG] New Report Added: ${item} | Type: ${type}`);
    
    res.json({ message: "Item Reported Successfully!" });
});

// 3.(DELETE Request)Remove an item(Mark as Solved)
app.delete('/delete-item/:id', (req, res) => {
    const { id } = req.params;
    //(Here I am Finding the Item by id and then delete it)Filter out the item with the matching ID
    lostItems = lostItems.filter(item => item.id !== id);
    res.json({ message: "Deleted successfully" });
});

//This Allows you to open webpage on chrome by searching localhost:5000
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

//SERVER INITIALIZATION 
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`✅ Server Running on Port ${PORT}`);
});