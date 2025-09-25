import { Router } from "express";
import { UserController } from "./user.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { createZodSchema, updateZodSchema,  } from "./user.validation";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "./user.interface";


const router = Router();

router.post("/register", validateRequest(createZodSchema), UserController.createUser);

router.get("/all-users", checkAuth("ADMIN", "SUPER_ADMIN"), UserController.getAllUsers)

router.patch("/:id", validateRequest(updateZodSchema), checkAuth(...Object.values(Role)), UserController.updateUser)




export const UserRoutes = router;