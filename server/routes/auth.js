import express from 'express';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import { sendEmail } from '../utils/email.js';

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// REGISTER

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email and password required' });
    }

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    const user = new User({ username, email, password });
    await user.save();

    // Optional: Send welcome email
    try {
      await sendEmail(
        email,
        'Welcome to Meru Rooms',
        `<h2>Welcome, ${username}!</h2><p>Start posting vacant rooms near Meru University and help fellow comrades find accommodation easily.</p>`
      );
    } catch (e) {
      console.log('Welcome email failed:', e.message);
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (err) {
    console.error('REGISTER ERROR:', err);
    res.status(400).json({ message: err.message });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (err) {
    console.error('LOGIN ERROR:', err);
    res.status(500).json({ message: err.message });
  }
});

// FORGOT PASSWORD — send code via email
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: 'If this email is registered, a reset code has been sent.' });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetCode = code;
    user.resetCodeExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendEmail(
      email,
      'Meru Rooms Password Reset',
      `<h2>Password Reset</h2><p>Your reset code is: <strong>${code}</strong></p><p>This code expires in 10 minutes.</p>`
    );

    res.json({ message: 'If this email is registered, a reset code has been sent.' });
  } catch (err) {
    console.error('FORGOT PASSWORD ERROR:', err);
    res.status(500).json({ message: 'Failed to send reset code' });
  }
});

// RESEND CODE
router.post('/resend-code', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: 'If this email is registered, a reset code has been sent.' });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetCode = code;
    user.resetCodeExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendEmail(
      email,
      'Meru Rooms Password Reset',
      `<h2>Password Reset</h2><p>Your new reset code is: <strong>${code}</strong></p><p>This code expires in 10 minutes.</p>`
    );

    res.json({ message: 'New code sent' });
  } catch (err) {
    console.error('RESEND ERROR:', err);
    res.status(500).json({ message: 'Failed to resend code' });
  }
});

// RESET PASSWORD
router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: 'Email, code and new password required' });
    }

    const user = await User.findOne({
      email,
      resetCode: code,
      resetCodeExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired code' });

    user.password = newPassword;
    user.resetCode = null;
    user.resetCodeExpires = null;
    await user.save();

    res.json({ message: 'Password reset successful. You can now login.' });
  } catch (err) {
    console.error('RESET ERROR:', err);
    res.status(500).json({ message: err.message });
  }
});


// GOOGLE OAUTH LOGIN / REGISTER
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      return res.status(400).json({ message: 'Google account email not available' });
    }

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (!user) {
      // Create new user from Google data
      const randomPassword = Math.random().toString(36).slice(-16) + Date.now().toString(36);
      user = new User({
        username: name || email.split('@')[0],
        email,
        password: randomPassword,
        googleId,
      });
      await user.save();

      // Optional welcome email
      try {
        await sendEmail(
          email,
          'Welcome to Meru Rooms',
          `<h2>Welcome, ${user.username}!</h2><p>You signed up with Google. Start posting vacant rooms near Meru University and help fellow comrades find accommodation easily.</p>`
        );
      } catch (e) {
        console.log('Welcome email failed:', e.message);
      }
    } else if (!user.googleId) {
      // Existing email user — link Google to their account
      user.googleId = googleId;
      await user.save();
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (err) {
    console.error('GOOGLE AUTH ERROR:', err);
    res.status(400).json({ message: 'Google authentication failed' });
  }
});


export default router;
