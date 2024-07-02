import express from 'express';
import { userDetailsUpdate, userInfo } from '../controllers/userControllers';
import {verifyToken} from '../middleware/verifyToken';

const router = express.Router();

router.post('/user-details-update', verifyToken, userDetailsUpdate);
router.post('/user-info', verifyToken, userInfo);


export default router;
