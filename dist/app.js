"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const routes_1 = require("./app/routes");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const globalErrorHandlars_1 = require("./app/middlewares/globalErrorHandlars");
const notFound_1 = __importDefault(require("./app/middlewares/notFound"));
const passport_1 = __importDefault(require("passport"));
const env_1 = require("./app/config/env");
const express_session_1 = __importDefault(require("express-session"));
require("./app/config/passport");
const app = (0, express_1.default)();
// app.use(expressSession({
//   secret : envVars.EXPRESS_SESSION_SECRET,
//   resave: false,
//   saveUninitialized: false
// }))
const allowedOrigins = [
    "http://localhost:3000",
    process.env.FRONTEND_URL,
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true); // Postman / server-to-server
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error("CORS not allowed"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use((0, express_session_1.default)({
    secret: env_1.envVars.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true, // JS থেকে access যাবে না
        secure: false, // dev mode
        sameSite: "lax", // dev এ lax
        maxAge: 7 * 24 * 60 * 60 * 1000
    }
}));
console.log("Refresh token cookie set!");
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.use("/api/v1", routes_1.router);
app.get('/', (req, res) => {
    res.status(200).json({
        message: "Wellcome to Parcel Delivery Service"
    });
});
app.use(globalErrorHandlars_1.globalErrorHandler);
app.use(notFound_1.default);
exports.default = app;
