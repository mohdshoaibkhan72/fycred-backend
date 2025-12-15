const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadFile, getSignedUrl } = require('../controllers/uploadController');

// Configure Multer (Memory Storage)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/', upload.single('file'), uploadFile);
router.get('/signed-url', getSignedUrl);

module.exports = router;
