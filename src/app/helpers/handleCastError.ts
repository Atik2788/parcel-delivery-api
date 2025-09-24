import mongoose from "mongoose"
import { TGenericErrorResponse } from "../interfaces/error.types"

export const handleCastError = (err: mongoose.Error.CastError): TGenericErrorResponse =>{
  console.log(err)
  return {
    statusCode : 400,
    message : "Invalid MongoDB Object ID. Please provide a valid ID"
  }
}