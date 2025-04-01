const jwt = require('jsonwebtoken');

const generateAdminToken = (admin) => {
  return jwt.sign(
    { userId: admin._id, role: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};

module.exports = { generateAdminToken };