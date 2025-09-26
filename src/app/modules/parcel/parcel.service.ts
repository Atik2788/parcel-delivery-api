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
  phone: string;
  address: IAddress;
}


const createParcel =  async(senderJwt: any, payload: IParcelCreatePayload) => {
    const senderId = senderJwt.userId;

    const sender = await User.findById(senderId);
    if(!sender){
        throw new AppError(404, "Sender not found");
    }
    // console.log("sender from service", sender);

    const {type, weight, deliveryDate, phone, address} = payload;

    if(!phone || !address){
        throw new AppError(400, "Phone and address are required");
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
            phone,
            address,
        },

        currentStatus: ParcelStatus.REQUESTED,
        trackingEvents: [
            {
                status: ParcelStatus.REQUESTED,
                location: `${address.area}, ${address.postOffice}`,
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



export const ParcelService = {
    createParcel
}
