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
let server;
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.connect("mongodb+srv://atik2788:AAAAAaaaaa111@cluster0.6du7f.mongodb.net/parcel-delevery-db?retryWrites=true&w=majority&appName=Cluster0");
        console.log("Database connected");
        server = app_1.default.listen(5000, () => {
            console.log("Server is running on port 5000");
        });
    }
    catch (error) {
        console.error("Error connecting to the database:", error);
    }
});
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield startServer();
    // await seedSuperAdmin()
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
