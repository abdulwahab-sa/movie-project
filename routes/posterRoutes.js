// routes/posterRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { getPoster, uploadPoster } = require('../controllers/posterController');
const upload = require('../utils/multer');

router.get('/:imdbID', authMiddleware, getPoster);
router.post('/add/:imdbID', authMiddleware, upload.single('poster'), uploadPoster);

module.exports = router;
