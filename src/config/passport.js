// const passport = require('passport');
// const GoogleStrategy =
//     require('passport-google-oauth20').Strategy;
// const Freelancer = require('../models/freelancerModel');
// const getNextId = require('../utils/getNextId');
// const Counter = require('../models/counterModel');
// const UserIndex = require('../models/userIndexModel');

// passport.use(
//     new GoogleStrategy(
//         {
//             clientID: process.env.GOOGLE_CLIENT_ID,
//             clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//             callbackURL: process.env.GOOGLE_REDIRECT_URI, // ✅ This must match your .env file
//             passReqToCallback: true,
//         },
//         async (
//             req,
//             accessToken,
//             refreshToken,
//             profile,
//             done
//         ) => {
//             try {
//                 console.log('🔍 Google Profile:', profile);

//                 const { displayName, emails, photos } =
//                     profile;
//                 const email = emails[0].value;
//                 const image = photos[0].value;

//                 // Check if freelancer already exists
//                 let freelancer = await Freelancer.findOne({
//                     email,
//                 });

//                 if (!freelancer) {
//                     // Generate a new freelancer ID
//                     const nextFreelancerId =
//                         await getNextId(
//                             'freelancer',
//                             'FLID'
//                         );

//                     // Create a new freelancer
//                     freelancer = await Freelancer.create({
//                         freelancer_id: nextFreelancerId,
//                         name: displayName,
//                         email: email,
//                         image: image,
//                         isOAuth: true, // Mark as OAuth user
//                     });

//                     // Increment Counter after successful creation
//                     await Counter.findOneAndUpdate(
//                         { name: 'freelancer' },
//                         { $inc: { value: 1 } },
//                         { upsert: true, new: true }
//                     );

//                     // Add to UserIndex for login tracking
//                     await UserIndex.create({
//                         userId: freelancer._id,
//                         email: freelancer.email,
//                         role: 'Freelancer',
//                         modelName: 'Freelancer', // ✅ Ensure modelName is set
//                     });

//                     console.log(
//                         '✅ New freelancer created via Google OAuth'
//                     );
//                 } else {
//                     console.log(
//                         '⚡ Existing freelancer logging in'
//                     );
//                 }

//                 return done(null, freelancer);
//             } catch (err) {
//                 console.error(
//                     '❌ Error in Google OAuth:',
//                     err
//                 );
//                 return done(err, null);
//             }
//         }
//     )
// );

// module.exports = passport;

// const passport = require('passport');
// const GoogleStrategy =
//     require('passport-google-oauth20').Strategy;
// const Freelancer = require('../models/freelancerModel');
// const Company = require('../models/companyModel');
// const getNextId = require('../utils/getNextId');
// const Counter = require('../models/counterModel');
// const UserIndex = require('../models/userIndexModel');

// passport.use(
//     new GoogleStrategy(
//         {
//             clientID: process.env.GOOGLE_CLIENT_ID,
//             clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//             callbackURL: process.env.GOOGLE_REDIRECT_URI, // ✅ Must match .env
//             passReqToCallback: true,
//         },
//         async (
//             req,
//             accessToken,
//             refreshToken,
//             profile,
//             done
//         ) => {
//             try {
//                 console.log('🔍 Google Profile:', profile);

//                 const { displayName, emails, photos } =
//                     profile;
//                 const email = emails?.[0]?.value;
//                 const image = photos?.[0]?.value;

//                 if (!email) {
//                     console.error(
//                         '❌ No email received from Google!'
//                     );
//                     return done(
//                         new Error(
//                             'No email received from Google'
//                         ),
//                         null
//                     );
//                 }

//                 // 🔹 Determine if the request is for Freelancer or Company
//                 let role, Model, idPrefix, counterName;
//                 if (
//                     req.originalUrl.includes(
//                         '/freelancer/auth/google/callback'
//                     )
//                 ) {
//                     role = 'Freelancer';
//                     Model = Freelancer;
//                     idPrefix = 'FLID';
//                     counterName = 'freelancer';
//                 } else if (
//                     req.originalUrl.includes(
//                         '/company/auth/google/callback'
//                     )
//                 ) {
//                     role = 'Company';
//                     Model = Company;
//                     idPrefix = 'CID';
//                     counterName = 'company';
//                 } else {
//                     console.error(
//                         '❌ Invalid OAuth request path!'
//                     );
//                     return done(
//                         new Error(
//                             'Invalid OAuth request path'
//                         ),
//                         null
//                     );
//                 }

//                 console.log(`🔍 Google OAuth for: ${role}`);

//                 // Check if user already exists
//                 let user = await Model.findOne({ email });

//                 if (!user) {
//                     console.log(
//                         `🆕 New ${role} signing up via Google...`
//                     );

//                     // Generate custom ID
//                     let nextUserId;
//                     try {
//                         nextUserId = await getNextId(
//                             role.toLowerCase(),
//                             idPrefix
//                         );
//                     } catch (err) {
//                         console.error(
//                             `❌ Error generating ${role} ID:`,
//                             err
//                         );
//                         return done(err, null);
//                     }

//                     // Create a new user
//                     user = await Model.create({
//                         [`${role.toLowerCase()}_id`]:
//                             nextUserId, // Assign correct custom ID
//                         name: displayName || 'New User',
//                         email: email,
//                         image: image,
//                         isOAuth: true, // Mark as OAuth user
//                     });

//                     console.log(
//                         `✅ New ${role} Created:`,
//                         user
//                     );

