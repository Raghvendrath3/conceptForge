import express from 'express';
import { getEdges, createEdge, deleteEdge } from '../controllers/edgeController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getEdges)
  .post(createEdge);

router.route('/:id')
  .delete(deleteEdge);

export default router;
