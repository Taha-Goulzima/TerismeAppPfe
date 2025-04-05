const jwt = require("jsonwebtoken");

const generateToken = (user) => {
    return jwt.sign(
      { 
        id: user._id,
        role: user.role,
        email: user.email
      }, 
      process.env.JWT_SECRET, 
      {
        expiresIn: "7d",
      }
    );
};

const deCoderToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        console.error('Token verification error:', error);
        return null;
    }
};

const getRoleFromToken = (token) => {
    try {
        const decoded = deCoderToken(token);
        return decoded?.role;
    } catch (error) {
        console.error('Error getting role from token:', error);
        return null;
    }
};

module.exports = { generateToken, deCoderToken, getRoleFromToken };
