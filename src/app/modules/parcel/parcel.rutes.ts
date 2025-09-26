import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { ParcelController } from "./parcel.controller";

const router = Router()

router.post("/", checkAuth("SENDER"), ParcelController.createParcel);
// router.post("/:id/claim", checkAuth("RECEIVER"), ParcelController.createParcel);
// router.patch("/:id/status", checkAuth("ADMIN", "SUPER_ADMIN"), updateParcelStatus);


export const ParcelRoutes = router;
