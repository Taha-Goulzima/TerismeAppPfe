const User = require("../model/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { generateToken, deCoderToken } = require("../config/jwt");
const Association = require("../model/Association");
const Voyage = require("../model/Voyage");

/**
 * @description Validate user token
 * @router /user/validate-token
 * @method GET
 */
module.exports.validateToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = deCoderToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    return res.status(200).json({ valid: true, user });
  } catch (error) {
    console.error('Token validation error:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

/**
 * @description creer un compte
 * @router /user/register
 * @method POST
 */
module.exports.registerUser = async (req, res) => {
  try {
    const { nom, email, phone, role, password } = req.body;

    // Validate required fields
    if (!nom || !email || !phone || !password) {
      return res.status(400).json({ message: "Il faut remplir tous les champs" });
    }

    // Validate password length (must be at least 8 characters)
    if (password.length < 8) {
      return res.status(400).json({ message: "Le mot de passe doit contenir au moins 8 caractères" });
    }

    // Validate phone number format (10-15 digits)
    const phoneRegex = /^\d{10,15}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: "Le numéro de téléphone doit comporter entre 10 et 15 chiffres" });
    }

    // Check if user already exists
    const userExist = await User.findOne({
      $or: [{ email }, { phone }, { nom }],
    });

    if (userExist) {
      if (userExist.email === email) {
        return res.status(400).json({ message: `L'email ${email} existe déjà` });
      }
      if (userExist.phone === phone) {
        return res.status(400).json({ message: `Le numéro de téléphone ${phone} existe déjà` });
      }
      if (userExist.nom === nom) {
        return res.status(400).json({ message: `Le nom ${nom} existe déjà` });
      }
    }

    // Create new user (password will be hashed by the pre-save hook)
    const newUser = new User({
      email,
      phone,
      nom,
      password,
      role: role || "user",
    });

    await newUser.save();

    // Return user without password
    const userResponse = {
      _id: newUser._id,
      email: newUser.email,
      nom: newUser.nom,
      phone: newUser.phone,
      role: newUser.role,
      profilePicture: newUser.profilePicture
    };

    return res.status(201).json({ user: userResponse });
  } catch (error) {
    console.error("⛔ Error Creating User:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: "Error creating user" });
  }
};

/**
 * @description se connecter
 * @router /user/login
 * @method POST
 */
module.exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user);
    return res.status(200).json({
      token,
      user: {
        _id: user._id,
        nom: user.nom,
        email: user.email,
        role: user.role,
        phone: user.phone,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Error during login" });
  }
};

/**
 * @description recuperrer tous les utilisateurs
 * @route /user/
 * @method GET
 */
module.exports.getAllUsers = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = deCoderToken(token);
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Vous n'êtes pas autorisé" });
    }

    const users = await User.find().select("-password");
    
    // For each user with role 'association', find their association
    const usersWithAssociations = await Promise.all(users.map(async (user) => {
      if (user.role === 'association') {
        const association = await Association.findOne({ userId: user._id });
        if (association) {
          return {
            ...user.toObject(),
            associationId: association._id,
            status: association.status
          };
        }
      }
      return user.toObject();
    }));

    return res.status(200).json({ users: usersWithAssociations });
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    return res.status(500).json({ message: "Error fetching users" });
  }
};

/**
 * @description recuperrer un utilisateur par son ID
 * @route /user/:id
 * @method GET
 */
module.exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = deCoderToken(token);
    // Allow access if user is admin or requesting their own data
    if (decoded.role !== "admin" && decoded.id !== id) {
      return res.status(403).json({ message: "Vous n'êtes pas autorisé" });
    }

    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // If user is an association, include association data
    if (user.role === 'association') {
      const association = await Association.findOne({ userId: id });
      if (association) {
        return res.status(200).json({
          ...user.toObject(),
          associationId: association._id,
          status: association.status
        });
      }
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Error in getUserById:", error);
    return res.status(500).json({ message: "Error fetching user" });
  }
};

/**
 * @description supprimer un utilisateur
 * @route /user/:id
 * @method DELETE
 */
module.exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = deCoderToken(token);
    // Vérifier si l'utilisateur est admin ou supprime son propre compte
    if (decoded.role !== "admin" && decoded.id !== id) {
      return res.status(403).json({ message: "Vous n'êtes pas autorisé" });
    }

    // Find the user first to check their role
    const userToDelete = await User.findById(id);
    if (!userToDelete) {
      return res.status(404).json({ message: "L'utilisateur n'existe pas" });
    }

    // If the user is an association, delete their association data first
    if (userToDelete.role === 'association') {
      const association = await Association.findOne({ userId: id });
      if (association) {
        // Delete all voyages associated with this association
        await Voyage.deleteMany({ associationId: association._id });
        // Delete the association
        await Association.findByIdAndDelete(association._id);
      }
    }

    // Delete the user account
    await User.findByIdAndDelete(id);

    return res.status(200).json({ message: "Utilisateur et données associées supprimés avec succès" });
  } catch (error) {
    console.error("Error in deleteUser:", error);
    return res.status(500).json({ message: "Error deleting user and associated data" });
  }
};

/**
 * @description modifier le profil d'un utilisateur
 * @router /user/:id
 * @method PUT
 */
module.exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = deCoderToken(token);
    // Empêcher la modification du rôle sauf pour les admins
    if (updateData.role && decoded.role !== "admin") {
      delete updateData.role;
    }

    const editUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!editUser) {
      return res.status(404).json({ message: "L'utilisateur n'existe pas" });
    }

    return res.status(200).json({ user: editUser });
  } catch (error) {
    console.error("Error in updateUser:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: "Error updating user" });
  }
};

/**
 * @description Update user profile picture
 * @router /user/:id/profile-picture
 * @method PUT
 */
module.exports.updateProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const { id } = req.params;
        const profilePicture = `/uploads/profiles/${req.file.filename}`;

        const user = await User.findByIdAndUpdate(
            id,
            { profilePicture },
            { new: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ 
            message: "Profile picture updated successfully",
            user
        });
    } catch (error) {
        console.error("Error updating profile picture:", error);
        res.status(500).json({ message: "Error updating profile picture" });
    }
};
