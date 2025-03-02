const express = require('express');
const heroController = require('./../controllers/heroController');
const { protect } = require('./../middlewares/auth'); 

const { createHero, getHero, updateHero } = heroController;

const router = express.Router();

router.route('/').post(protect,createHero); // To create a Hero and only used on development mode once

router.route('/:id').patch(protect,updateHero).get(getHero);

module.exports = router;
