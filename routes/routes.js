import { Router } from "express";
import { portalController } from "../controller/controller.js";
import { reportarConsulta, verificarInput } from "../midlewares/midleware.js";

const router = Router();


// POST /usuarios
router.post("/login", reportarConsulta, portalController.login);


// POST /register
router.post("/register", reportarConsulta, verificarInput, portalController.register);

// GET /servicios

router.get("/servicios",reportarConsulta, portalController.services);



export default router;