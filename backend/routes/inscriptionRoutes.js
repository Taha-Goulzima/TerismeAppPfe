const router = require("express").Router();
const inscriptionController = require("../controllers/inscriptionController");
const {specificRole} = require('../middlewares/globalMiddleware')

// Put specific routes before parameterized routes
router.get("/user", inscriptionController.getUserInscriptions);
router.post("/", inscriptionController.createInscription);
router.get("/", specificRole(['admin','association']), inscriptionController.getAllInscriptions);
router.get("/:id", specificRole(['admin','association']), inscriptionController.getInscriptionById);
router.put("/:id", inscriptionController.updateInscription);
router.delete("/:id", specificRole(['admin','association']), inscriptionController.deleteInscription);

module.exports = router;
