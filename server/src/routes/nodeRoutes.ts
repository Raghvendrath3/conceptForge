import express from 'express';
import { getNodes, createNode, getNodeById, updateNode, deleteNode, importWorkspace, suggestTags, getNodeChildren } from '../controllers/nodeController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getNodes)
  .post(createNode);

router.post('/import', importWorkspace);
router.post('/tags/suggest', suggestTags);

router.route('/:id')
  .get(getNodeById)
  .put(updateNode)
  .delete(deleteNode);

router.get('/:id/children', getNodeChildren as any);

export default router;