//                     // Increment counter after successful creation
//                     try {
//                         await Counter.findOneAndUpdate(
//                             { name: counterName },
//                             { $inc: { value: 1 } },
//                             { upsert: true, new: true }
//                         );
//                         console.log(
//                             `✅ Counter incremented for ${role}`
//                         );
//                     } catch (err) {
//                         console.error(
//                             `❌ Error incrementing ${role} counter:`,
//                             err
//                         );
//                         return done(err, null);
//                     }

//                     // Add to UserIndex
//                     try {
//                         await UserIndex.create({
//                             userId: user._id,
//                             email: user.email,
//                             role: role,
//                             modelName: role,
//                         });
//                         console.log(
//                             `✅ UserIndex entry created for ${role}`
//                         );
//                     } catch (err) {
//                         console.error(
//                             `❌ Error creating UserIndex entry for ${role}:`,
//                             err
//                         );
//                         return done(err, null);
//                     }
//                 } else {
//                     console.log(
//                         `⚡ Existing ${role} logging in via Google.`
//                     );
//                 }

//                 return done(null, user);
//             } catch (err) {
//                 console.error(
//                     '❌ Error in Google OAuth:',
//                     err
//                 );
//                 return done(err, null);
//             }
//         }
//     )
// );

// module.exports = passport;
const passport = require('passport');
const GoogleStrategy =
    require('passport-google-oauth20').Strategy;
const Freelancer = require('../models/freelancerModel');
const Company = require('../models/companyModel');
const getNextId = require('../utils/getNextId');
const Counter = require('../models/counterModel');
const UserIndex = require('../models/userIndexModel');

const handleGoogleUser = async (
    profile,
    role,
    Model,
    idPrefix,
    counterName,
    done
) => {
    try {
        console.log(`🔍 Google OAuth for: ${role}`);

        const { displayName, emails, photos } = profile;
        const email = emails?.[0]?.value;
        const image = photos?.[0]?.value;

        if (!email) {
            console.error(
                '❌ No email received from Google!'
            );
            return done(
                new Error('No email received from Google'),
                null
            );
        }

        // Check if user exists
        let user = await Model.findOne({ email });

        if (!user) {
            console.log(
                `🆕 New ${role} signing up via Google...`
            );

            // Generate custom ID
            let nextUserId;
            try {
                nextUserId = await getNextId(
                    role.toLowerCase(),
                    idPrefix
                );
            } catch (err) {
                console.error(
                    `❌ Error generating ${role} ID:`,
                    err
                );
                return done(err, null);
            }

            // Create new user
            user = await Model.create({
                [`${role.toLowerCase()}_id`]: nextUserId,
                name: displayName || 'New User',
                email: email,
                image: image,
                isOAuth: true,
            });

            console.log(`✅ New ${role} Created:`, user);

            // Increment Counter
            try {
                await Counter.findOneAndUpdate(
                    { name: counterName },
                    { $inc: { value: 1 } },
                    { upsert: true, new: true }
                );
                console.log(
                    `✅ Counter incremented for ${role}`
                );
            } catch (err) {
                console.error(
                    `❌ Error incrementing ${role} counter:`,
                    err
                );
                return done(err, null);
            }

            // Add to UserIndex
            try {
                await UserIndex.create({
                    userId: user._id,
                    email: user.email,
                    role: role,
                    modelName: role,
                });
                console.log(
                    `✅ UserIndex entry created for ${role}`
                );
            } catch (err) {
                console.error(
                    `❌ Error creating UserIndex entry for ${role}:`,
                    err
                );
                return done(err, null);
            }
        } else {
            console.log(
                `⚡ Existing ${role} logging in via Google.`
            );
        }

        return done(null, user);
    } catch (err) {
        console.error('❌ Error in Google OAuth:', err);
        return done(err, null);
    }
};

// Google Strategy for Freelancer
passport.use(
    'google-freelancer',
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL:
                process.env.GOOGLE_FREELANCER_REDIRECT_URI,
            passReqToCallback: true,
        },
        async (
            req,
            accessToken,
            refreshToken,
            profile,
            done
        ) => {
            handleGoogleUser(
                profile,
                'Freelancer',
                Freelancer,
                'FLID',
                'freelancer',
                done
            );
        }
    )
);

// Google Strategy for Company
passport.use(
    'google-company',
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL:
                process.env.GOOGLE_COMPANY_REDIRECT_URI,
            passReqToCallback: true,
        },
        async (
            req,
            accessToken,
            refreshToken,
            profile,
            done
        ) => {
            try {
                console.log('🔍 Google Profile:', profile);
                const { displayName, emails, photos } =
                    profile;
                const email = emails?.[0]?.value;
                const image = photos?.[0]?.value;

                if (!email) {
                    console.error(
                        '❌ No email received from Google!'
                    );
                    return done(
                        new Error(
                            'No email received from Google'
                        ),
                        null
                    );
                }

                let company = await Company.findOne({
                    email,
                });

                if (!company) {
                    console.log(
                        '🆕 New Company signing up via Google...'
                    );

                    let nextUserId = await getNextId(
                        'company',
                        'CID'
                    );

                    company = await Company.create({
                        company_id: nextUserId,
                        companyName: null, // ✅ Can be updated later
                        domain: null, // ✅ Can be updated later
                        fullName: displayName || 'New User',
                        email,
                        image,
                        isOAuth: true, // ✅ Mark as OAuth user
                    });

                    console.log(
                        `✅ New Company Created:`,
                        company
                    );
                } else {
                    console.log(
                        `⚡ Existing Company logging in via Google.`
                    );
                }

                return done(null, company);
            } catch (err) {
                console.error(
                    '❌ Error in Google OAuth:',
                    err
                );
                return done(err, null);
            }
        }
    )
);

module.exports = passport;
