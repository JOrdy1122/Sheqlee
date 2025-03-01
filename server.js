const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cron = require('node-cron');
const logger = require('./src/utils/logger');

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE_ATLAS;

mongoose
    .connect(DB, {
        serverSelectionTimeoutMS: 5000, // Timeout to handle slow connections
        connectTimeoutMS: 10000, // Time to wait for a successful connection
    })
    .then(() => {
        console.log('✅ Connected to MongoDB');
    })
    .catch((err) => {
        console.log('❌ DB Connection Error:', err);
        logger.info('❌ DB Connection Error:');
    });

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
    console.log(`App running on port ${port}...`);
});
