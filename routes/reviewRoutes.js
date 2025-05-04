const express = require('express');
const router = express.Router();
const { createReview, getReviewsByMovie, getReviewsByUser } = require('../controllers/reviewController');

// POST: Create a review
router.post('/reviews', createReview);

// GET: Get reviews by movie
router.get('/reviews/movie/:movieId', getReviewsByMovie);

// GET: Get reviews by user
router.get('/reviews/user/:userId', getReviewsByUser);

module.exports = router;
