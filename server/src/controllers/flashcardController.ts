import { Request, Response } from 'express';
import Flashcard from '../models/Flashcard';
import { AuthRequest } from '../middleware/authMiddleware';
import { generateFlashcardsFromContent } from '../services/aiService';

export const getDueFlashcards = async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const flashcards = await Flashcard.find({
      ownerId: req.user._id,
      dueAt: { $lte: now },
    }).sort({ dueAt: 1 });
    res.json(flashcards);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const generateFlashcards = async (req: AuthRequest, res: Response) => {
  try {
    const { nodeId, question, answer, useAI, content } = req.body;

    if (useAI && content) {
      // AI Generation Mode
      try {
        const aiFlashcards = await generateFlashcardsFromContent(content);
        
        const createdCards = await Promise.all(aiFlashcards.map(async (card: any) => {
          return Flashcard.create({
            nodeId,
            ownerId: req.user._id,
            question: card.question,
            answer: card.answer,
          });
        }));

        return res.status(201).json(createdCards);
      } catch (error: any) {
        return res.status(500).json({ message: error.message });
      }
    }

    // Manual Creation Mode
    const flashcard = await Flashcard.create({
      nodeId,
      ownerId: req.user._id,
      question,
      answer,
    });

    res.status(201).json(flashcard);
  } catch (error) {
    res.status(400).json({ message: 'Invalid flashcard data' });
  }
};

export const updateFlashcardProgress = async (req: AuthRequest, res: Response) => {
  try {
    const { quality } = req.body; // 0-5 rating
    const flashcard = await Flashcard.findOne({ _id: req.params.id, ownerId: req.user._id });

    if (!flashcard) return res.status(404).json({ message: 'Flashcard not found' });

    // Simple SM-2 algorithm implementation
    if (quality >= 3) {
      if (flashcard.interval === 0) {
        flashcard.interval = 1;
      } else if (flashcard.interval === 1) {
        flashcard.interval = 6;
      } else {
        flashcard.interval = Math.round(flashcard.interval * flashcard.ease);
      }
      flashcard.ease = flashcard.ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
      if (flashcard.ease < 1.3) flashcard.ease = 1.3;
    } else {
      flashcard.interval = 1;
    }

    const nextDueDate = new Date();
    nextDueDate.setDate(nextDueDate.getDate() + flashcard.interval);
    flashcard.dueAt = nextDueDate;

    await flashcard.save();
    res.json(flashcard);
  } catch (error) {
    res.status(400).json({ message: 'Update failed' });
  }
};

export const getFlashcardStats = async (req: AuthRequest, res: Response) => {
  try {
    const total = await Flashcard.countDocuments({ ownerId: req.user._id });
    const due = await Flashcard.countDocuments({ 
      ownerId: req.user._id,
      dueAt: { $lte: new Date() }
    });
    res.json({ total, due });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
