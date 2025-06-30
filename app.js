const express = require('express');
const cors = require('cors');
const app = express();
const movieRoutes = require('./routes/movieRoutes');
const posterRoutes = require('./routes/posterRoutes');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middlewares/errorHandler');

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serve static images

app.use('/movies', movieRoutes);
app.use('/posters', posterRoutes);
app.use('/user', authRoutes);

// Error handler
app.use(errorHandler);

module.exports = app;
