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





/* eslint-disable @typescript-eslint/no-explicit-any */
import jwt from "jsonwebtoken";
import { envVars } from "../../config/env";

const getNewAccessToken = async (refreshToken: string) => {
    try {
        // refresh token verify
        const decoded: any = jwt.verify(refreshToken, envVars.JWT_REFRESH_SECRET as string);

        // new access token generate
        const accessToken = jwt.sign(
            { id: decoded.id },
            envVars.JWT_ACCESS_SECRET as string,
            { expiresIn: "15m" }
        );

        // optional: new refresh token
        const newRefreshToken = jwt.sign(
            { id: decoded.id },
            envVars.JWT_REFRESH_SECRET as string,
            { expiresIn: "7d" }
        );

        return {
            accessToken,
            refreshToken: newRefreshToken
        };

    } catch (err) {
        throw new Error(`Invalid refresh token: ${err}`);
    }
};

export const AuthService = {
    getNewAccessToken
};
