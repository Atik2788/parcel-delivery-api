/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";


// function type for async handler
type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

// higher order function to catch errors in async functions
export const catchAsync = (fn: AsyncHandler) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err: any) => {
      
        next(err);
    })
}
