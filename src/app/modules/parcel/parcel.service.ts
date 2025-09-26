/* eslint-disable @typescript-eslint/no-explicit-any */
import { IAddress, ParcelStatus } from "./parcel.interface";
import { Parcel } from "./parcel.model";
import AppError from "../../errorHelpers/appError";
import { User } from "../user/user.model";
import { validateDeliveryDate } from "./parcel.validation";



interface IParcelCreatePayload {
  type: string;
  weight: number;
  deliveryDate?: Date;
  pickupPhone: string;
  deliveryPhone: string;
  pickupAddress: IAddress;
  deliveryAddress: IAddress;
}

interface IUpdateTrackingPayload {
  trackingId: string;
  currentStatus: ParcelStatus;
}


const createParcel =  async(senderJwt: any, payload: IParcelCreatePayload) => {
    const senderId = senderJwt.userId;

    const sender = await User.findById(senderId);
    if(!sender){
        throw new AppError(404, "Sender not found");
    }
    // console.log("sender from service", sender);

    const {type, weight, deliveryDate, deliveryPhone, pickupPhone, pickupAddress, deliveryAddress} = payload;

    if (!pickupPhone || !deliveryPhone || !deliveryAddress || !pickupAddress) {
    throw new AppError(400, "Sender Phone, Pickup Phone, sender address, and pickup address are required");
  }

    if (deliveryDate && !validateDeliveryDate(deliveryDate)) {
        throw new AppError(400, "Delivery date must be at least 2 days from now");
    }

    if(!type || !weight || !deliveryDate){
        throw new AppError(400, "Type, weight, and delivery date are required to create a parcel");
    }


    const baseFee = 50;
    const perKg = 20;
    const fee = baseFee + weight * perKg;

    const newParcel = await Parcel.create({
        type,
        weight,
        fee,
        sender: {
            userId: sender._id,
            name: sender.name,
            pickupPhone,
            deliveryPhone,
            pickupAddress,
            deliveryAddress,
        },

        currentStatus: ParcelStatus.REQUESTED,
        trackingEvents: [
            {
                status: ParcelStatus.REQUESTED,
                location: `${pickupAddress.area}, ${pickupAddress.postOffice}`,
                note: "Parcel created",
                updatedAt: new Date()
            }
        ]
    })


    // Update sender parcelsSent
    await User.findByIdAndUpdate(sender._id, {
        $push: { parcelsSent: newParcel._id }
    });
    

    return newParcel;

}


const claimParcel = async(parcelId: string, receiver: any, payload: any) => {
    const parcel = await Parcel.findById(parcelId);
    // console.log(payload)

    if(!parcel){
        throw new AppError(404, "Parcel not found");
    }

    if (parcel.currentStatus !== ParcelStatus.REQUESTED && parcel.currentStatus !== ParcelStatus.APPROVED) {
        throw new AppError(400, "Parcel is not available for claiming");
    }

    if(!payload.name || !payload.receiverPhone){
        throw new AppError(400, "Receiver name, and phone are required to claim a parcel");
    }


    // Update parcel with receiver info
    parcel.receiver = {
        userId: receiver.userId,
        name: payload.name,
        receiverPhone: payload.receiverPhone,

        pickupPhone: parcel.sender.pickupPhone,
        deliveryPhone: parcel.sender.deliveryPhone,
        pickupAddress: parcel.sender.pickupAddress,
        deliveryAddress: parcel.sender.deliveryAddress,
    };
 
    parcel.currentStatus = ParcelStatus.DISPATCHED;

        // Add tracking event
    parcel.trackingEvents?.push({
        status: ParcelStatus.DISPATCHED,
        location: `${parcel.sender.pickupAddress.area}, ${parcel.sender.pickupAddress.postOffice}`,
        note: `Parcel claimed by receiver ${payload.name}`,
        updatedAt: new Date(),
    });

    await parcel.save();

    return parcel;

}


const updateTrackingReceiver = async (receiver: any, payload: any) =>{
    const { trackingId, currentStatus, location, note } = payload;
    const parcel = await Parcel.findOne({trackingId: trackingId});

    const invalidStatusesForReceiver = [
        ParcelStatus.REQUESTED,
        ParcelStatus.APPROVED,
        ParcelStatus.DISPATCHED,
        ParcelStatus.BLOCKED,
        ParcelStatus.RETURNED,
        ParcelStatus.CANCELLED,
    ];

    if(!trackingId || !currentStatus){
    throw new AppError(400, "Tracking ID, currentStatus, and location are required to update tracking");
    }

    if(!parcel){
        throw new AppError(404, "Parcel not found");
    }

    if(!parcel.receiver || parcel.receiver.userId?.toString() !== receiver.userId){
        throw new AppError(403, "You are not authorized to update tracking for this parcel");
    }

    // ❌ User cannot send an invalid status
    if (invalidStatusesForReceiver.includes(currentStatus)) {
        throw new AppError(400, `${currentStatus} status cannot be set by receiver`);
    }

    // ❌ If the parcel's currentStatus is one of the invalid statuses, the user cannot update tracking
    if (invalidStatusesForReceiver.includes(parcel.currentStatus)) {
        throw new AppError(400, `Cannot update tracking for a ${parcel.currentStatus} parcel`);
    }


    if (parcel.currentStatus === payload.currentStatus) {
        throw new AppError(400, `Parcel already in ${payload.currentStatus} status`);
    }

    if(parcel.currentStatus === ParcelStatus.DELIVERED){
        throw new AppError(400, `Cannot update tracking for a ${parcel.currentStatus} parcel`);
    }

    if(parcel.currentStatus === ParcelStatus.DISPATCHED && payload.currentStatus !== ParcelStatus.IN_TRANSIT){
        throw new AppError(400, "Now the Parcel Current Status is DISPATCHED, Parcel must be in IN_TRANSIT status to update tracking");
    }
    if(parcel.currentStatus === ParcelStatus.IN_TRANSIT && payload.currentStatus !== ParcelStatus.DELIVERED){
        throw new AppError(400, "Now the Parcel Current Status is IN_TRANSIT, Parcel must be in DELIVERED status to update tracking");
    }

    parcel.trackingEvents?.push({
        status: currentStatus,
        location: location,
        note: note,
        updatedAt: new Date(),
    })

    parcel.currentStatus = currentStatus;

    await parcel.save();

    return parcel;
}

const updateTrackingSender = async (sender: any, payload: IUpdateTrackingPayload) =>{
    const { trackingId, currentStatus } = payload;  

    const parcel = await Parcel.findOne({trackingId: trackingId});



    if(!parcel){
        throw new AppError(404, "Parcel not found");
    }    

    if(!parcel.sender || parcel.sender.userId?.toString() !== sender.userId){
        throw new AppError(403, "You are not authorized to update tracking for this parcel");
    }

    if(currentStatus === ParcelStatus.CANCELLED || currentStatus === ParcelStatus.RETURNED){
        if(parcel.currentStatus === ParcelStatus.DELIVERED && currentStatus === ParcelStatus.CANCELLED){
            throw new AppError(400, "Delivered parcel cannot be cancelled");
        }
        if(parcel.currentStatus !== ParcelStatus.DELIVERED && currentStatus === ParcelStatus.RETURNED){
            throw new AppError(400, "Only delivered parcel can be returned");
        }
        
        parcel.currentStatus = currentStatus;
        await parcel.save();

        return parcel;    
    }

    else{
        throw new AppError(400, "Only CANCELLED or RETURNED status can be set by sender");
    }

}


export const ParcelService = {
    createParcel,
    claimParcel,
    updateTrackingReceiver,
    updateTrackingSender
}
