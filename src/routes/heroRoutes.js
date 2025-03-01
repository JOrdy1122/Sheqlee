const express = require('express');
const heroController = require('./../controllers/heroController');

const { createHero, getHero, updateHero } = heroController;

const router = express.Router();

router.route('/').post(createHero);

router.route('/:id').patch(updateHero).get(getHero);

module.exports = router;
