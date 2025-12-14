"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
const env_1 = require("./app/config/env");
const seedSuperAdmin_1 = require("./app/utils/seedSuperAdmin");
const PORT = Number(process.env.PORT) || Number(env_1.envVars.PORT) || 5000;
let server;
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.connect(env_1.envVars.DB_URL);
        console.log("Database connected successfully");
        // server = app.listen(envVars.PORT, () => {
        //     console.log(`Server is running on port ${envVars.PORT} in ${envVars.NODE_ENV} mode`);
        // })
        server = app_1.default.listen(PORT, "0.0.0.0", () => {
            console.log(`✅ Server is running on port ${PORT} in ${env_1.envVars.NODE_ENV} mode`);
        });
    }
    catch (error) {
        console.error("Error connecting to the database:", error);
    }
});
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield startServer();
    yield (0, seedSuperAdmin_1.seedSuperAdmin)();
}))();
process.on("SIGTERM", () => {
    console.log("SIGTERM signal received, shutting down server...");
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }
    ;
    process.exit(1);
});
process.on("SIGINT", () => {
    console.log("SIGINT signal received, shutting down server...");
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }
    ;
    process.exit(1);
});
process.on("unhandledRejection", (error) => {
    console.log("Unhandled Rejection detected, shutting down server...", error);
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }
    ;
    process.exit(1);
});
process.on("uncaughtException", (error) => {
    console.log("Uncaught Exception detected, shutting down server...", error);
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }
    ;
    process.exit(1);
});
// Promise.reject(new Error("Unhandled Rejection Example"));
