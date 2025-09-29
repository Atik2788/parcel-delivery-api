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