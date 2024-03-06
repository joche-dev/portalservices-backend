import { Router } from "express";
import { portalController } from "../controller/controller.js";
import { reportarConsulta, verificarCredenciales, verificarInput } from "../midlewares/midleware.js";


const router = Router();


// POST /usuarios
router.post("/login", reportarConsulta, portalController.login);


// POST /register
router.post("/register", reportarConsulta, verificarInput, portalController.register);

// GET /servicios

router.get("/servicios",reportarConsulta, portalController.services);

//GET /user/servicios (ruta privada)

router.get("/user/servicios", reportarConsulta, verificarCredenciales, portalController.publicaciones_user)



export default router;