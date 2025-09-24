import { User } from "./user.model";
import { IAuthProvider, IUser } from "./user.interface";
import bcryptjs from 'bcryptjs';
import { envVars } from "../../config/env";


const createUser = async(payload: Partial<IUser>) =>{
    const {email, password, ...rest} = payload;

    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    const isUserExist = await User.findOne({email});

    // if(isUserExist){
    //     throw new Error("User already exist");
    // }

    const hashPassword = await bcryptjs.hash(password as string, Number(envVars.BCRYPT_SALT_ROUNDS));
    const authProvider: IAuthProvider = {provider: "credential", providerId: email as string};

    const user = await User.create({
        email,
        password: hashPassword,
        auths: [authProvider],
        ...rest
    });

    return {user};
}


const getAllUsers = async() => {
    const users = await User.find();
    const totalUsers = await User.countDocuments();

    return {
        users,
        totalUsers
    };
}

export const UserService = {
    createUser,
    getAllUsers
}