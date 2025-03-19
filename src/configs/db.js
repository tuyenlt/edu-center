const mongoose = require('mongoose')
const dotenv = require('dotenv').config()

const { DB_USER, DB_PASSWORD, DB_APP } = process.env

const uri = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@edu-center.list9.mongodb.net/edu-data?retryWrites=true&w=majority&appName=${DB_APP}`
// const localUri = "mongodb://localhost:27017"

const clientOptions = {
    serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true
    }
};

const InitiateMongoServer = async () => {
    try {
        // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
        await mongoose.connect(uri, clientOptions);
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } catch (e) {
        // Ensures that the client will close when you finish/error
        console.log(`Database connection error: ${e}`)
    }
}



module.exports = InitiateMongoServer