"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
// Currently mocked - CHANGE THIS:
const connectDB = async () => {
    try {
        // UNCOMMENT THESE LINES:
        const conn = await mongoose_1.default.connect(env_1.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        // DELETE THE MOCK:
        // console.log('MongoDB Connected (Mocked)');
        // return;
    }
    catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
