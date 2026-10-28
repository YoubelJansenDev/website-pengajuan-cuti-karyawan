require('dotenv').config();

const app = require('./app');
const prisma = require('./config/db');

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await prisma.$connect();
    console.log('Terhubung ke PostgreSQL (Prisma)');
    app.listen(PORT, () => console.log(`Server berjalan di http://localhost:${PORT}`));
  } catch (err) {
    console.error('Gagal koneksi database:', err.message);
    process.exit(1);
  }
}

start();

