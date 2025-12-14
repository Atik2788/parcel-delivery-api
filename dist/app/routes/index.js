"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const user_route_1 = require("../modules/user/user.route");
const auth_route_1 = require("../modules/auth/auth.route");
const parcel_routes_1 = require("../modules/parcel/parcel.routes");
const admin_routes_1 = require("../modules/adminPannel/admin.routes");
exports.router = (0, express_1.Router)();
const modulesroute = [
    {
        path: "/users",
        route: user_route_1.UserRoutes
    },
    {
        path: "/auth",
        route: auth_route_1.Authroutes
    },
    {
        path: "/parcels",
        route: parcel_routes_1.ParcelRoutes
    },
    {
        path: "/adminRoute",
        route: admin_routes_1.AdminRoutes
    }
];
modulesroute.forEach((route) => {
    exports.router.use(route.path, route.route);
});
