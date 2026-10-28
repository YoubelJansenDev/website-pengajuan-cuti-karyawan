// Middleware RBAC sederhana: batasi akses berdasarkan role
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: 'Belum terautentikasi' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Akses ditolak untuk role ini' });
    }
    next();
  };
}

module.exports = requireRole;
