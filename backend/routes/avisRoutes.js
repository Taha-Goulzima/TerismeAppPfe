const express = require("express");
const router = express.Router();
const avisController = require("../controllers/avis");
const { specificRole } = require('../middlewares/globalMiddleware');
const auth = require('../middlewares/auth');

// Get all reviews for a specific voyage
router.get('/voyage/:voyageId', avisController.getVoyageAvis);

// Get all reviews for an association
router.get('/association', auth, avisController.getAssociationAvis);

// Create a new review
router.post('/', auth, avisController.createAvis);

// Delete a review
router.delete('/:id', auth, avisController.deleteAvis);

// Update a review
router.put('/:id', auth, specificRole(['admin', 'association']), avisController.updateAvis);

module.exports = router;
