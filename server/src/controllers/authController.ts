import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { generateAccessToken, generateRefreshToken, setRefreshTokenCookie } from '../utils/jwt';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(6),
});

export const register = async (req: Request, res: Response) => {
  try {
    const { email, name, password } = registerSchema.parse(req.body);

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      email,
      name,
      passwordHash,
    });

    const payload = { userId: (user._id as unknown) as string, email: user.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    setRefreshTokenCookie(res, refreshToken);

    res.status(201).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        settings: user.settings,
      },
      accessToken,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Invalid user data' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+passwordHash');
    if (user && (await user.comparePassword(password))) {
      const payload = { userId: (user._id as unknown) as string, email: user.email };
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);

      setRefreshTokenCookie(res, refreshToken);

      res.json({
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          settings: user.settings,
        },
        accessToken,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const logout = (req: Request, res: Response) => {
  res.cookie('refreshToken', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out' });
};
