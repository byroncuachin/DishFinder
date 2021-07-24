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

const addIngredientsRoutes = require('./routes/addIngredients');

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

// home page
app.get('/', (req, res) => {
    req.session.inputFruitsArr = [];
    req.session.inputMeatsArr = [];
    req.session.inputCondimentsArr = [];
    req.session.inputGrainsArr = [];
    req.session.inputDairyArr = [];
    req.session.inputSeasoningArr = [];

    res.render('home');
})

// routes for addingIngredients
app.use('/addIngredients', addIngredientsRoutes);

// results page
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

// error management
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