import Jwt from 'jsonwebtoken';
import bcrypt from "bcryptjs";
import { registrarUsuario, verificarCredencial, obtenerServicios, prepararHATEOAS } from '../database/consultas.js';
import { handleError } from '../handleError/handleError.js';

const login = async (req, res) =>{
    try {
        const { email, contraseña } = req.body
        console.log("contraseña original:", contraseña, typeof contraseña );


        if (!email || !contraseña) {
            throw { message: "email y la constraseña requeridos" };
        }
        const user = await verificarCredencial(email);
        const userContraseña= user.contraseña;
        
        //console.log("userContraseña devuelto de verfificar credenciales: ", userContraseña )
        console.log("contraseña recibido del body: ", contraseña)

        // verifico comparando los passwords
        const validateContraseña = await bcrypt.compare(contraseña, user.contraseña);

        console.log("validatePassword: ", validateContraseña)

        // validacion contraseña
        if (validateContraseña == false) {
            throw {code:401, message: "Contraseña incorrecta del usuario" };
        } 
        
        const token=Jwt.sign({ email, userContraseña }, process.env.JWT_PASSWORD); 
        console.log("Token generado en Login: ", token);
        res.status(200).json({  token: token, 
                                ok:true,
                                message: "login exitoso",
                                usuario: user
                            });
    } catch (error) {
        console.log(error);
        const { status, message } = handleError(error.code);
        return res.status(status).json({ ok: false, result: message })
    }
}

const register = async (req, res) =>{
    try {
        let { nombre, email, contraseña, ciudad, comuna, direccion,  rol } = req.body;
        console.log("password original: ", contraseña);
        console.log("antes de encriptar la contraseña");
        const contraseñaEncriptada = await bcrypt.hash(contraseña, 10);
        console.log("password encriptada: ", contraseñaEncriptada);
        await registrarUsuario(nombre, email, contraseñaEncriptada, ciudad, comuna, direccion, rol);
        res.status(201).json({ok: true, message: "Usuario registrado con exito"});
    } catch (error) {
        const { status, message } = handleError(error.code);
        return res.status(status).json({ ok: false, result: message })
    }
}

const services = async (req, res) => {
    try {
        const {page} = req.query;
        const isPageValid = /^[1-9]\d*$/.test(page);

        if (!isPageValid) {
            return res.status(400).json({ message: "Invalid page number, number > 0" });
        }

        const publicaciones = await obtenerServicios({page});

        const HATEOAS = await prepararHATEOAS(publicaciones, limits, page )
        res.json(HATEOAS); // respuesta del servidor

    } catch (error) {
        const { status, message } = handleError(error.code);
        return res.status(status).json({ ok: false, result: message })
    }
}
export const portalController = {
    register, login, services
}