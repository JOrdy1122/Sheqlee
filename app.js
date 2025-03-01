const express = require('express');
const morgan = require('morgan');
const path = require('path');
const cors = require('cors');
require('./src/config/passport');
const passport = require('passport');
const logger = require('./src/utils/logger');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');

const categoryRouter = require('./src/routes/categoryRoutes');
const tagRouter = require('./src/routes/tagRoutes');
const companyRouter = require('./src/routes/companyRoutes');
const freelancerRouter = require('./src/routes/freelancerRoutes');
const jobRouter = require('./src/routes/jobRoutes');
const userRouter = require('./src/routes/userRoutes');
const deletionRequestRouter = require('./src/routes/deletionRequestRoutes');
const utilsRoutes = require('./src/routes/utilsRoute');
const faqRoutes = require('./src/routes/faqRoutes');
const heroRoutes = require('./src/routes/heroRoutes');
const subscriptionRoutes = require('./src/routes/subscriptionRoutes');
const authRoutes = require('./src/routes/authRoutes');
const pageRoutes = require('./src/routes/pagesRoutes');
const footerRoutes = require('./src/routes/footerRoutes');

const app = express();

// Enable CORS before your routes
app.use(
    cors()
);

app.use(passport.initialize());

// Set security HTTP headers
app.use(helmet());

//Rate Limiting (Prevent Brute Force & DDoS)**
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests, please try again later.',
    headers: true,
});

app.use('/api.sheqlee.com', limiter); // Apply rate limiting to API routes

//Request Size Limiting (Prevent Payload Attacks)**
app.use(express.json({ limit: '10kb' })); // Limit body size

//Prevent Parameter Pollution**
app.use(hpp());

//Prevent NoSQL Injection & XSS Attacks**
app.use(mongoSanitize());
app.use(xss());

//Compression (Reduce Response Size)**
app.use(compression());


// Development logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use(express.json());

// Serve uploaded files
app.use(
    '/uploads',
    express.static(path.join(__dirname, 'uploads'))
);

// Log each request
app.use((req, res, next) => {
    logger.info(
        `[${req.method}] ${req.originalUrl} - ${req.ip}`
    );
    next();
});

///////     Routes    ///////////
app.use(
    '/api.sheqlee.com/v1/deletion-request',
    deletionRequestRouter
);

app.use('/api.sheqlee.com/v1/utils', utilsRoutes); // Used for getting next id for each entity
app.use('/api.sheqlee.com/v1/category', categoryRouter);
app.use('/api.sheqlee.com/v1/tags', tagRouter);
app.use('/api.sheqlee.com/v1/freelancer', freelancerRouter);
app.use('/api.sheqlee.com/v1/company', companyRouter);
app.use('/api.sheqlee.com/v1/jobs', jobRouter);
app.use('/api.sheqlee.com/v1/users', userRouter);
app.use('/api.sheqlee.com/v1/hero', heroRoutes);
app.use('/api.sheqlee.com/v1/faq', faqRoutes);
app.use(
    '/api.sheqlee.com/v1/subcription',
    subscriptionRoutes
);
app.use('/api.sheqlee.com/v1/auth', authRoutes);
app.use('/api.sheqlee.com/v1/pages', pageRoutes);
app.use('/api.sheqlee.com/v1/footers', footerRoutes);

// Global error handling middleware
app.use((err, req, res, next) => {
    logger.error(
        `${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
    );
    res.status(500).json({
        status: 'fail',
        message: 'Internal Server Error',
    });
});
// console.log(listEndpoints(app));
module.exports = app;
