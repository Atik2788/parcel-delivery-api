"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setAuthCookie = void 0;
// export const setAuthCookie = (res: Response, tokenInfo: AuthTokens) =>{
//     if(tokenInfo.accessToken){
//             res.cookie("accessToken", tokenInfo.accessToken,{
//             httpOnly: true,
//             secure: false
//         })
//     }
//     if(tokenInfo.refreshToken){
//         res.cookie("refreshToken", tokenInfo.refreshToken, {
//             httpOnly: true,
//             secure: false,
//         })
//     }
// }
const setAuthCookie = (res, tokenInfo) => {
    const isProd = process.env.NODE_ENV === "production";
    res.cookie("refreshToken", tokenInfo.refreshToken, {
        httpOnly: true,
        secure: isProd, // dev: false
        sameSite: isProd ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
};
exports.setAuthCookie = setAuthCookie;
