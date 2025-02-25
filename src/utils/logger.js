const winston = require('winston');
const path = require('path');

// Define log format
const logFormat = winston.format.printf(
    ({ level, message, timestamp }) => {
        return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    }
);

// Create Winston logger instance
const logger = winston.createLogger({
    level: 'info', // Log only "info" level and above
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        logFormat
    ),
    transports: [
        //  Log errors separately
        new winston.transports.File({
            filename: path.join(
                __dirname,
                '../../logs/error.log'
            ),
            level: 'error',
        }),

        //  Log everything to a general log file
        new winston.transports.File({
            filename: path.join(
                __dirname,
                '../../logs/app.log'
            ),
        }),

        // Also log to the console in development
        new winston.transports.Console(),
    ],
});

module.exports = logger;
