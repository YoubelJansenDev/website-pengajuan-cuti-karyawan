const prisma = require('../config/db');

function countDays(start, end) {
  const s = new Date(start);
  const e = new Date(end);
  e.setHours(23, 59, 59, 999);
  return Math.floor((e - s) / 86400000) + 1;
}

// POST /api/leaves — employee mengajukan cuti
async function createLeave(req, res, next) {
  try {
    const { startDate, endDate, reason } = req.body;
    if (!startDate || !endDate || !reason) {
      return res.status(400).json({ message: 'Tanggal mulai, selesai, dan alasan wajib diisi' });
    }
    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({ message: 'Tanggal selesai tidak boleh sebelum tanggal mulai' });
    }

    const totalDays = countDays(startDate, endDate);

    const user = await prisma.user.findFirst({
      where: { id: req.user.userId, tenantId: req.user.tenantId },
    });
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });

    // Validasi: hitung juga hari yang sedang pending
    const pending = await prisma.leaveRequest.aggregate({
      where: { tenantId: user.tenantId, userId: user.id, status: 'pending' },
      _sum: { totalDays: true },
    });
    const pendingDays = pending._sum.totalDays || 0;

    if (totalDays + pendingDays > user.leaveBalance) {
      return res.status(400).json({
        message: `Sisa jatah cuti tidak cukup (sisa ${user.leaveBalance} hari, termasuk pending ${pendingDays} hari)`,
      });
    }

    const leave = await prisma.leaveRequest.create({
      data: {
        tenantId: req.user.tenantId, // WAJIB dari token
        userId: req.user.userId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        totalDays,
        reason,
        status: 'pending',
      },
    });

    res.status(201).json({ leave });
  } catch (err) {
    next(err);
  }
}

// GET /api/leaves/mine — employee: riwayat pengajuan sendiri
async function myLeaves(req, res, next) {
  try {
    const leaves = await prisma.leaveRequest.findMany({
      where: { tenantId: req.user.tenantId, userId: req.user.userId },
      orderBy: { createdAt: 'desc' },
      include: { reviewer: { select: { name: true } } },
    });
    res.json({ leaves });
  } catch (err) {
    next(err);
  }
}

// GET /api/leaves — admin: semua pengajuan di perusahaannya
async function listLeaves(req, res, next) {
  try {
    const where = { tenantId: req.user.tenantId }; // WAJIB filter tenant
    if (req.query.status) where.status = req.query.status;

    const leaves = await prisma.leaveRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        reviewer: { select: { name: true } },
      },
    });
    res.json({ leaves });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/leaves/:id/approve | /reject
async function reviewLeave(req, res, next) {
  try {
    const { action } = req.params;
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Aksi tidak valid' });
    }

    // SELALU filter tenantId
    const leave = await prisma.leaveRequest.findFirst({
      where: { id: Number(req.params.id), tenantId: req.user.tenantId },
    });
    if (!leave) return res.status(404).json({ message: 'Pengajuan tidak ditemukan' });
    if (leave.status !== 'pending') {
      return res.status(400).json({ message: 'Pengajuan sudah direview' });
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    const updated = await prisma.leaveRequest.update({
      where: { id: leave.id },
      data: {
        status: newStatus,
        reviewedBy: req.user.userId,
        reviewedAt: new Date(),
      },
    });

    // Jika disetujui, kurangi jatah cuti karyawan
    if (newStatus === 'approved') {
      await prisma.user.updateMany({
        where: { id: leave.userId, tenantId: req.user.tenantId },
        data: { leaveBalance: { decrement: leave.totalDays } },
      });
    }

    res.json({ leave: updated });
  } catch (err) {
    next(err);
  }
}

module.exports = { createLeave, myLeaves, listLeaves, reviewLeave };

