"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminRoutes = void 0;
const express_1 = require("express");
const checkAuth_1 = require("../../middlewares/checkAuth");
const admin_controller_1 = require("./admin.controller");
const router = (0, express_1.Router)();
router.get("/all-users", (0, checkAuth_1.checkAuth)("ADMIN", "SUPER_ADMIN"), admin_controller_1.AdminController.getAllUsers);
router.get("/all-parcels", (0, checkAuth_1.checkAuth)("ADMIN", "SUPER_ADMIN"), admin_controller_1.AdminController.getAllPercels);
router.patch("/parcel-block/:id", (0, checkAuth_1.checkAuth)("ADMIN", "SUPER_ADMIN"), admin_controller_1.AdminController.updatePercelIsBlocked);
// super admin er jonno delete route korte hobe
exports.AdminRoutes = router;
