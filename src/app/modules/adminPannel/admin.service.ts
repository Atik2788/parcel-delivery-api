import { IParcel } from "../parcel/parcel.interface";
import { Parcel } from "../parcel/parcel.model";
import { User } from "../user/user.model";


export interface GetUsersQuery {
  search?: string;  // for filtering by name
  page?: number;
  limit?: number;
}

const getAllUsers = async(query: GetUsersQuery) => {

    if(!query || Object.keys(query).length === 0){
         const users = await User.find();
        const totalUsers = await User.countDocuments();

        return {
        users,
        totalUsers,
        page: 1,
        totalPages: 1,
        };
    }

    const { search, page = 1, limit = 10 } = query;
    const skip = (page -1) * limit;


    const filter = search ? {
        $or: [
            {name: {$regex: search, $options: "i"}},
            {email: {$regex: search, $options: "i"}},
            {role: {$regex: search, $options: "i"}},
            {phone: {$regex: search, $options: "i"}},
            { "receiver.name": { $regex: search, $options: "i" } },
            { "sender.name": { $regex: search, $options: "i" } },        
        ]
    } : {};

    const users = await User.find(filter).skip(skip).limit(limit);
    const totalUsers = await User.countDocuments(filter);


    return {
        users,
        totalUsers,
        page,
        totalPages: Math.ceil(totalUsers / limit),  
    };
}

const updatePercelIsBlocked = async(parcelId: string, isBlocked: boolean) => {
    const parcel = await Parcel.findById(parcelId);
    if(!parcel){
        throw new Error("Parcel not found");
    }

    if(isBlocked === true){        
        if (
            parcel.currentStatus !== "DELIVERED" &&
            parcel.currentStatus !== "CANCELLED"
        ){
            parcel.currentStatus = "BLOCKED" as IParcel["currentStatus"];
            parcel.isBlocked = isBlocked;
        }
        else{
            throw new Error("This parcel cannot be blocked, because it is already completed.");
        }
    }

    if(isBlocked === false){
        parcel.isBlocked = isBlocked;

        const lastEvents = parcel.trackingEvents?.[parcel.trackingEvents.length - 1];
        if(lastEvents){
            parcel.currentStatus = lastEvents.status as IParcel["currentStatus"];
        }
        else {
            parcel.currentStatus = "APPROVED" as IParcel["currentStatus"];
        }
    }else {
        throw new Error("Invalid isBlocked value. Must be true or false.");
    }


    await parcel.save();

    return parcel
}

const getAllPercels = async() =>{
    const parcels = await Parcel.find();


    const totalParcels = await Parcel.countDocuments();
    const deliveredlParcels = await Parcel.countDocuments({currentStatus: "DELIVERED"});
    const unclaimedParcels = await Parcel.countDocuments({currentStatus: "REQUESTED"});
    const processingParcels = await Parcel.countDocuments({currentStatus: {$in: (["DISPATCHED", "IN_TRANSIT"])} });
    const cancelledParcels = await Parcel.countDocuments({currentStatus: "CANCELLED"});
    const returnedParcels = await Parcel.countDocuments({currentStatus: "RETURNED"});
    const approvedParcels = await Parcel.countDocuments({currentStatus: "APPROVED"});
    const blockedParcels = await Parcel.countDocuments({isBlocked: true});



    return {
        parcels,
        meta: {
            totalParcels,
            deliveredlParcels,
            unclaimedParcels,
            processingParcels,
            cancelledParcels,
            returnedParcels,
            blockedParcels,
            approvedParcels
        }
    }
}


export const AdminService = {
    getAllUsers,
    updatePercelIsBlocked,
    getAllPercels
}