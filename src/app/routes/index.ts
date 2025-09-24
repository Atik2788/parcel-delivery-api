import { Router } from "express";
import { UserRoutes } from "../modules/user/user.route";
import { Authroutes } from "../modules/auth/auth.route";


export const router = Router();

const modulesroute = [
    {
        path: "/users",
        route: UserRoutes
    },
        {
        path: "/auth",
        route: Authroutes
    },
]

modulesroute.forEach((route) =>{
    router.use(route.path, route.route)
})