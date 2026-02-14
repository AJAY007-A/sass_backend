require('dotenv').config();
const app = require('./app');
const prisma = require('./config/db');

const PORT = process.env.PORT || 5000;

const start = async () => {
    await prisma.$connect();
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
};

start().catch(() => {
    process.exit(1);
});

process.on('SIGTERM', async () => {
    await prisma.$disconnect();
    process.exit(0);
});

process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
});

process.on('unhandledRejection', async () => {
    await prisma.$disconnect();
    process.exit(1);
});
