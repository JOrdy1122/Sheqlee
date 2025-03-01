const express = require('express');
const authController = require('./../controllers/authController');

const { login } = authController;
const router = express.Router();

router.post('/login', login);

module.exports = router;
