import Jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createHateoas } from '../utilities/hateoas.js';
import { portalModel } from '../database/consultas.js';
import { handleError } from '../handleError/handleError.js';

const login = async (req, res) => {
  try {
    const { email, contraseña } = req.body;
    if (!email || !contraseña) {
      throw { code: 400, message: 'El email y la contraseña son requeridos.' };
    }

    const user = await portalModel.getUser(email);
    if (!user) {
      throw { code: 400, message: `Este email:${email} no esta registrado.` };
    }

    const verifyPassword = await bcrypt.compare(contraseña, user.contraseña);

    if (!verifyPassword) {
      throw { code: 400, message: 'Contraseña incorrecta.' };
    }

    const token = Jwt.sign({ email }, process.env.JWT_PASSWORD);

    res.status(200).json({
      token: token,
      ok: true,
      message: 'Login exitoso.',
      usuario: user,
    });
  } catch (error) {
    const { status, message } = handleError(error.code, error.message);
    res.status(status).json({ ok: false, message });
  }
};

const register = async (req, res) => {
  try {
    const { nombre, email, contraseña, ciudad, comuna } = req.body;

    const contraseñaEncriptada = await bcrypt.hash(contraseña, 10);

    const result = await portalModel.newUser(
      nombre,
      email,
      contraseñaEncriptada,
      ciudad,
      comuna
    );

    if (!result) {
      throw { code: 400, message: 'Registro del usuario fallido.' };
    }

    res
      .status(201)
      .json({ ok: true, message: 'Registro del usuario exitoso.' });
  } catch (error) {
    const { status, message } = handleError(error.code, error.message);
    return res.status(status).json({ ok: false, message });
  }
};

const getServices = async (req, res) => {
  try {
    const { page } = req.query;
    if (!page) {
      throw { code: 400, message: 'El número de página es requerido.' };
    }

    const isPageValid = /^[1-9]\d*$/.test(page);
    if (!isPageValid) {
      throw {
        code: 400,
        message: 'El número de página debe ser igual o mayor a 1.',
      };
    }

    const { publicaciones, totalPublicaciones } = await portalModel.getServices(
      { page }
    );

    const resultHateoas = createHateoas(
      publicaciones,
      totalPublicaciones,
      page
    );

    res.status(200).json(resultHateoas);
  } catch (error) {
    const { status, message } = handleError(error.code, error.message);
    res.status(status).json({ ok: false, message });
  }
};

const getServiceId = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    if (!postId) {
      throw { code: 400, message: 'Id de la puclicación no proporcionado.' };
    }

    const publicacion = await portalModel.getServiceId(postId);
    if (!publicacion) {
      throw { code: 400, message: 'Puclicación no encontrado.' };
    }
    res.status(200).json({
      ok: true,
      message: 'puclicación encontrada.',
      servicio: publicacion,
    });
  } catch (error) {
    const { status, message } = handleError(error.code, error.message);
    res.status(status).json({ ok: false, message });
  }
};

const getServicesByUser = async (req, res) => {
  try {
    const { usuarioId } = req.body;
    if (!usuarioId) {
      throw { code: 400, message: 'El Id del usuario es requerido.' };
    }

    const { page } = req.query;
    if (!page) {
      throw { code: 400, message: 'El número de página es requerido.' };
    }

    const isPageValid = /^[1-9]\d*$/.test(page);
    if (!isPageValid) {
      throw {
        code: 400,
        message: 'El número de página debe ser igual o mayor a 1.',
      };
    }

    const { publicaciones, totalPublicaciones } =
      await portalModel.getServicesByUser({ usuarioId, page });
    const resultHateoas = createHateoas(
      publicaciones,
      totalPublicaciones,
      page
    );

    res.status(200).json(resultHateoas);
  } catch (error) {
    const { status, message } = handleError(error.code, error.message);
    return res.status(status).json({ ok: false, message });
  }
};

const newService = async (req, res) => {
  try {
    const {
      usuario_id,
      titulo,
      contenido,
      imagen,
      tipo_servicio,
      email_contacto,
      telefono_contacto,
      ciudad,
      comuna,
    } = req.body;

    if (
      !usuario_id ||
      !titulo ||
      !contenido ||
      !imagen ||
      !tipo_servicio ||
      !email_contacto ||
      !telefono_contacto ||
      !ciudad ||
      !comuna
    ) {
      throw {
        code: 400,
        message: 'Faltan campos requeridos.',
      };
    }

    const publicacion = await portalModel.newService(
      usuario_id,
      titulo,
      contenido,
      imagen,
      tipo_servicio,
      email_contacto,
      telefono_contacto,
      ciudad,
      comuna
    );

    if (!publicacion) {
      throw { code: 400, message: 'Registro de la publicación fallida.' };
    }
    return res
      .status(201)
      .json({ ok: true, message: 'Registro de la publicación exitosa.' });
  } catch (error) {
    const { status, message } = handleError(error.code, error.message);
    return res.status(status).json({ ok: false, message });
  }
};

