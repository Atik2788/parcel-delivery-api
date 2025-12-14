"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleValidationError = void 0;
const handleValidationError = (err) => {
    const errorSouces = [];
    const errors = Object.values(err.errors);
    // console.log("validatation error", errors)
    errors.forEach((errorObject) => {
        errorSouces.push({
            path: errorObject.path,
            message: errorObject.message
        });
    });
    return {
        statusCode: 400,
        message: "Validation Error",
        errorSouces
    };
};
exports.handleValidationError = handleValidationError;
