import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET;

export const generateToken = (payload, expiresIn = '1w') => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};
