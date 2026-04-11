/**
 * authController.js
 * Handles user registration, login, and profile retrieval.
 * Stores users in backend/data/users.json (no database required).
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const USERS_FILE = path.join(__dirname, '../../data/users.json');
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-please-change-in-production';
const JWT_EXPIRES = '7d';

// ─── File helpers ─────────────────────────────────────────────────────────────

const readUsers = () => {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      fs.mkdirSync(path.dirname(USERS_FILE), { recursive: true });
      fs.writeFileSync(USERS_FILE, JSON.stringify({ users: [] }, null, 2));
    }
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
  } catch {
    return { users: [] };
  }
};

const writeUsers = (data) => {
  fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
};

const makeToken = (user) =>
  jwt.sign({ id: user.id, username: user.username, email: user.email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES,
  });

const safeUser = (u) => ({ id: u.id, username: u.username, email: u.email, createdAt: u.createdAt });

// ─── Controllers ─────────────────────────────────────────────────────────────

/** POST /api/auth/register */
const register = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required.' });
  }
  if (username.trim().length < 2) {
    return res.status(400).json({ error: 'Username must be at least 2 characters.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  const { users } = readUsers();

  if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ error: 'This email is already registered. Please log in.' });
  }

  const hashed = await bcrypt.hash(password, 10);
  const newUser = {
    id: crypto.randomUUID(),
    username: username.trim(),
    email: email.toLowerCase().trim(),
    password: hashed,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  writeUsers({ users });

  const token = makeToken(newUser);
  return res.status(201).json({ token, user: safeUser(newUser) });
};

/** POST /api/auth/login */
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const { users } = readUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());

  if (!user) {
    return res.status(400).json({ error: 'Invalid email or password.' });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(400).json({ error: 'Invalid email or password.' });
  }

  const token = makeToken(user);
  return res.json({ token, user: safeUser(user) });
};

/** GET /api/auth/me  (requires auth middleware) */
const getMe = (req, res) => {
  return res.json({ user: req.user });
};

module.exports = { register, login, getMe };
