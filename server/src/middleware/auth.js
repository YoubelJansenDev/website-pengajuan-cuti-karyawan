const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

// Middleware: verifikasi JWT dan tempelkan req.user = { userId, role, tenantId }
async function auth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Token tidak ditemukan' });

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ message: 'Token tidak valid atau kedaluwarsa' });
    }

    const user = await prisma.user.findFirst({
      where: { id: payload.userId, tenantId: payload.tenantId },
    });
    if (!user) return res.status(401).json({ message: 'User tidak ditemukan' });

    req.user = { userId: user.id, role: user.role, tenantId: user.tenantId };
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = auth;

