const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { protect } = require('../middlewares/authMiddleware');

// Public routes
router.get('/', activityController.getActivities);
router.get('/:id', activityController.getActivity);

// Protected routes
router.use(protect);
router.post('/', activityController.createActivity);
router.put('/:id', activityController.updateActivity);
router.delete('/:id', activityController.deleteActivity);
router.post('/:id/reviews', activityController.addReview);

module.exports = router; 