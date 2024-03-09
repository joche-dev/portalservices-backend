import { Router } from "express";
import { portalController } from "../controller/controller.js";
import { verifyRegisterUser, verifyCredentials } from "../midlewares/midleware.js";


const router = Router();


// RUTAS PUBLICAS
router.post("/login", portalController.login);

router.post("/register",  verifyRegisterUser, portalController.register);

router.get("/servicios", portalController.getServices);

router.get("/servicios/:id", portalController.getServiceId);


// RUTAS PRIVADAS
router.get("/user/servicios", verifyCredentials, portalController.getServicesByUser);

router.post("/user/servicios", verifyCredentials, portalController.newService);

router.put("/user/servicios", verifyCredentials, portalController.updateService);

router.delete("/user/servicios/:id", verifyCredentials, portalController.updateService);

router.get("/user/favoritos", verifyCredentials, portalController.getFavoritesByUser);

router.delete("/user/favoritos/:id", verifyCredentials, portalController.deleteFavorites);

router.get("/perfil", verifyCredentials, portalController.getProfileUser)

router.put("/perfil", verifyCredentials, portalController.updateProfileUser)



router.all('*', (req, res) => {
    res.status(404).json({ ok: false, message: "404 Pagina no encontrada." });
});

export default router;