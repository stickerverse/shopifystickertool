const express = require('express');
const router = express.Router();
const imageController = require('../controllers/images.controller');

router.post('/upload', imageController.uploadImage);  //Upload image to server
router.post('/remove-background', imageController.removeBackground); //Remove background using Remove.bg

module.exports = router;