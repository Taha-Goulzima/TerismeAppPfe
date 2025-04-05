const express = require('express');
const router = express.Router();
const userController = require('../controllers/userControllers');
const { specificRole } = require('../middlewares/globalMiddleware');

// Public routes
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/validate-token', userController.validateToken);

// Protected routes
router.get('/', (req, res, next) => specificRole(['admin', 'association'])(req, res, next), userController.getAllUsers);
router.delete('/:id', (req, res, next) => specificRole(['admin'])(req, res, next), userController.deleteUser);
router.put('/:id', (req, res, next) => specificRole(['admin', 'user'])(req, res, next), userController.updateUser);

module.exports = router;