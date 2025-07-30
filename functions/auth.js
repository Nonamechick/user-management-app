const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('./jsonwebtoken');
const prisma = require('./db');
const router = express.Router();

router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { name, email, password: hashedPassword, status: 'active'}
        });
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET,
        res.json({ token }));
    } catch (error) {
        res.status(500).json({ error: 'Registration failed' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || user.status === 'blocked') {
            return res.status(401).json({ error: 'Invalid credentials or user blocked '});   
        }
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        await prisma.user.update({
            where: { id: user_id },
            data: { last_login: new Date() },
        });
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, 
        res.json({ token }));
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

exports.handler = (event, context, callback) => {
    const app = express();
    app.use(express.json());
    app.use('api/auth', router);
    app(event, context, callback);
};