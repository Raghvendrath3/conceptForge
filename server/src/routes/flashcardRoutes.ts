import express from 'express';
import { getDueFlashcards, generateFlashcards, updateFlashcardProgress, getFlashcardStats } from '../controllers/flashcardController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect);

router.get('/due', getDueFlashcards);
router.get('/stats', getFlashcardStats);
router.post('/generate', generateFlashcards);
router.put('/:id/progress', updateFlashcardProgress);

export default router;
