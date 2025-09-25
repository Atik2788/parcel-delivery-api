import { envVars } from "../config/env"
import { IAuthProvider, IUser, Role } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model"
import  bcryptjs  from 'bcryptjs';

export const seedSuperAdmin = async() =>{
    console.log("Seeding Super Admin...");

    try {
        const isSuperAdminExist = await User.findOne({email: envVars.SUPER_ADMIN_EMAIL} )

        if(isSuperAdminExist){
            console.log("Super Admin already exist!!")
            return
        }

        // console.log("Trying to Creating Super Admin...")

        const hashedPassword = await bcryptjs.hash(envVars.SUPER_ADMIN_PASSWORD as string, Number(process.env.BCRYPT_SALT_ROUND))

        const auhProvider: IAuthProvider ={
            provider: "credential",
            providerId: envVars.SUPER_ADMIN_EMAIL as string
        }


        const payload: IUser = {
            name: "Super Admin",
            role: Role.SUPER_ADMIN,
            email: envVars.SUPER_ADMIN_EMAIL as string,
            password: hashedPassword,
            isValidated: true,
            age: 30,
            auths: [auhProvider]
        }

        const superAdmin = await User.create(payload)
        console.log("Super Admin created successfully!! \n", superAdmin)

    } catch (error) {
        console.log(error)
    }
}