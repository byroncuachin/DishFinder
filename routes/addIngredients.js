const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { meats, fruits, condiments, grainsArr, dairyArr, seasonings } = require('../seeds/ingredients');

// function: used for post routes when saving ingredients to session storage
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

// get: home page
router.get('/', (req, res) => {
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

// get routes for all categories of ingredients
router.get('/fruits', (req, res) => {
    const inputFruitsArr = req.session.inputFruitsArr || [];
    res.render('adding/fruits', { fruits, inputFruitsArr });
})
router.get('/meat', (req, res) => {
    const inputMeatsArr = req.session.inputMeatsArr || [];
    res.render('./adding/meat', { meats, inputMeatsArr });
})
router.get('/condiments', (req, res) => {
    const inputCondimentsArr = req.session.inputCondimentsArr || [];
    res.render('adding/condiments', { condiments, inputCondimentsArr });
})
router.get('/grains', (req, res) => {
    const inputGrainsArr = req.session.inputGrainsArr || [];
    res.render('adding/grains', { grainsArr, inputGrainsArr });
})
router.get('/dairy', (req, res) => {
    const inputDairyArr = req.session.inputDairyArr || [];
    res.render('adding/dairy', { dairyArr, inputDairyArr });
})
router.get('/seasoning', (req, res) => {
    const inputSeasoningArr = req.session.inputSeasoningArr || [];
    res.render('adding/seasoning', { seasonings, inputSeasoningArr });
})
router.post('/fruits', (req, res) => {
    req.session.inputFruitsArr = saveIngredientToArr(req, res, req.session.inputFruitsArr);
    res.redirect('/addIngredients');
})

// post routes for saving ingredients to session storages
router.post('/meat', (req, res) => {
    req.session.inputMeatsArr = saveIngredientToArr(req, res, req.session.inputMeatsArr);
    res.redirect('/addIngredients');
})
router.post('/condiments', (req, res) => {
    req.session.inputCondimentsArr = saveIngredientToArr(req, res, req.session.inputCondimentsArr);
    res.redirect('/addIngredients');
})
router.post('/grains', (req, res) => {
    req.session.inputGrainsArr = saveIngredientToArr(req, res, req.session.inputGrainsArr);
    res.redirect('/addIngredients');
})
router.post('/dairy', (req, res) => {
    req.session.inputDairyArr = saveIngredientToArr(req, res, req.session.inputDairyArr);
    res.redirect('/addIngredients');
})
router.post('/seasoning', (req, res) => {
    req.session.inputSeasoningArr = saveIngredientToArr(req, res, req.session.inputSeasoningArr);
    res.redirect('/addIngredients');
})

module.exports = router;