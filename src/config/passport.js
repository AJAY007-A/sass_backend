const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const prisma = require('./db');

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails[0].value;

                let user = await prisma.user.findUnique({
                    where: { googleId: profile.id },
                    include: { subscription: true },
                });

                if (user) {
                    return done(null, user);
                }

                user = await prisma.user.findUnique({
                    where: { email },
                    include: { subscription: true },
                });

                if (user) {
                    user = await prisma.user.update({
                        where: { email },
                        data: { googleId: profile.id },
                        include: { subscription: true },
                    });
                    return done(null, user);
                }

                user = await prisma.user.create({
                    data: {
                        email,
                        googleId: profile.id,
                        subscription: {
                            create: {
                                plan: 'FREE',
                                status: 'ACTIVE',
                            },
                        },
                    },
                    include: { subscription: true },
                });

                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id },
            include: { subscription: true },
        });
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});
