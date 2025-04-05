const router = require("express").Router();
const associationController = require("../controllers/associationController");
const {specificRole} = require('../middlewares/globalMiddleware')

// User-specific routes should come before parameterized routes
router.get("/user/:userId", specificRole(['admin', 'association']), associationController.getAssociationByUserId);

// Basic CRUD routes
router.post("/", associationController.createAssociation);
router.get("/", associationController.getAllAssociations);
router.get("/:id", associationController.getAssociationById);
router.put("/:id", specificRole(['admin','association']), associationController.updateAssociation);

// Routes for handling voyages within an association
router.post("/:id/voyages", specificRole(['admin','association']), associationController.addVoyageToAssociation);
router.put("/:id/voyages/:voyageId", specificRole(['admin','association']), associationController.updateVoyage);
router.delete("/:id/voyages/:voyageId", specificRole(['admin','association']), associationController.removeVoyageFromAssociation);

// Route for updating association status (admin only)
router.put("/:id/status", specificRole(['admin']), associationController.updateAssociationStatus);

module.exports = router;
