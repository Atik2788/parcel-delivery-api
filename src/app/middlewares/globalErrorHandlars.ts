/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express"
import { envVars } from "../config/env"
import AppError from "../errorHelpers/appError";
import { handleDuplicateError } from "../helpers/handleDuplicateError";
import { handleCastError } from "../helpers/handleCastError";
import { handleZodError } from "../helpers/handleZodError";
import { handleValidationError } from "../helpers/handleValidationError";
import { TErrorSources } from "../interfaces/error.types";



// eslint-disable-next-line no-unused-vars
export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {

  if(envVars.NODE_ENV === "development"){
    console.log("Error: ", err);
  } 

  let errorSouces: TErrorSources[] = []


  let statusCode  = 500;
  let message = "Something went wrong";


    // Duplicate error
  if(err.code === 11000){
    // console.log('Duplicate error', err.message);
    const simplifiedError = handleDuplicateError(err)   
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
  }

  // ObjectID error/ cast error
  else if(err.name === "CastError"){
    const simplifiedError = handleCastError(err)
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
  }

  else if(err.name === "ZodError"){
    const simplifiedError = handleZodError(err)

    errorSouces = simplifiedError.errorSouces as TErrorSources[]
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
  }


  // Mongoose Validation Error
  else if(err.name === "ValidationError"){
    const simplifiedError = handleValidationError(err)

    message = simplifiedError.message;
    statusCode = simplifiedError.statusCode;
    errorSouces = simplifiedError.errorSouces as TErrorSources[]
  }


  else if(err instanceof AppError){
    statusCode = err.statusCode;
    message = err.message;
  } else if(err instanceof Error){
    statusCode = 500;
    message = err.message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorSouces,

    err: envVars.NODE_ENV === "development" ? err : null,
    stack: envVars.NODE_ENV === "development" ? err.stack : null
  })
}