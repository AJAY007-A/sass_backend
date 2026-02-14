const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const passport = require('passport');
const routes = require('./routes');
const errorHandler = require('./middleware/errorMiddleware');
const AppError = require('./utils/AppError');

require('./config/passport');

const app = express();

app.use(helmet({
    crossOriginResourcePolicy: false,
}));

app.use(
    cors({
        origin: [
            process.env.FRONTEND_URL || 'http://localhost:3000',
            'http://127.0.0.1:3000',
            'http://localhost:3000'
        ],
        credentials: true,
    })
);

app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    if (req.method === 'POST' && req.body) console.log('Body keys:', Object.keys(req.body));
    next();
});

app.use(passport.initialize());

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Welcome to the SASS Backend API',
        version: '1.0.0'
    });
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.use('/api', routes);

app.use((req, res, next) => {
    next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

app.use(errorHandler);

module.exports = app;
