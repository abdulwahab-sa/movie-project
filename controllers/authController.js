const db = require('../utils/db');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');

exports.register = async (req, res) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return res.status(400).json({
			error: true,
			message: 'Request body incomplete, both email and password are required',
		});
	}

	try {
		// Check if user already exists
		const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

		if (existing.length > 0) {
			return res.status(409).json({
				error: true,
				message: 'User already exists',
			});
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		// Insert new user
		await db.query('INSERT INTO users (email, hash) VALUES (?, ?)', [email, hashedPassword]);

		res.status(201).json({ message: 'User created' });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: true, message: 'Internal Server Error' });
	}
};

exports.login = async (req, res) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return res.status(400).json({
			error: true,
			message: 'Request body incomplete, both email and password are required',
		});
	}

	try {
		const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

		if (users.length === 0) {
			return res.status(401).json({
				error: true,
				message: 'Incorrect email or password',
			});
		}

		const user = users[0];

		const match = await bcrypt.compare(password, user.hash);

		if (!match) {
			return res.status(401).json({
				error: true,
				message: 'Incorrect email or password',
			});
		}

		const token = generateToken({ id: user.id, email: user.email });

		res.status(200).json({
			token,
			token_type: 'Bearer',
			expires_in: 86400,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: true, message: 'Internal Server Error' });
	}
};
