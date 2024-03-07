import Jwt from 'jsonwebtoken';
import { handleError } from '../handleError/handleError.js';
import { comprobarRegistroByEmail } from '../database/consultas.js';

const reportarConsulta = async (req, res, next) => {
  const parametros = req.params;
  const querys = req.query;
  const body = req.body;
  const url = req.url;
  console.log(
    `
      Hoy ${new Date()}
      Se ha recibido una consulta en la ruta ${url} 
      con los parámetros: ${JSON.stringify(parametros)}, 
      querys: ${JSON.stringify(querys)} y 
      body: ${JSON.stringify(body)}
      `
  );

  next();
};

const verificarInput = async (req, res, next) => {
  try {
    const { nombre, email, contraseña, ciudad, comuna, direccion, rol } =
      req.body;
    console.log(
      'estos son los datos entregados para el registro: ',
      nombre,
      email,
      contraseña,
      ciudad,
      comuna,
      direccion,
      rol
    );
    if (!nombre || !email || !contraseña || !ciudad || !comuna) {
      throw {
        code: 400,
        message: 'faltan campos requeridos',
      };
    }
    const result = await comprobarRegistroByEmail(email);
    if (result) {
      throw { code: 400, message: `El email ${email} ya esta registrado.` };
    }
    console.log(`El email ${email} es apto para el registro.`);
    next();
    
  } catch (error) {
    console.log(error);
    const { status, message } = handleError(error.code, error.message);
    return res.status(status).json({ ok: false, result: message });
  }
};

const verificarCredenciales = async (req, res, next) => {
  try {
    const Authorization = req.header('Authorization');
    const token = Authorization.split('Bearer ')[1];
    console.log(token);
    if (!token) {
      throw { code: 401, message: 'token no proporcionado' };
    }
    console.log('verifico el token');
    Jwt.verify(token, process.env.JWT_PASSWORD);
    const { email } = Jwt.decode(token);
    req.body.email = { email };
    next();
  } catch (error) {
    console.log(error);
    const { status, message } = handleError(error.code);
    return res.status(status).json({ ok: false, result: message });
  }
};

export { reportarConsulta, verificarInput, verificarCredenciales };
