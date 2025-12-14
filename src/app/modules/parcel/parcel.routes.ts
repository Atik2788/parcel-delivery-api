import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { ParcelController } from "./parcel.controller";

const router = Router()

router.post("/", checkAuth("SENDER"), ParcelController.createParcel);
router.patch("/claim/:id", checkAuth("RECEIVER"), ParcelController.claimParcel);
router.patch("/update-tracking-receiver", checkAuth("RECEIVER"), ParcelController.updateTrackingReceiver);
router.patch("/update-tracking-sender", checkAuth("SENDER"), ParcelController.updateTrackingSender);
router.patch("/rating/:trackingId", checkAuth("SENDER", "RECEIVER"), ParcelController.giveRating);
router.patch("/cancel/:parcelId", checkAuth("SENDER"), ParcelController.cancelParcel);

router.get('/my-parcels-sender', checkAuth("SENDER"), ParcelController.getMyParcelsSender);
router.get("/my-parcels-receiver", checkAuth("RECEIVER"), ParcelController.getMyParcelsReceiver);
router.get("/incoming-parcels", checkAuth("RECEIVER"), ParcelController.getIncomingParcels);// UPDATE if any parcel has cancelled it not showing in incoming parcel. 



export const ParcelRoutes = router;
