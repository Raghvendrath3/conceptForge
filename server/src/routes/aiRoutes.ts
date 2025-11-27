import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { autoConnectNodes } from '../controllers/aiController';

const router = Router();

router.post('/connect', protect, autoConnectNodes);

export default router;
