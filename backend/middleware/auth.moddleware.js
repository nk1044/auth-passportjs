import passport from 'passport';

export const auth = passport.authenticate('jwt', { session: false });


const GetCookie = (req, res, next) => {
    const token = req.cookies['jwt'];
    next();
}