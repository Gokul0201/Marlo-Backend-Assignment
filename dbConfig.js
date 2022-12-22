const mongodb = require('mongodb');
require('dotenv').config()
const MongoClient = mongodb.MongoClient;
const dbUrl = `mongodb+srv://gokul:admin123@cluster0.nis7445.mongodb.net/test${process.env.MONGODB_DB_NAME}`
const dbName = process.env.MONGODB_DB_NAME
module.exports ={dbName,dbUrl,mongodb,MongoClient};