import { Router } from "express";
import { UserRoutes } from "../modules/user/user.route";
import { Authroutes } from "../modules/auth/auth.route";
import { ParcelRoutes } from "../modules/parcel/parcel.routes";
import { AdminRoutes } from "../modules/adminPannel/admin.routes";


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
    {
        path: "/parcels",
        route: ParcelRoutes
    },
    {
        path: "/adminRoute",
        route: AdminRoutes
    }

    
]

modulesroute.forEach((route) =>{
    router.use(route.path, route.route)
})