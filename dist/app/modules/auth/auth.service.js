"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
/*import { envVars } from "../../config/env";
import { createNewRefreshTokenWithAccessToken } from "../../utils/userTokens"


const getNewAccessToken = async (refreshToken: string) =>{
   
   const newAccessToken = await createNewRefreshTokenWithAccessToken(refreshToken)

    return {
        accessToken: newAccessToken
    }
}



export const AuthService = {
    getNewAccessToken,
}
*/
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
exports.AuthService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../../config/env");
const getNewAccessToken = (refreshToken) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // refresh token verify
        const decoded = jsonwebtoken_1.default.verify(refreshToken, env_1.envVars.JWT_REFRESH_SECRET);
        // new access token generate
        const accessToken = jsonwebtoken_1.default.sign({ id: decoded.id }, env_1.envVars.JWT_ACCESS_SECRET, { expiresIn: "15m" });
        // optional: new refresh token
        const newRefreshToken = jsonwebtoken_1.default.sign({ id: decoded.id }, env_1.envVars.JWT_REFRESH_SECRET, { expiresIn: "7d" });
        return {
            accessToken,
            refreshToken: newRefreshToken
        };
    }
    catch (err) {
        throw new Error(`Invalid refresh token: ${err}`);
    }
});
exports.AuthService = {
    getNewAccessToken
};
