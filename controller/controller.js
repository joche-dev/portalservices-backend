import Jwt from 'jsonwebtoken';
import bcrypt from "bcryptjs";
import { registrarUsuario, verificarCredencial, obtenerServicios, prepararHATEOAS, obtenerPublicaciones, agregar_publicacion } from '../database/consultas.js';
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
        
        const token=Jwt.sign({ email }, process.env.JWT_PASSWORD); 
        console.log("Token generado en Login: ", token);
        res.status(200).json({  token: token, 
                                ok:true,
                                message: "login exitoso",
                                usuario: user
                            });
    } catch (error) {
        console.log(error);
        const { status, message } = handleError(error.code);
        return res.status(status).json({ ok: false, message: message })
    }
}

const register = async (req, res) =>{
    try {
        let { nombre, email, contraseña, ciudad, comuna, direccion = '',  rol='user' } = req.body;
        console.log("password original: ", contraseña);
        console.log("antes de encriptar la contraseña");

        const contraseñaEncriptada = await bcrypt.hash(contraseña, 10);
        console.log("password encriptada: ", contraseñaEncriptada);
        await registrarUsuario(nombre, email, contraseñaEncriptada, ciudad, comuna, direccion, rol);
        res.status(201).json({ok: true, message: "Usuario registrado con exito"});
    } catch (error) {
        const { status, message } = handleError(error.code);
        return res.status(status).json({ ok: false, message: message })
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

        console.log("antes de entrar al hateoas", publicaciones);
        const HATEOAS = await prepararHATEOAS(publicaciones, page )
        res.json(HATEOAS); // respuesta del servidor

    } catch (error) {
        const { status, message } = handleError(error.code);
        return res.status(status).json({ ok: false, message: message })
    }
}

const publicaciones_user = async (req, res) => {
    try {
        const {email}= req.body;
        console.log(email);
        
        const { rowCount, rows: [user] } = await verificarCredencial(email);
        console.log("antes de la validacion de no se encontró registro");
        if (!rowCount) throw { code: 404, message: "No se encontró ningún usuario con estas credenciales"}
        console.log("despues de la validacion de no se encontró registro");
        const usuario_id= user.usuario_id;
        console.log("este es el usuario ID", usuario_id);
        const publicaciones = await obtenerPublicaciones({ usuario_id });
        
        console.log(publicaciones);
        res.status(200).json([publicaciones]);

    } catch (error) {
        const { status, message } = handleError(error.code);
        return res.status(status).json({ ok: false, message: message })
    }
    
}

const nueva_publicacion = async (req, res) => {

    try {
        const { usuario_id, titulo, contenido, imagen, tipo_servicio, email_contacto, telefono_contacto, ciudad, comuna, fecha_publicacion  } = req.body;

        if (!usuario_id || !titulo || !contenido || !imagen || !tipo_servicio || !email_contacto || !telefono_contacto || !ciudad || !comuna || !fecha_publicacion){
            throw {
                code: 400, message: "faltan campos requeridos"
            }
        }

        const publicacion = await agregar_publicacion ( usuario_id, titulo, contenido, imagen, tipo_servicio, email_contacto, telefono_contacto, ciudad, comuna, fecha_publicacion );

        if(!publicacion){
            throw{ code: 404, message: "publicacion rechazada" }
        }
        return res.status(201).json({ ok: true, message: "publicacion existosa" });
    } catch (error) {
        const { status, message } = handleError(error.code);
        return res.status(status).json({ ok: false, message: message })
    }
    
}
export const portalController = {
    register, login, services, publicaciones_user, nueva_publicacion
}