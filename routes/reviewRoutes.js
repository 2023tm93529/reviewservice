const express = require('express');
const router = express.Router();
const { createReview, getReviewsByMovie, getReviewsByUser, updateReview, deleteReview } = require('../controllers/reviewController');
const { verifyToken } = require('../middleware/authMiddleware');

// POST: Create a review (requires token)
router.post('/', verifyToken, createReview);

// GET: Get reviews for a movie
router.get('/movie/:movieId', getReviewsByMovie);

// GET: Get reviews by a user
router.get('/user/:userId', getReviewsByUser);

// PUT: Update review (by owner only)
router.put('/:id', verifyToken, updateReview);

// DELETE: Delete review (by owner only)
router.delete('/:id', verifyToken, deleteReview);

module.exports = router;