const express = require('express');
const router = express.Router();
const { getAllGigs, createGig, getGigById, getMyGigs, updateGig, deleteGig } = require('../controllers/gigController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getAllGigs);
router.post('/', protect, createGig);

router.get('/my', protect, getMyGigs);

router.get('/:id', getGigById);
router.patch('/:id', protect, updateGig);
router.delete('/:id', protect, deleteGig);

module.exports = router;
