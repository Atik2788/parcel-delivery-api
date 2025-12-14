import express, { Request, Response } from "express";
import { router } from "./app/routes";
import cookieParser from "cookie-parser";
import cors from "cors";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandlars";
import notFound from "./app/middlewares/notFound";
import passport from "passport";
import { envVars } from "./app/config/env";
import  expressSession  from 'express-session';
import "./app/config/passport";



    const app = express();

    // app.use(expressSession({
    //   secret : envVars.EXPRESS_SESSION_SECRET,
    //   resave: false,
    //   saveUninitialized: false
    // }))

    app.use(cors({
        origin: "http://localhost:3000",
        credentials: true
    }));


    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

        
    app.use(cookieParser());


app.use(expressSession({
  secret: envVars.EXPRESS_SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,               // JS থেকে access যাবে না
    secure: false,                // dev mode
    sameSite: "lax",              // dev এ lax
    maxAge: 7 * 24 * 60 * 60 * 1000
  }
}));
console.log("Refresh token cookie set!");


    app.use(passport.initialize());
    app.use(passport.session());


    app.use("/api/v1", router);




    app.get('/', (req: Request, res: Response) => {
        res.status(200).json({
            message: "Wellcome to Parcel Delivery Service"
        })
    })




    app.use(globalErrorHandler)

    app.use(notFound);

    export default app;
