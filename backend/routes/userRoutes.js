const express = require('express');
const router = express.Router();
const userController = require('../controllers/userControllers');
const { specificRole } = require('../middlewares/globalMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Public routes
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/validate-token', userController.validateToken);

// Protected routes
router.get('/', (req, res, next) => specificRole(['admin', 'association'])(req, res, next), userController.getAllUsers);
router.get('/:id', (req, res, next) => specificRole(['admin', 'association', 'user'])(req, res, next), userController.getUserById);
router.delete('/:id', (req, res, next) => specificRole(['admin'])(req, res, next), userController.deleteUser);
router.put('/:id', (req, res, next) => specificRole(['admin', 'user'])(req, res, next), userController.updateUser);

// Profile picture upload route
router.put('/:id/profile-picture', 
    (req, res, next) => specificRole(['admin', 'user', 'association'])(req, res, next),
    upload.single('profilePicture'),
    userController.updateProfilePicture
);

module.exports = router;