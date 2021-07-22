const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dishSchema = new Schema({
    name: String,
    ingredients: Array,
    recipeURL: String,
    imageURL: String,
})

module.exports = mongoose.model("Dish", dishSchema);