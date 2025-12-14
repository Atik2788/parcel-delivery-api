"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParcelRoutes = void 0;
const express_1 = require("express");
const checkAuth_1 = require("../../middlewares/checkAuth");
const parcel_controller_1 = require("./parcel.controller");
const router = (0, express_1.Router)();
router.post("/", (0, checkAuth_1.checkAuth)("SENDER"), parcel_controller_1.ParcelController.createParcel);
router.patch("/claim/:id", (0, checkAuth_1.checkAuth)("RECEIVER"), parcel_controller_1.ParcelController.claimParcel);
router.patch("/update-tracking-receiver", (0, checkAuth_1.checkAuth)("RECEIVER"), parcel_controller_1.ParcelController.updateTrackingReceiver);
router.patch("/update-tracking-sender", (0, checkAuth_1.checkAuth)("SENDER"), parcel_controller_1.ParcelController.updateTrackingSender);
router.patch("/rating/:trackingId", (0, checkAuth_1.checkAuth)("SENDER", "RECEIVER"), parcel_controller_1.ParcelController.giveRating);
router.patch("/cancel/:parcelId", (0, checkAuth_1.checkAuth)("SENDER"), parcel_controller_1.ParcelController.cancelParcel);
router.get('/my-parcels-sender', (0, checkAuth_1.checkAuth)("SENDER"), parcel_controller_1.ParcelController.getMyParcelsSender);
router.get("/my-parcels-receiver", (0, checkAuth_1.checkAuth)("RECEIVER"), parcel_controller_1.ParcelController.getMyParcelsReceiver);
router.get("/incoming-parcels", (0, checkAuth_1.checkAuth)("RECEIVER"), parcel_controller_1.ParcelController.getIncomingParcels); // UPDATE if any parcel has cancelled it not showing in incoming parcel. 
exports.ParcelRoutes = router;
