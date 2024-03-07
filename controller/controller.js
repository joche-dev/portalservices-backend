import Jwt from 'jsonwebtoken';
import bcrypt from "bcryptjs";
import { preparar_hateoas } from '../utilities/hateoas.js';
import { registrarUsuario, obtenerServicios, obtenerPublicaciones, agregar_publicacion, todas_las_publicaciones,  verificarCredencial } from '../database/consultas.js';
import { handleError } from '../handleError/handleError.js';

const login = async (req, res) =>{
    try {
        const { email, contraseña } = req.body
        console.log("contraseña original:", contraseña, typeof contraseña );


        if (!email || !contraseña) {
            throw { message: "email y la contraseña requeridos" };
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

        const data = await todas_las_publicaciones();
        // obtener total de elementos
        
        const respuesta = preparar_hateoas (publicaciones, data, page);

        res.status(200).json(respuesta); // respuesta del servidor

    } catch (error) {
        const { status, message } = handleError(error.code);
        return res.status(status).json({ ok: false, message: message })
    }
}

const publicaciones_user = async (req, res) => {
    try {
        const {email}= req.body;
        const { page } = req.query;
        const limits = 8;
        
        const user = await verificarCredencial(email);

        if (!user) throw { code: 404, message: "No se encontró ningún usuario con estas credenciales"}

        const usuario_id= user.usuario_id;
        console.log("este es el usuario ID", usuario_id);
        const publicaciones = await obtenerPublicaciones({ usuario_id, limits, page });
        
        console.log(publicaciones);
        res.status(200).json({
                                ok: true,
                                message: `Publicaciones realizadas por el usuario ${email}`,
                                results:[publicaciones]});

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