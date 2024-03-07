import { Router } from "express";
import { portalController } from "../controller/controller.js";
import { verificarCredenciales, verificarInput } from "../midlewares/midleware.js";

const router = Router();


// POST /usuarios
router.post("/login",  portalController.login);

// POST /register
router.post("/register",  verificarInput, portalController.register);

// GET /servicios
router.get("/servicios", portalController.services);

//POST /user/servicios (ruta privada)
router.post("/user/servicios", verificarCredenciales, portalController.nueva_publicacion);

//GET /user/servicios (ruta privada)
router.get("/user/servicios", verificarCredenciales, portalController.publicaciones_user);

router.all('*', (req, res) => {
    res.status(404).json({ ok: false, message: "404 Pagina no encontrada." });
});

export default router;