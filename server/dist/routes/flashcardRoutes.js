"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const flashcardController_1 = require("../controllers/flashcardController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.use(authMiddleware_1.protect);
router.get('/due', flashcardController_1.getDueFlashcards);
router.get('/stats', flashcardController_1.getFlashcardStats);
router.post('/generate', flashcardController_1.generateFlashcards);
router.put('/:id/progress', flashcardController_1.updateFlashcardProgress);
exports.default = router;
