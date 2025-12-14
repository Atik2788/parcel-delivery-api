import { Response } from "express";

export interface AuthTokens {
    accessToken ?: string;
    refreshToken ?: string;
}

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


export const setAuthCookie = (res: Response, tokenInfo: { accessToken: string, refreshToken: string }) => {
    const isProd = process.env.NODE_ENV === "production";

    res.cookie("refreshToken", tokenInfo.refreshToken, {
        httpOnly: true,
        secure: isProd,                 // dev: false
        sameSite: isProd ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
};