const express = require('express');
const heroController = require('./../controllers/heroController');

const { createHero, getHero, updateHero } = heroController;

const router = express.Router();

router.route('/').post(createHero); // To create a Hero and only used on development mode

router.route('/:id').patch(updateHero).get(getHero);

module.exports = router;
