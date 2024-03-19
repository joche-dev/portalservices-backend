import Jwt from 'jsonwebtoken';
import { handleError } from '../handleError/handleError.js';
import { portalModel } from '../database/consultas.js';

export const requestLogger = (req, res, next) => {
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

export const verifyRegisterUser = (req, res, next) => {
  try {
    const { nombre, email, contraseña, ciudad, comuna } = req.body;
    if (!nombre || !email || !contraseña || !ciudad || !comuna) {
      throw { code: 400, message: 'Faltan campos requeridos.' };
    }

    const isEmailValid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email);
    if (!isEmailValid) {
      throw { code: 400, message: 'El email proporcionado no es valido.' };
    }

    next();
  } catch (error) {
    const { status, message } = handleError(error.code, error.message);
    res.status(status).json({ ok: false, message });
  }
};

export const verifyCredentials = async (req, res, next) => {
  try {
    const authorizationHeader = req.header('Authorization');

    if (!authorizationHeader) {
      throw { code: 401, message: 'Token no proporcionado.' };
    }

    const token = authorizationHeader.split('Bearer ')[1];

    if (!token) {
      throw { code: 401, message: 'Formato de token no válido.' };
    }

    const payload = Jwt.verify(token, process.env.JWT_PASSWORD);

    if (!payload) {
      throw { code: 401, message: 'Token invalido.' };
    }

    req.body.email = payload.email;
    const { usuario_id } = await portalModel.getUser(payload.email);
    req.body.usuario_id = usuario_id;

    next();
  } catch (error) {
    const { status, message } = handleError(error.code, error.message);
    res.status(status).json({ ok: false, message });
  }
};

export const configCors = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  next();
};