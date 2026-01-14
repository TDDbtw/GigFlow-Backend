const express = require('express');
const router = express.Router();
const { createBid, getBidsByGigId, hireFreelancer, getMyBids, getMyBidOnGig } = require('../controllers/bidController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createBid);

router.get('/my', protect, getMyBids);
router.get('/:gigId/my', protect, getMyBidOnGig);

router.get('/:gigId', protect, getBidsByGigId);
router.patch('/:id/hire', protect, hireFreelancer);

module.exports = router;