const updateService = async (req, res) => {
  try {
    const {
      publicacion_id,
      titulo,
      contenido,
      imagen,
      tipo_servicio,
      email_contacto,
      telefono_contacto,
      ciudad,
      comuna,
      likes
    } = req.body;

    if (
      !publicacion_id ||
      !titulo ||
      !contenido ||
      !imagen ||
      !tipo_servicio ||
      !email_contacto ||
      !telefono_contacto ||
      !ciudad ||
      !comuna ||
      !likes
    ) {
      throw {
        code: 400,
        message: 'Faltan campos requeridos.',
      };
    }

    const publicacion = await portalModel.updateService(
      publicacion_id,
      titulo,
      contenido,
      imagen,
      tipo_servicio,
      email_contacto,
      telefono_contacto,
      ciudad,
      comuna,
      likes
    );

    if (!publicacion) {
      throw { code: 400, message: 'Actualización de la publicación fallida.' };
    }
    return res
      .status(201)
      .json({ ok: true, message: 'Actualización de la publicación exitosa.' });
  } catch (error) {
    const { status, message } = handleError(error.code, error.message);
    return res.status(status).json({ ok: false, message });
  }
};

const removeService = async (req, res) => {
  try {
    const { postId } = req.body;
    if (!postId) {
      throw { code: 400, message: 'Id de la publicación no proporcionado.' };
    }
    const result = await portalModel.removeService(postId);
    if (!result) {
      throw { code: 400, message: 'Publicación no encontrada.' };
    }
    res
      .status(200)
      .json({ ok: true, message: 'Publicación eliminada con éxito.' });
  } catch (error) {
    const { status, message } = handleError(error.code, error.message);
    res.status(status).json({ ok: false, message });
  }
};

const getFavoritesByUser = async (req, res) => {
  try {
    const { usuarioId } = req.body;
    if (!usuarioId) {
      throw { code: 400, message: 'El Id del usuario es requerido.' };
    }

    const { page } = req.query;
    if (!page) {
      throw { code: 400, message: 'El número de página es requerido.' };
    }

    const isPageValid = /^[1-9]\d*$/.test(page);
    if (!isPageValid) {
      throw {
        code: 400,
        message: 'El número de página debe ser igual o mayor a 1.',
      };
    }

    const { publicaciones, totalPublicaciones } =
      await portalModel.getFavoritesByUser({ usuarioId, page });
    const resultHateoas = createHateoas(
      publicaciones,
      totalPublicaciones,
      page
    );

    res.status(200).json(resultHateoas);
  } catch (error) {
    const { status, message } = handleError(error.code, error.message);
    return res.status(status).json({ ok: false, message });
  }
};

const newFavorites = async (req, res) => {
  try {
    const { usuario_id, publicacion_id } = req.body;

    if (!usuario_id || !publicacion_id) {
      throw {
        code: 400,
        message: 'Faltan campos requeridos.',
      };
    }

    const result = await portalModel.newFavorites(usuario_id, publicacion_id);

    if (!result) {
      throw { code: 400, message: 'Registro de favorito fallida.' };
    }
    return res
      .status(201)
      .json({ ok: true, message: 'Registro de favorito exitoso.' });
  } catch (error) {
    const { status, message } = handleError(error.code, error.message);
    return res.status(status).json({ ok: false, message });
  }
};

const removeFavorites = async (req, res) => {
  try {
    const { favoritoId } = req.body;
    if (!favoritoId) {
      throw { code: 400, message: 'Id del Favorito no proporcionado.' };
    }
    const result = await portalModel.removeFavoritesByUser(favoritoId);
    if (!result) {
      throw { code: 400, message: 'Favorito no encontrado.' };
    }
    res
      .status(200)
      .json({ ok: true, message: 'Favorito eliminado con exito.' });
  } catch (error) {
    const { status, message } = handleError(error.code, error.message);
    res.status(status).json({ ok: false, message });
  }
};

const getProfileUser = async (req, res) => {};

const updateProfileUser = async (req, res) => {};

export const portalController = {
  register,
  login,
  getServices,
  getServiceId,
  getServicesByUser,
  newService,
  updateService,
  removeService,
  getFavoritesByUser,
  newFavorites,
  removeFavorites,
  getProfileUser,
  updateProfileUser,
};
