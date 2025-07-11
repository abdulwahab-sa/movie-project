// middlewares/authMiddleware.js

const { verifyToken } = require('../utils/jwt');

module.exports = (req, res, next) => {
	const authHeader = req.headers.authorization;

	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return res.status(401).json({
			error: true,
			message: "Authorization header ('Bearer token') not found",
		});
	}

	const token = authHeader.split(' ')[1];

	try {
		const decoded = verifyToken(token);
		req.user = decoded;
		next();
	} catch (err) {
		const message =
			err.name === 'TokenExpiredError' ? 'JWT token has expired' : 'Invalid JWT token';

		return res.status(401).json({ error: true, message });
	}
};
