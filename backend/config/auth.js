import passport from 'passport';
import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt';
import { User } from '../models/user.model.js';
import 'dotenv/config'

// Custom extractor function to get JWT from cookies
const cookieExtractor = (req) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies['access_token'];
  }
  return token;
};

const options = {
  jwtFromRequest: cookieExtractor,
  secretOrKey: process.env.JWT_ACCESS_SECRET,
};

passport.use(new JWTStrategy(options, async (jwtPayload, done) => {
  try {
    // Find the user by ID
    const user = await User.findById(jwtPayload._id);
    
    if (user) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  } catch (error) {
    return done(error, false);
  }
}));

export default passport;