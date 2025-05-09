const Review = require('../models/Review');
const axios = require('axios');
const jwt = require('jsonwebtoken');

// Service URLs from environment variables
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://user-service-1:3000';
const MOVIE_SERVICE_URL = process.env.MOVIE_SERVICE_URL || 'http://movie-service-1:3001';
const JWT_SECRET = process.env.JWT_SECRET || "B7dx9M#p2s%Lq8j5ZGc!K3vF6tY4wRnE";

// Generate a service token for when we don't have a user token
const generateServiceToken = () => {
  return jwt.sign(
      { id: 'review-service', role: 'service' },
      JWT_SECRET,
      { expiresIn: '1h' }
  );
};

// User service helper with token forwarding
const getUserDetails = async (userId, userToken = null) => {
  try {
    // Use the provided user token if available, otherwise generate a service token
    const token = userToken || generateServiceToken();

    // Include the token in the request headers
    const response = await axios.get(`${USER_SERVICE_URL}/api/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching user ${userId} details:`, error.message);
    return { name: 'Unknown User' };
  }
};

// Movie service helper
const getMovieDetails = async (movieId) => {
  try {
    const response = await axios.get(`${MOVIE_SERVICE_URL}/api/movies/${movieId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching movie ${movieId} details:`, error.message);
    return { title: 'Unknown Movie' };
  }
};

// Create a review
exports.createReview = async (req, res) => {
  try {
    const { movieId, rating, comment } = req.body;
    const userId = req.user.id; // Get userId from token

    // Check if user already reviewed this movie
    const existingReview = await Review.findOne({ movieId, userId });

    if (existingReview) {
      return res.status(400).json({
        message: 'You have already reviewed this movie. Please update your existing review instead.'
      });
    }

    const newReview = new Review({
      userId,
      movieId,
      rating,
      comment
    });

    await newReview.save();
    res.status(201).json(newReview);
  } catch (err) {
    res.status(400).json({ message: 'Error creating review', error: err.message });
  }
};

// Get reviews by movie
exports.getReviewsByMovie = async (req, res) => {
  try {
    const movieId = req.params.movieId;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Get basic reviews without populate
    const reviews = await Review.find({ movieId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    // Get user details for each review
    const enhancedReviews = await Promise.all(
        reviews.map(async (review) => {
          const userDetails = await getUserDetails(review.userId);
          return {
            ...review.toObject(),
            user: userDetails
          };
        })
    );

    const total = await Review.countDocuments({ movieId });

    res.status(200).json({
      reviews: enhancedReviews,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      totalReviews: total
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching reviews', error: err.message });
  }
};

// Get reviews by user
exports.getReviewsByUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Extract user token from request headers
    const authHeader = req.headers.authorization;
    const userToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    console.log('User Token:', userToken);

    // Get basic reviews without populate
    const reviews = await Review.find({ userId });

    // Get movie details for each review
    const enhancedReviews = await Promise.all(
        reviews.map(async (review) => {
          // Forward the user's token when getting movie details
          const movieDetails = await getMovieDetails(review.movieId, userToken);
          return {
            ...review.toObject(),
            movie: movieDetails
          };
        })
    );

    res.status(200).json(enhancedReviews);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching reviews', error: err.message });
  }
};

// Update a review
exports.updateReview = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    // Find the review
    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if the user is the owner of the review
    if (review.userId !== userId) {
      return res.status(403).json({ message: 'You can only update your own reviews' });
    }

    // Update the review
    review.rating = rating || review.rating;
    review.comment = comment || review.comment;

    await review.save();

    res.status(200).json(review);
  } catch (err) {
    res.status(500).json({ message: 'Error updating review', error: err.message });
  }
};

// Delete a review
exports.deleteReview = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const userId = req.user.id;

    // Find the review
    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if the user is the owner of the review
    if (review.userId !== userId) {
      return res.status(403).json({ message: 'You can only delete your own reviews' });
    }

    await Review.findByIdAndDelete(reviewId);

    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting review', error: err.message });
  }
};