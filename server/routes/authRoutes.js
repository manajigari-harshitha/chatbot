import express from 'express';
import { signup, verifyOtp, verifyOtpForgot, login, logout, sendOtp } from '../controllers/authController.js';
import { verifyToken } from '../middleware/verifyToken.js';
const router = express.Router();

router.post('/signup', signup);
router.post('/verify-otp', verifyOtpForgot);
router.post('/send-otp', sendOtp);
router.post('/verifyotp', verifyOtp);
router.post('/login', login);
router.post('/logout',verifyToken,  logout);


export default router;
