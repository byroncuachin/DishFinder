if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Dish = require('../models/dish');
const dishes = require('./dishes');
const dbURL = process.env.DB_URL || 'mongodb://localhost:27017/dishFinder';

mongoose.connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Mongo Connection Open");
    })
    .catch((err) => {
        console.log("Mongo Connection Error");
        console.log(err);
    });

const seedDB = async () => {
    await Dish.deleteMany({});
    for (let entry of dishes) {
        const d = new Dish({
            name: entry.name,
            ingredients: entry.ingredients,
            recipeURL: entry.recipeURL,
            imageURL: entry.imageURL,
        })
        await d.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})