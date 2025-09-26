import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { ParcelController } from "./parcel.controller";

const router = Router()

router.post("/", checkAuth("SENDER"), ParcelController.createParcel);
router.patch("/claim/:id", checkAuth("RECEIVER"), ParcelController.claimParcel);
router.patch("/update-tracking-receiver", checkAuth("RECEIVER"), ParcelController.updateTrackingReceiver);
router.patch("/update-tracking-sender", checkAuth("SENDER"), ParcelController.updateTrackingSender);

export const ParcelRoutes = router;
