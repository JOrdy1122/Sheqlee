const express = require('express');
const morgan = require('morgan');
const path = require('path');
const cors = require('cors');
require('./src/config/passport');
const passport = require('passport');
const logger = require('./src/utils/logger');

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
// const listEndpoints = require('express-list-endpoints');

const app = express();

// Enable CORS before your routes
app.use(
    cors({
        //origin: 'http://localhost:3000', // Allow requests from the frontend
    })
);

app.use(passport.initialize());

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
