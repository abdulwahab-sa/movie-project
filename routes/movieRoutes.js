// routes/movieRoutes.js

const express = require('express');
const router = express.Router();
const { searchMovies, getMovieById } = require('../controllers/movieController');

router.get('/search', searchMovies);
router.get('/data/:imdbID', getMovieById);

module.exports = router;
