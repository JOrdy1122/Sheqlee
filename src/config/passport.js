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
