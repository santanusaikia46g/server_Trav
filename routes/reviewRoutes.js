const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const verifyToken = require('../middleware/authMiddleware');

// @route   GET /api/reviews
// @desc    Get all reviews (public get approved, admin gets all)
router.get('/', async (req, res) => {
  try {
    const { approvedOnly } = req.query;
    const reviews = await Review.find({ approvedOnly: approvedOnly === 'true' });
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching reviews' });
  }
});

// @route   POST /api/reviews
// @desc    Submit a customer review (public or admin)
router.post('/', async (req, res) => {
  try {
    const { customerName, packageTitle, rating, comment } = req.body;
    if (!customerName || !packageTitle || !comment) {
      return res.status(400).json({ message: 'Please provide name, package title, and comment.' });
    }

    const review = await Review.create({
      customerName,
      packageTitle,
      rating: rating || 5,
      comment,
      approved: true
    });

    res.status(201).json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating review' });
  }
});

// @route   PUT /api/reviews/:id
// @desc    Moderate/Update review (Admin protected)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, req.body);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating review' });
  }
});

// @route   DELETE /api/reviews/:id
// @desc    Delete review (Admin protected)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error deleting review' });
  }
});

module.exports = router;
