if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const path = require('path');
const methodOverride = require('method-override');
const Dish = require('./models/dish');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/expressError');
const session = require('express-session');
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

const secret = process.env.SECRET || 'itisanallrightsecret'

const sessionConfig = {
    name: 'session',
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + (1000 * 60 * 60 * 24 * 7),
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
}

app.use(session(sessionConfig));

const objArr = [{ meats }, { fruits }];

app.get('/', (req, res) => {
    res.render('home');
})

app.get('/addIngredients', (req, res) => {
    let inputFruitsArr = req.session.inputFruitsArr || [];
    let ingredientsArr = inputFruitsArr.concat(req.session.inputMeatsArr, req.session.inputCondimentsArr, req.session.inputGrainsArr, req.session.inputDairyArr, req.session.inputSeasoningArr);
    for (let i = ingredientsArr.length - 1; i > 0; i--) {
        if (!ingredientsArr[i]) {
            ingredientsArr.splice(i, 1);
        }
    }

    req.session.ingredientsArr = ingredientsArr;
    res.render('adding/addIngredients', { ingredientsArr });
})

app.get('/addIngredients/fruits', (req, res) => {
    const inputFruitsArr = req.session.inputFruitsArr || [];
    res.render('adding/fruits', { fruits, inputFruitsArr });
})

app.get('/addIngredients/meat', (req, res) => {
    const inputMeatsArr = req.session.inputMeatsArr || [];
    res.render('adding/meat', { meats, inputMeatsArr });
})

app.get('/addIngredients/condiments', (req, res) => {
    const inputCondimentsArr = req.session.inputCondimentsArr || [];
    res.render('adding/condiments', { condiments, inputCondimentsArr });
})

app.get('/addIngredients/grains', (req, res) => {
    const inputGrainsArr = req.session.inputGrainsArr || [];
    res.render('adding/grains', { grainsArr, inputGrainsArr });
})

app.get('/addIngredients/dairy', (req, res) => {
    const inputDairyArr = req.session.inputDairyArr || [];
    res.render('adding/dairy', { dairyArr, inputDairyArr });
})

app.get('/addIngredients/seasoning', (req, res) => {
    const inputSeasoningArr = req.session.inputSeasoningArr || [];
    res.render('adding/seasoning', { seasonings, inputSeasoningArr });
})

app.get('/results', catchAsync(async (req, res) => {
    let dishes = await Dish.find({ ingredients: { $in: req.session.ingredientsArr } });
    let j = 0;
    let k = 0;
    let flag = 0;
    let deleteIndexes = [];

    // finding indexes for objects that need to be excluded
    dishes.forEach((dish, i) => {
        while (dish.ingredients[j] && flag !== 1) {
            while (dish.ingredients[j] !== req.session.ingredientsArr[k]) {
                if (k >= (req.session.ingredientsArr).length) {
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

    res.render('../results', { dishes });
}));

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
    req.session.inputFruitsArr = saveIngredientToArr(req, res, req.session.inputFruitsArr);
    res.redirect('/addIngredients');
})
app.post('/addIngredients/meat', (req, res) => {
    req.session.inputMeatsArr = saveIngredientToArr(req, res, req.session.inputMeatsArr);
    res.redirect('/addIngredients');
})
app.post('/addIngredients/condiments', (req, res) => {
    req.session.inputCondimentsArr = saveIngredientToArr(req, res, req.session.inputCondimentsArr);
    res.redirect('/addIngredients');
})
app.post('/addIngredients/grains', (req, res) => {
    req.session.inputGrainsArr = saveIngredientToArr(req, res, req.session.inputGrainsArr);
    res.redirect('/addIngredients');
})
app.post('/addIngredients/dairy', (req, res) => {
    req.session.inputDairyArr = saveIngredientToArr(req, res, req.session.inputDairyArr);
    res.redirect('/addIngredients');
})
app.post('/addIngredients/seasoning', (req, res) => {
    req.session.inputSeasoningArr = saveIngredientToArr(req, res, req.session.inputSeasoningArr);
    res.redirect('/addIngredients');
})

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) {
        err.message = 'Oh No, Something went Wrong!';
    }
    res.status(statusCode).render('error', { err });
})

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`Serving...`);
});