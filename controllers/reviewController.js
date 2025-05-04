const Review = require('../models/Review');

// Create a review
exports.createReview = async (req, res) => {
  try {
    const { userId, movieId, rating, comment } = req.body;
    
    const newReview = new Review({
      userId,
      movieId,
      rating,
      comment
    });

    await newReview.save();
    res.status(201).json(newReview);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get reviews by movie
exports.getReviewsByMovie = async (req, res) => {
  try {
    const movieId = req.params.movieId;
    const reviews = await Review.find({ movieId }).populate('userId', 'username');
    
    if (!reviews) {
      return res.status(404).json({ message: 'No reviews found for this movie' });
    }

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get reviews by user
exports.getReviewsByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const reviews = await Review.find({ userId }).populate('movieId', 'title');
    
    if (!reviews) {
      return res.status(404).json({ message: 'No reviews found for this user' });
    }

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

