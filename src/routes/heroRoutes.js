const express = require('express');
const heroController = require('./../controllers/heroController');

const { createHero, getHero, updateHero } = heroController;

const router = express.Router();

router.route('/').post(createHero);

router.route('/').get(getHero).patch(updateHero);

module.exports = router;
