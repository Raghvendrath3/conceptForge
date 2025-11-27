"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const db_1 = require("./config/db");
const env_1 = require("./config/env");
const http_1 = require("http");
const socketManager_1 = require("./sockets/socketManager");
const server = (0, http_1.createServer)(app_1.default);
const io = (0, socketManager_1.initSocket)(server);
const start = async () => {
    try {
        await (0, db_1.connectDB)();
        server.listen(env_1.env.PORT, () => {
            console.log(`Server running on port ${env_1.env.PORT}`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
start();
