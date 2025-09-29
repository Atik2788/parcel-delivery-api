/* eslint-disable @typescript-eslint/no-explicit-any */
import { AuthUser, IAddress, ParcelStatus } from "./parcel.interface";
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

const validTransitions: Record<ParcelStatus, ParcelStatus[]> = {
  [ParcelStatus.REQUESTED]: [ParcelStatus.DISPATCHED],
  [ParcelStatus.DISPATCHED]: [ParcelStatus.IN_TRANSIT],
  [ParcelStatus.IN_TRANSIT]: [ParcelStatus.DELIVERED],
  [ParcelStatus.DELIVERED]: [],
  [ParcelStatus.APPROVED]: [],
  [ParcelStatus.BLOCKED]: [],
  [ParcelStatus.RETURNED]: [],
  [ParcelStatus.CANCELLED]: [],
};



const createParcel =  async(senderJwt: AuthUser, payload: IParcelCreatePayload) => {
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


const claimParcel = async(parcelId: string, receiver: AuthUser, payload: any) => {
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


const updateTrackingReceiver = async (receiver: AuthUser, payload: any) =>{
    const { trackingId, currentStatus, location, note } = payload;
    const parcel = await Parcel.findOne({trackingId: trackingId});

    if(!trackingId || !currentStatus){
    throw new AppError(400, "Tracking ID, currentStatus, and location are required to update tracking");
    }

    if(!parcel){
        throw new AppError(404, "Parcel not found");
    }

    if (parcel?.receiver?.userId?.toString() !== receiver.userId.toString()) {
        throw new AppError(403, "You are not authorized to update tracking for this parcel");
    }

      // 🚫 Invalid statuses
    const invalidStatusesForReceiver = [
        ParcelStatus.APPROVED,
        ParcelStatus.BLOCKED,
        ParcelStatus.RETURNED,
        ParcelStatus.CANCELLED,
    ];

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

    const allowedNext = validTransitions[parcel.currentStatus as ParcelStatus] || [];
    if (!allowedNext.includes(currentStatus)) {
        throw new AppError(400, `Invalid transition: ${parcel.currentStatus} → ${currentStatus}. Allowed: ${allowedNext.join(", ") || "none"}`);
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

const updateTrackingSender = async (sender: AuthUser, payload: IUpdateTrackingPayload) =>{
    const { trackingId, currentStatus } = payload; 
    const senderId = sender.userId 

    const parcel = await Parcel.findOne({trackingId: trackingId});
    const parcelSenderId = parcel?.sender.userId;

    if(!parcel){
        throw new AppError(404, "Parcel not found");
    }    

    if (!parcel.sender || parcelSenderId?.toString() !== senderId.toString()) {
        throw new AppError(403, "You are not authorized to update tracking for this parcel");
    }


    if(currentStatus !== ParcelStatus.CANCELLED && currentStatus !== ParcelStatus.RETURNED){
        throw new AppError(400, "Only CANCELLED or RETURNED status can be set by sender");
    }

    // ✅ Rule system
    if (currentStatus === ParcelStatus.CANCELLED) {
        if (parcel.currentStatus === ParcelStatus.CANCELLED) {
            throw new AppError(400, "Parcel already in CANCELLED status");
        }
        if (
            [ParcelStatus.DISPATCHED, ParcelStatus.IN_TRANSIT, ParcelStatus.DELIVERED, ParcelStatus.RETURNED].includes(parcel.currentStatus)
        ) {
            throw new AppError(400, `Cannot cancel a ${parcel.currentStatus} parcel`);
        }
    }

    if (currentStatus === ParcelStatus.RETURNED) {
        if (parcel.currentStatus === ParcelStatus.RETURNED) {
            throw new AppError(400, "Parcel already in RETURNED status");
        }
        if (parcel.currentStatus !== ParcelStatus.DELIVERED) {
            throw new AppError(400, "Only delivered parcel can be returned");
        }
    }

    // ✅ Update
    parcel.currentStatus = currentStatus;
    await parcel.save();

    return parcel;

}

const giveRating = async (trackingId: string, user : AuthUser, rating: number, feedback: string) =>{
    // console.log(user.role)
  const parcel = await Parcel.findOne({ trackingId });
  if (!parcel) {
    throw new AppError(404, "Parcel not found");
  }

  if (parcel.currentStatus !== ParcelStatus.DELIVERED) {
    throw new AppError(400, "Cannot give rating before parcel is delivered");
  }

  // role based save
  if (user.role === "SENDER") {

    if (parcel.sender.userId.toString() !== user.userId.toString()) {
      throw new AppError(403, "You are not authorized to rate this parcel");
    }

    if (!parcel.ratings) {
        parcel.ratings = {}
    }
    parcel.ratings.senderToReceiver = { rating, feedback };
  } 
  
  else if (user.role === "RECEIVER") {
    if(!parcel.receiver?.userId){
        throw new AppError(400, "Receiver information is missing for this parcel");
    }
    if (parcel.receiver.userId.toString() !== user.userId.toString()) {
      throw new AppError(403, "You are not authorized to rate this parcel");
    }
    if (!parcel.ratings) {
        parcel.ratings = {}
    }
    parcel.ratings.receiverToSender = { rating, feedback };
  } else {
    throw new AppError(400, "Invalid role");
  }

  await parcel.save();

  return parcel;
}

const getMyParcelsSender = async(sender: AuthUser ) => {
    if(!sender.userId){
        throw new AppError(400, "Sender ID missing");
    }

    const filter = {"sender.userId": sender.userId}
    const parcels = await Parcel.find(filter)
        .populate("receiver.userId", "name email") // চাইলে receiver এর info আনতে পারো
      .populate("sender.userId", "name email")   // sender এর info confirm করার জন্য
      .sort({ createdAt: -1 });
      
    const totalCount = await Parcel.countDocuments(filter);

    const deliveredCount = await Parcel.countDocuments({"currentStatus": "DELIVERED"});   
    const cancelledCount = await Parcel.countDocuments({"currentStatus": "CANCELLED"});
    const returnedCount = await Parcel.countDocuments({"currentStatus": "RETURNED"});
    const approvedCount = await Parcel.countDocuments({"currentStatus": "APPROVED"});
    const unclaimed = await Parcel.countDocuments({"currentStatus": "REQUESTED"});
    const blockedCount = await Parcel.countDocuments({isBlocked: true}); 
    const inTransit = await Parcel.countDocuments({"currentStatus": "IN_TRANSIT" });
    const dispatched = await Parcel.countDocuments({"currentStatus":  "DISPATCHED"});

      return {
        parcels,
        meta: {
            totalCount,
            deliveredCount,
            cancelledCount,
            returnedCount,
            approvedCount,
            blockedCount,
            unclaimed,
            inTransit,
            dispatched,
        }
      };
}

const getMyParcelsReceiver = async(receiver: AuthUser) => {
    const filter = {"receiver.userId": receiver.userId}
    const parcels = await Parcel.find(filter)

    const totalParcel = await Parcel.countDocuments(filter);

    const deliveredCount = await Parcel.countDocuments({"currentStatus": "DELIVERED"});
    const inTransit = await Parcel.countDocuments({"currentStatus": "IN_TRANSIT"});
    const dispatched = await Parcel.countDocuments({"currentStatus": "DISPATCHED"});
    const blocked = await Parcel.countDocuments({"currentStatus": "BLOCKED"});
    const returned = await Parcel.countDocuments({"currentStatus": "RETURNED"});

    return {
        parcels, 
        meta: {
            totalParcel,
            deliveredCount,
            inTransit,
            dispatched,
            blocked,
            returned

        }
    }
}

const getIncomingParcels = async() => {
    const filter = {"receiver.userId": {$exists: false}}

    const parcels = await Parcel.find(filter)
                     .populate("sender.userId", "name email") // sender info useful for receiver 
                    .sort({ createdAt: -1 });

    const totalCount = await Parcel.countDocuments(filter);

    return {
        parcels, totalCount
    };

}

const cancelParcel = async(parcelId: string, sender: AuthUser) => {
    console.log("parcel id", parcelId)
    const parcel = await Parcel.findById(parcelId);

    if(!parcel){
        throw new AppError(404, "Parcel not found");
    }

    if(parcel.sender.userId.toString() !== sender.userId.toString()){
        throw new AppError(403, "You are not authorized to cancel this parcel");    
    }

    if(parcel.currentStatus === ParcelStatus.CANCELLED){
        throw new AppError(400, "Parcel already in CANCELLED status");
    }

    if([ParcelStatus.DISPATCHED, ParcelStatus.IN_TRANSIT, ParcelStatus.DELIVERED, ParcelStatus.RETURNED].includes(parcel.currentStatus)){
        throw new AppError(400, `Cannot cancel a ${parcel.currentStatus} parcel`);
    }

    parcel.currentStatus = ParcelStatus.CANCELLED;
    await parcel.save();

    return parcel;
}

export const ParcelService = {
    createParcel,
    claimParcel,
    updateTrackingReceiver,
    updateTrackingSender,
    giveRating,
    getMyParcelsSender,
    getIncomingParcels,
    cancelParcel,
    getMyParcelsReceiver
}

