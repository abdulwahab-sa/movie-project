// middlewares/errorHandler.js

module.exports = (err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({
		error: true,
		message: 'Internal Server Error',
	});
};
