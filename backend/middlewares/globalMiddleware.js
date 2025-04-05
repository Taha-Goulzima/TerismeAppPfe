const { getRoleFromToken } = require("../config/jwt");

exports.allRoles = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Token non existant" });
    
    const role = getRoleFromToken(token);
    if (role) next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

exports.onlyAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Token non existant" });
    
    const role = getRoleFromToken(token);
    if (role === "admin") next();
    else return res.status(403).json({ message: "Unauthorized to access" });
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

exports.onlyAssociation = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Token non existant" });
    
    const role = getRoleFromToken(token);
    if (role === "association") next();
    else return res.status(403).json({ message: "Unauthorized to access" });
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

exports.onlyUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Token non existant" });
    
    const role = getRoleFromToken(token);
    if (role === "user") next();
    else return res.status(403).json({ message: "Unauthorized to access" });
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

exports.specificRole = (roles) => async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Token non existant" });
    
    const role = getRoleFromToken(token);
    if (roles.includes(role)) next();
    else return res.status(403).json({ message: "Unauthorized to access" });
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
