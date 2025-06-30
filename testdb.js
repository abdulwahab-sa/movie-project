// test-db.js
const db = require('./utils/db');

async function testConnection() {
	try {
		const [rows] = await db.query('SELECT 1 + 1 AS result');
		console.log('DB connected. Test result:', rows[0].result);
	} catch (err) {
		console.error('DB connection failed:', err.message);
	}
}

testConnection();
