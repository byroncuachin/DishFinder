if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const path = require('path');
const methodOverride = require('method-override');
const Dish = require('./models/dish');
const { meats, fruits, condiments, grainsArr, dairyArr, seasonings } = require('./seeds/ingredients');

const app = express();

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/dishFinder';

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
})
    .then(() => {
        console.log("Database Connected")
    })
    .catch((err) => {
        console.log("Database Connection Error");
        console.log(err);
    })

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

let ingredientsArr = [];
let inputFruitsArr = [];
let inputMeatsArr = [];
let inputCondimentsArr = [];
let inputGrainsArr = [];
let inputDairyArr = [];
let inputSeasoningArr = [];

const objArr = [{ meats }, { fruits }];

app.get('/', (req, res) => {
    res.render('home');
})

app.get('/addIngredients', (req, res) => {
    ingredientsArr = inputFruitsArr.concat(inputMeatsArr, inputCondimentsArr, inputGrainsArr, inputDairyArr, inputSeasoningArr);
    res.render('adding/addIngredients', { ingredientsArr });
})

app.get('/addIngredients/fruits', (req, res) => {
    res.render('adding/fruits', { fruits, inputFruitsArr });
})

app.get('/addIngredients/meat', (req, res) => {
    res.render('adding/meat', { meats, inputMeatsArr });
})

app.get('/addIngredients/condiments', (req, res) => {
    res.render('adding/condiments', { condiments, inputCondimentsArr });
})

app.get('/addIngredients/grains', (req, res) => {
    res.render('adding/grains', { grainsArr, inputGrainsArr });
})

app.get('/addIngredients/dairy', (req, res) => {
    res.render('adding/dairy', { dairyArr, inputDairyArr });
})

app.get('/addIngredients/seasoning', (req, res) => {
    res.render('adding/seasoning', { seasonings, inputSeasoningArr });
})

app.get('/results', async (req, res) => {
    ingredientsArr = inputFruitsArr.concat(inputMeatsArr, inputCondimentsArr, inputGrainsArr, inputDairyArr, inputSeasoningArr);
    // const noDishes = await Dish.find({ ingredients: { $nin: ingredientsArr } });
    // const test = await Dish.find({ ingredients: { $exists: true }, $where: `this.ingredients.length <= ${ingredientsArr.length}` });
    // const test = await Dish.find({ $and: [{ ingredients: { $exists: true }, $where: `this.ingredients.length <= ${ingredientsArr.length}` }, { ingredients: { $in: ingredientsArr } }] });
    // finding dishes that include selected ingredients
    let dishes = await Dish.find({ ingredients: { $in: ingredientsArr } });
    let j = 0;
    let k = 0;
    let flag = 0;
    let deleteIndexes = [];
    // dishes.forEach((dish, i) => {
    //     for (let ingredient of dish.ingredients) {
    //         while (ingredient !== ingredientsArr[j]) {
    //             if (j >= (ingredientsArr).length) {
    //                 console.log('Deleted:', dishes[i].name);
    //                 dishes.splice(i, 1);
    //                 break;
    //             }
    //             console.log("NAME:", dish.name, 'INGREDIENTS: ', dish.ingredients, 'SELECTED: ', ingredientsArr);
    //             console.log(ingredient, ingredientsArr[j]);
    //             j++;
    //         }
    //         j = 0;
    //     }
    // });
    // finding indexes for objects that need to be excluded
    dishes.forEach((dish, i) => {
        while (dish.ingredients[j] && flag !== 1) {
            while (dish.ingredients[j] !== ingredientsArr[k]) {
                if (k >= (ingredientsArr).length) {
                    deleteIndexes.push(i);
                    flag = 1;
                    break;
                }
                k++;
            }
            k = 0;
            j++;
        }
        j = 0;
        flag = 0;
    });

    // deleting objects that don't have matching ingredients
    for (let di = deleteIndexes.length - 1; di >= 0; di--) {
        dishes.splice(deleteIndexes[di], 1);
    }

    // reseting arrays
    ingredientsArr = [];
    inputFruitsArr = [];
    inputMeatsArr = [];
    inputCondimentsArr = [];
    inputGrainsArr = [];
    inputDairyArr = [];
    inputSeasoningArr = [];
    res.render('../results', { dishes });
})

function saveIngredientToArr(req, res, arr) {
    arr = [];
    if (typeof req.body.ingredients === 'string') {
        arr.push((req.body.ingredients));
    } else {
        for (const ingredient in req.body.ingredients) {
            arr.push(((req.body.ingredients)[ingredient]));
        }
    }
    return arr;
}

app.post('/addIngredients/fruits', (req, res) => {
    inputFruitsArr = saveIngredientToArr(req, res, inputFruitsArr);
    res.redirect('/addIngredients');
})
app.post('/addIngredients/meat', (req, res) => {
    inputMeatsArr = saveIngredientToArr(req, res, inputMeatsArr);
    res.redirect('/addIngredients');
})
app.post('/addIngredients/condiments', (req, res) => {
    inputCondimentsArr = saveIngredientToArr(req, res, inputCondimentsArr);
    res.redirect('/addIngredients');
})
app.post('/addIngredients/grains', (req, res) => {
    inputGrainsArr = saveIngredientToArr(req, res, inputGrainsArr);
    res.redirect('/addIngredients');
})
app.post('/addIngredients/dairy', (req, res) => {
    inputDairyArr = saveIngredientToArr(req, res, inputDairyArr);
    res.redirect('/addIngredients');
})
app.post('/addIngredients/seasoning', (req, res) => {
    inputSeasoningArr = saveIngredientToArr(req, res, inputSeasoningArr);
    res.redirect('/addIngredients');
})

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`Serving...`);
});