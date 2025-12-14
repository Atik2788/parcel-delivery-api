"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleZodError = void 0;
const handleZodError = (err) => {
    const errorSouces = [];
    err.issues.forEach((issue) => {
        errorSouces.push({
            path: issue.path.length > 1 && issue.path.reverse().join("inside"),
            message: issue.message
        });
    });
    return {
        statusCode: 400,
        message: "Zod Error",
        errorSouces
    };
};
exports.handleZodError = handleZodError;
