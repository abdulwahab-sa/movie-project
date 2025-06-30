// utils/jwt.js

const jwt = require('jsonwebtoken');

exports.generateToken = (payload) => {
	return jwt.sign(payload, process.env.JWT_SECRET, {
		expiresIn: '1d', // 86400 seconds
	});
};

exports.verifyToken = (token) => {
	return jwt.verify(token, process.env.JWT_SECRET);
};
