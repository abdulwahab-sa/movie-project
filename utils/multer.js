// utils/multer.js
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, path.join(__dirname, '..', 'uploads'));
	},
	filename: (req, file, cb) => {
		cb(null, `${Date.now()}-${file.originalname}`);
	},
});

const fileFilter = (req, file, cb) => {
	if (file.mimetype === 'image/png') {
		cb(null, true);
	} else {
		cb(new Error('Only PNG files are allowed'), false);
	}
};

module.exports = multer({ storage, fileFilter });
