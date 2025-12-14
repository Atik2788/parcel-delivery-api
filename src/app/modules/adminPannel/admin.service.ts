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

        const totalSuperAdmins = await User.countDocuments({role: "SUPER_ADMIN"})
        const totalAdmins = await User.countDocuments({role: "ADMIN"})
        const totalSenders = await User.countDocuments({role: "SENDER"})
        const totalReceivers = await User.countDocuments({role: "RECEIVER"})

        return {
        users,
        meta:{
            totalUsers,
            totalSuperAdmins,
            totalAdmins,
            totalSenders,
            totalReceivers,
            
            page: 1,
            totalPages: 1,
        }
      }
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

    const totalSuperAdmins = await User.countDocuments({role: "SUPER_ADMIN"})
    const totalAdmins = await User.countDocuments({role: "ADMIN"})
    const totalSenders = await User.countDocuments({role: "SENDER"})
    const totalReceivers = await User.countDocuments({role: "RECEIVER"})

    const pageNumber = Number(page) || 1;


    return {
        users,
        meta:{
            totalUsers,
            totalSuperAdmins,
            totalAdmins,
            totalSenders,
            totalReceivers,

            page: pageNumber,
            totalPages: Math.ceil(totalUsers / limit),  
        }

    };
}

const updatePercelIsBlocked = async(parcelId: string, isBlocked: boolean) => {
    const parcel = await Parcel.findById(parcelId);
    if(!parcel){
        throw new Error("Parcel not found");
    }
    // console.log(isBlocked)

    if(isBlocked === true){        
        if (
            parcel.currentStatus !== "DELIVERED" &&
            parcel.currentStatus !== "CANCELLED"
        ){
            parcel.currentStatus = "BLOCKED" as IParcel["currentStatus"];
            parcel.isBlocked = isBlocked;
        }
        else{
            throw new Error(`This parcel cannot be blocked, because it is already ${parcel.currentStatus} `);
        }
    }

    else if(isBlocked === false){
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

const getAllPercels = async(query: GetUsersQuery) =>{

    if(!query || Object.keys(query).length === 0){
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
                approvedParcels,

                page: 1,
                totalPage: 1,
            }
        }
    }

    const { search, page = 1, limit = 10 } = query;
    const skip = (page -1) * limit

    const filter = search ? {
        $or: [
            { trackingId: { $regex: search, $options: "i" } },
            { type: { $regex: search, $options: "i" } },
            { "sender.name": { $regex: search, $options: "i" } },
            { "receiver.name": { $regex: search, $options: "i" } },
            { currentStatus: { $regex: search, $options: "i" } }
        ]
    } : {};

    const parcels = await Parcel.find(filter).skip(skip).limit(limit);

    // Counts for meta
    const totalParcels = await Parcel.countDocuments(filter);
    const deliveredlParcels = await Parcel.countDocuments({ ...filter, currentStatus: "DELIVERED" });
    const unclaimedParcels = await Parcel.countDocuments({ ...filter, currentStatus: "REQUESTED" });
    const processingParcels = await Parcel.countDocuments({ ...filter, currentStatus: { $in: ["DISPATCHED", "IN_TRANSIT"] } });
    const cancelledParcels = await Parcel.countDocuments({ ...filter, currentStatus: "CANCELLED" });
    const returnedParcels = await Parcel.countDocuments({ ...filter, currentStatus: "RETURNED" });
    const approvedParcels = await Parcel.countDocuments({ ...filter, currentStatus: "APPROVED" });
    const blockedParcels = await Parcel.countDocuments({ ...filter, isBlocked: true });


    const totalPages = Math.ceil(totalParcels / limit);
    const pageNumber = Number(page) || 1;



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
            approvedParcels,

            page: pageNumber, 
            totalPages
        }
    }

}


export const AdminService = {
    getAllUsers,
    updatePercelIsBlocked,
    getAllPercels
}