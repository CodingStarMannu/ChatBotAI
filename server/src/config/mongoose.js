// Importing the mongoose library for MongoDB connection
const mongoose = require('mongoose');

// Connecting to the MongoDB database using the provided connection string
mongoose.connect(process.env.MONGODB_URI);

// Getting the default connection
const db = mongoose.connection;

// Event listener for connection errors
db.on('error', console.error.bind(console, 'Error connecting to the database'));

// Event listener for successful database connection
db.once('open', function () {
    console.log("Successfully connected to the Database");
});

// Exporting the database connection for use in other files
module.exports = db;
