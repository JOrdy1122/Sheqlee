const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cron = require('node-cron');
const AccountService = require('./src/services/accountServices');

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE_ATLAS;

// mongoose
//     .connect(DB)
//     .then(() =>
//         console.log(
//             'DB connection  to Atlas is successful!'
//         )
//     )
//     .catch((err) =>
//         console.log('DB connection error: ', err)
//     );

mongoose
    .connect(DB, {
        serverSelectionTimeoutMS: 5000, // Timeout to handle slow connections
        connectTimeoutMS: 10000, // Time to wait for a successful connection
    })
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch((err) =>
        console.log('❌ DB Connection Error:', err)
    );
// // Run the deletion process every day at midnight
// cron.schedule('0 0 * * *', async () => {
//     console.log('Running scheduled deletion process...');
//     await AccountService.processDeletionRequests();
// });

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
    console.log(`App running on port ${port}...`);
});
