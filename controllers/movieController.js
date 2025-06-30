// controllers/movieController.js

const db = require('../utils/db');

exports.searchMovies = async (req, res) => {
	const { title, year, page = 1 } = req.query;

	if (!title) {
		return res.status(400).json({
			error: true,
			message: 'Title query parameter is required',
		});
	}

	if (year && !/^\d{4}$/.test(year)) {
		return res.status(400).json({
			error: true,
			message: 'Invalid year format. Format must be yyyy.',
		});
	}

	const limit = 100;
	const offset = (page - 1) * limit;

	try {
		const baseQuery = `
      SELECT tconst AS imdbID, primaryTitle AS Title, startYear AS Year, titleType AS Type
      FROM basics
      WHERE primaryTitle LIKE ? ${year ? 'AND startYear = ?' : ''}
      LIMIT ? OFFSET ?
    `;

		const queryParams = year ? [`%${title}%`, year, limit, offset] : [`%${title}%`, limit, offset];

		const [results] = await db.query(baseQuery, queryParams);

		const [countResult] = await db.query(
			`
      SELECT COUNT(*) AS total
      FROM basics
      WHERE primaryTitle LIKE ? ${year ? 'AND startYear = ?' : ''}
      `,
			year ? [`%${title}%`, year] : [`%${title}%`]
		);

		const total = countResult[0].total;
		const lastPage = Math.ceil(total / limit);

		res.status(200).json({
			data: results,
			pagination: {
				total,
				lastPage,
				perPage: limit,
				currentPage: parseInt(page),
				from: offset + 1,
				to: offset + results.length,
			},
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: true, message: 'Internal Server Error' });
	}
};

exports.getMovieById = async (req, res) => {
	const { imdbID } = req.params;

	if (!imdbID) {
		return res.status(400).json({
			error: true,
			message: 'You must supply an imdbID!',
		});
	}

	try {
		// Step 1: Movie Details
		const [movieRows] = await db.query(
			`
      SELECT
        primaryTitle AS Title,
        startYear AS Year,
        runtimeMinutes AS Runtime,
        genres AS Genre
      FROM basics
      WHERE tconst = ?
      `,
			[imdbID]
		);

		if (movieRows.length === 0) {
			return res.status(404).json({ error: true, message: 'Movie not found' });
		}

		const movie = movieRows[0];

		// Step 2: Get director/writer IDs from crew table
		const [crewRows] = await db.query(
			`
      SELECT directors, writers
      FROM crew
      WHERE tconst = ?
      `,
			[imdbID]
		);

		const directorIDs = crewRows[0]?.directors?.split(',') || [];
		const writerIDs = crewRows[0]?.writers?.split(',') || [];

		// Fetch names for directors
		let directorNames = [];
		if (directorIDs.length > 0) {
			const [rows] = await db.query(
				`SELECT primaryName FROM names WHERE nconst IN (${directorIDs.map(() => '?').join(',')})`,
				directorIDs
			);
			directorNames = rows.map((row) => row.primaryName);
		}

		// Fetch names for writers
		let writerNames = [];
		if (writerIDs.length > 0) {
			const [rows] = await db.query(
				`SELECT primaryName FROM names WHERE nconst IN (${writerIDs.map(() => '?').join(',')})`,
				writerIDs
			);
			writerNames = rows.map((row) => row.primaryName);
		}

		movie.Director = directorNames.join(', ');
		movie.Writer = writerNames.join(', ');

		// Step 3: Actors
		const [actorRows] = await db.query(
			`
      SELECT n.primaryName
      FROM principals p
      JOIN names n ON p.nconst = n.nconst
      WHERE p.tconst = ? AND p.category = 'actor'
      ORDER BY p.ordering ASC
      LIMIT 5
      `,
			[imdbID]
		);

		movie.Actors = actorRows.map((row) => row.primaryName).join(', ');

		// Step 4: Ratings
		const [ratingRows] = await db.query(`SELECT averageRating FROM ratings WHERE tconst = ?`, [
			imdbID,
		]);

		movie.Ratings = [];

		if (ratingRows.length > 0) {
			movie.Ratings.push({
				Source: 'Internet Movie Database',
				Value: `${ratingRows[0].averageRating}/10`,
			});
		}

		res.status(200).json(movie);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: true, message: 'Internal Server Error' });
	}
};
