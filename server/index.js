import express from 'express';
import path, { dirname } from 'path';
import compression from 'compression';
import bodyParser from 'body-parser';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import passportJWT from 'passport-jwt';
import history from 'connect-history-api-fallback';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import db from './db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const __package = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));

// environment variables
const port = process.env.PORT || 8080;
const secret = process.env.SECRET;
const appName = __package?.name || String(port);

const info = {
  server: __package.version,
  dir: path.basename(__dirname),
};

const strategy = new passportJWT.Strategy(
  {
    // jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(),
    jwtFromRequest: passportJWT.ExtractJwt.fromExtractors([
      passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(),
      passportJWT.ExtractJwt.fromUrlQueryParameter('jwt'),
    ]),
    secretOrKey: secret,
  },
  (jwtPayload, done) => db
    .getUserDataByID(jwtPayload.sub)
    .then((user) => done(null, user))
    .catch((err) => done(err))
);

const issueToken = (user) => jwt.sign(
  {
    iss: appName,
    sub: user.id,
    iat: new Date().getTime(),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 1,
    // iat: Math.floor(Date.now() / 1000),
    // exp: new Date().setDate(new Date().getDate() + 1),
  },
  secret
);

passport.use(strategy);
const auth = passport.authenticate('jwt', { session: false });
const app = express();

app.use(compression());
app.set('trust proxy', 1);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(history());
app.use(express.static('public'));

app.post('/api/user/login', async (req, res) => {
  const userData = await db.getUserData(req.body.email, req.body.password);
  if (userData && Object.keys(userData).length && !userData?.error) {
    console.log(req.body.email, '<SUCCESS>');
    res.json({
      ...userData,
      ...info,
      token: issueToken(userData),
    });
  } else {
    console.log(`login attempt as [${req.body.email}]•[${req.body.password}]►${userData.error}◄`);
    res.json(userData);
  }
});

app.post('/api/user/reg', async (req, res) => {
  const userdata = req.body;
  userdata.privs = 5; // default privileges
  res.json(await db.createUser(userdata, false));
});

app.get('/api/user/info', auth, async (req, res) => {
  res.json({
    ...req.user,
    ...info,
    token: issueToken(req.user),
  });
});

app.post('/api/user/activate', auth, async (req, res) => {
  res.json(await db.changeActivationStatus(req.user, req.body?.id, Boolean(req.body?.status)));
});

app.post('/api/user/elevate', auth, async (req, res) => {
  res.json(await db.elevateUser(req.user, req.body?.id));
});

app.post('/api/user/update', auth, async (req, res) => {
  res.json(await db.updateUser(req.user, req.body));
});

app.post('/api/user/reset', auth, async (req, res) => {
  res.json(await db.resetPassword(req.user, req.body?.id));
});

app.get('/api/users', auth, async (req, res) => {
  const users = await db.getUsers(req.user, req.query?.id);
  res.json(users);
});

app.get('/api/places/:id', auth, async (req, res) => {
  const places = await db.getFromPlaces(req.user, req.params.id, req.query);
  const stats = await db.getStats();
  res.json({ places, stats });
});

app.listen(port);
console.log(`Backend is at port ${port}`);
