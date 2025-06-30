const path = require('path');
const fs = require('fs');

exports.getPoster = async (req, res) => {
	const { imdbID } = req.params;

	if (!imdbID) {
		return res.status(400).json({
			error: true,
			message: 'You must supply an imdbID!',
		});
	}

	try {
		const filePath = path.join(__dirname, '..', 'uploads', `${imdbID}.png`);

		if (!fs.existsSync(filePath)) {
			return res.status(500).json({
				error: true,
				message: `ENOENT: no such file or directory, open '${filePath}'`,
			});
		}

		res.type('image/png');
		res.sendFile(filePath);
	} catch (err) {
		console.error(err);
		res.status(500).json({
			error: true,
			message: 'Could not retrieve the poster',
		});
	}
};

exports.uploadPoster = async (req, res) => {
	const { imdbID } = req.params;

	if (!imdbID) {
		return res.status(400).json({
			error: true,
			message: 'You must supply an imdbID!',
		});
	}

	if (!req.file) {
		return res.status(400).json({
			error: true,
			message: 'Poster file is required',
		});
	}

	const oldPath = req.file.path;
	const newPath = path.join(req.file.destination, `${imdbID}.png`);

	try {
		fs.renameSync(oldPath, newPath);
		res.status(200).json({
			error: false,
			message: 'Poster Uploaded Successfully',
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({
			error: true,
			message: 'Failed to save poster',
		});
	}
};
