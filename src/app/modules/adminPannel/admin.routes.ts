import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { AdminController } from "./admin.controller";


const router = Router();

router.get("/all-users", checkAuth("ADMIN", "SUPER_ADMIN"), AdminController.getAllUsers);

router.get("/all-parcels", checkAuth("ADMIN", "SUPER_ADMIN"), AdminController.getAllPercels);

router.patch( "/parcel-block/:id", checkAuth("ADMIN", "SUPER_ADMIN"), AdminController.updatePercelIsBlocked);
// super admin er jonno delete route korte hobe


export const AdminRoutes = router;