"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = __importDefault(require("../models/User"));
const jwt_1 = require("../utils/jwt");
const zod_1 = require("zod");
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    name: zod_1.z.string().min(2),
    password: zod_1.z.string().min(6),
});
const register = async (req, res) => {
    try {
        const { email, name, password } = registerSchema.parse(req.body);
        const userExists = await User_1.default.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const passwordHash = await bcryptjs_1.default.hash(password, salt);
        const user = await User_1.default.create({
            email,
            name,
            passwordHash,
        });
        const payload = { userId: user._id, email: user.email };
        const accessToken = (0, jwt_1.generateAccessToken)(payload);
        const refreshToken = (0, jwt_1.generateRefreshToken)(payload);
        (0, jwt_1.setRefreshTokenCookie)(res, refreshToken);
        res.status(201).json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                settings: user.settings,
            },
            accessToken,
        });
    }
    catch (error) {
        res.status(400).json({ message: error.message || 'Invalid user data' });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User_1.default.findOne({ email }).select('+passwordHash');
        if (user && (await user.comparePassword(password))) {
            const payload = { userId: user._id, email: user.email };
            const accessToken = (0, jwt_1.generateAccessToken)(payload);
            const refreshToken = (0, jwt_1.generateRefreshToken)(payload);
            (0, jwt_1.setRefreshTokenCookie)(res, refreshToken);
            res.json({
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    settings: user.settings,
                },
                accessToken,
            });
        }
        else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.login = login;
const logout = (req, res) => {
    res.cookie('refreshToken', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({ message: 'Logged out' });
};
exports.logout = logout;
