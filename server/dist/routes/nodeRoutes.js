"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const nodeController_1 = require("../controllers/nodeController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.use(authMiddleware_1.protect);
router.route('/')
    .get(nodeController_1.getNodes)
    .post(nodeController_1.createNode);
router.post('/import', nodeController_1.importWorkspace);
router.post('/tags/suggest', nodeController_1.suggestTags);
router.route('/:id')
    .get(nodeController_1.getNodeById)
    .put(nodeController_1.updateNode)
    .delete(nodeController_1.deleteNode);
router.get('/:id/children', nodeController_1.getNodeChildren);
exports.default = router;
