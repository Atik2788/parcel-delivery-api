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
exports.checkAuth = void 0;
const env_1 = require("../config/env");
const jwt_1 = require("../utils/jwt");
const appError_1 = __importDefault(require("../errorHelpers/appError"));
const user_model_1 = require("../modules/user/user.model");
const user_interface_1 = require("../modules/user/user.interface");
const checkAuth = (...authRoles) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const accessToken = req.headers.authorization;
        if (!accessToken || typeof accessToken !== "string") {
            throw new appError_1.default(403, "Access token not found");
        }
        const verifiedToken = (0, jwt_1.verifyToken)(accessToken, env_1.envVars.JWT_ACCESS_SECRET);
        const user = yield user_model_1.User.findOne({ email: verifiedToken.email });
        if (!user)
            throw new appError_1.default(400, "User does not exist");
        if (user.isActive === user_interface_1.IsActive.BLOCKED || user.isActive === user_interface_1.IsActive.INACTIVE) {
            throw new appError_1.default(400, `User is ${user.isActive}`);
        }
        if (user.isDeleted)
            throw new appError_1.default(400, "User is deleted");
        // Attach user to req first
        req.user = verifiedToken;
        // Case-insensitive role check
        if (authRoles.length && !authRoles.some(r => r.toUpperCase() === verifiedToken.role.toUpperCase())) {
            throw new appError_1.default(403, "Access Denied for You! You are not authorized");
        }
        next();
    }
    catch (err) {
        next(err);
    }
});
exports.checkAuth = checkAuth;
/*
export const checkAuth = (...authRoles: string[]) => async(req: Request, res: Response, next: NextFunction)=>{

    try {
        const accessToken = req.headers.authorization;
        // console.log(accessToken)
        if(!accessToken || typeof accessToken !== "string"){
            throw new AppError(403, "Access token not found")
        }

        
        const verifiToken = verifyToken(accessToken, envVars.JWT_ACCESS_SECRET as string) as JwtPayload;

        const isUserExist = await User.findOne({email: verifiToken.email})

        if(!isUserExist){
            throw new AppError(httpStatus.BAD_REQUEST, "User does not exist")
        }
        if(isUserExist.isActive === IsActive.BLOCKED || isUserExist.isActive === IsActive.INACTIVE){
            throw new AppError(httpStatus.BAD_REQUEST, `User is ${isUserExist.isActive}`)
        }
        if(isUserExist.isDeleted){
            throw new AppError(httpStatus.BAD_REQUEST, "Usrer is deleted")
        }
        
    
        if(!verifiToken){
            throw new AppError(403, `You are not authorized ${verifiToken}`)
        }

        
        if(!authRoles.includes(verifiToken.role)){
            throw new AppError(403, "Access Denied for You! You are not authorized")
        }
        
        req.user = verifiToken;
        next()

    } catch (error) {
        next(error)
    }
}

*/ 
