const express = require('express');
const userController = require('./../controllers/userController');
const { protect } = require('./../middlewares/auth'); 

const {getAllUsers,createUser,getUser,updateUser,deleteUser} = userController;


const router = express.Router();


router
    .route('/')
    .get(getAllUsers)
    .post(createUser);

router
    .route('/:id')
    .get(getUser)
    .patch(protect,updateUser)
    .delete(protect,deleteUser);


    module.exports = router;