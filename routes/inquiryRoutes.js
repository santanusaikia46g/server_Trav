const express = require('express');
const router = express.Router();
const Inquiry = require('../models/Inquiry');
const { protect } = require('../middleware/auth');

// @route   POST /api/inquiry
// @desc    Submit a new travel inquiry
// @access  Public
router.post('/', async (req, res) => {
  const { name, email, phone, packageId, message } = req.body;

  if (!name || !email || !phone || !message) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    const savedInquiry = await Inquiry.create({
      name,
      email,
      phone,
      packageId: packageId || null,
      message
    });

    res.status(201).json({
      message: 'Inquiry submitted successfully! We will contact you soon.',
      inquiry: savedInquiry
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error submitting inquiry', error: error.message });
  }
});

// @route   GET /api/inquiry
// @desc    Get all inquiries
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const inquiries = await Inquiry.findWithPackage();
    res.json(inquiries);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving inquiries', error: error.message });
  }
});

// @route   PUT /api/inquiry/:id
// @desc    Update status, payment status, or notes of an inquiry
// @access  Private
router.put('/:id', protect, async (req, res) => {
  const { status, paymentStatus, amountPaid, notes } = req.body;

  try {
    const inquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      { status, paymentStatus, amountPaid, notes }
    );

    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }

    res.json(inquiry);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating inquiry status', error: error.message });
  }
});

// @route   DELETE /api/inquiry/:id
// @desc    Delete an inquiry
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const inquiry = await Inquiry.findByIdAndDelete(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }
    res.json({ message: 'Inquiry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting inquiry', error: error.message });
  }
});

module.exports = router;
