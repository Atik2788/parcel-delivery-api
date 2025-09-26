/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from "mongoose";
import { TErrorSources, TGenericErrorResponse } from "../interfaces/error.types";

export const handleValidationError = (err: mongoose.Error.ValidationError): TGenericErrorResponse =>{
  const errorSouces: TErrorSources[] = [];

    const errors = Object.values(err.errors)
    // console.log("validatation error", errors)


    errors.forEach((errorObject: any) => {
      errorSouces.push({
        path: errorObject.path,
        message: errorObject.message
        
      })
    })

    return {
      statusCode: 400,
      message: "Validation Error",
      errorSouces
      
    }
}