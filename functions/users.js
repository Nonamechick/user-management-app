const express = require('express');
const prisma = require('./db');
const router = express.Router();

const authMiddleware = async (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token provided' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({ where: { id: decoded.id } });
        if (!user || user.status === 'blocked') {
             return res.status(401).json({ error: 'User not found or blocked' });
        }
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

router.get('/', authMiddleware, async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, name: true, email: true, last_login: true, status: true },
            orderBy: { last_login: 'desc' },
        });
        res.json(users);
    } catch (error) {
        res.status(500).json( { error: 'Failed to fetch users' });
    }
});

router.post('/block', authMiddleware, async (req, res) => {
    const { ids } = req.body;
    try {
        await prisma.user.updateMany({
            where: { id: { in: ids } },
            data: { status: 'blocked'},
        });
        res.json({ message: 'Users blocked' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to block users' });
    }
});

router.post('/unblock', authMiddleware, async (req, res) => {
    const { ids } = req.body;
    try {
        await prisma.user.updateMany({
            where: { id: { in: ids } },
            data: { status: 'active'},
        });
        res.json({ message: "Users unblocked "});
    } catch (error) {
        res.status(500).json({ error: "Failed to unblock users" });
    }
});

router.post('/delete', authMiddleware, async (req, res) => {
    const { ids } = req.body;
    try {
        await prisma.user.deleteMany({ where: { id: { in: ids } } });
        res.json({ message: 'Users deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete users' });
    }
});

exports.handler = (event, context, callback) => {
    const app = express();
    app.use(express.json());
    app.use('/api/users', router);
    app(event, context, callback);
};