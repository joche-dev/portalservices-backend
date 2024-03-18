import pkg from 'pg';

const { Pool } = pkg;

const pool = new Pool({
  allowExitOnIdle: true,
});

const getUser = async (email) => {
  const consulta = 'SELECT * FROM usuarios WHERE email = $1;';
  const { rows: [user] } = await pool.query(consulta, [email]);
  return user;
};

const checkEmailEnabled = async (email) => {
  const query = 'SELECT email FROM usuarios WHERE email = $1';
  const { rowCount } = await pool.query(query, [email]);
  return rowCount;
};

const newUser = async (nombre, email, contraseña, ciudad, comuna, direccion = '', rol = 'user') => {
  const query = 'INSERT INTO usuarios VALUES (DEFAULT, $1, $2, $3, $4, $5, $6, $7) RETURNING *;';
  const { rows: [user] } = await pool.query(query, [nombre, email, contraseña, ciudad, comuna, direccion, rol]);
  return user;
};

const getServices = async ({ page = 1, titulo, comuna, ciudad, limits = 8 }) => {
  page = Math.max(1, page);
  const offset = (page - 1) * limits;
  const filters = [];
  const values = [];

  if (titulo) {
    filters.push('titulo ILIKE $1');
    values.push(`%${titulo}%`);
  }
  if (comuna) {
    filters.push('comuna ILIKE $2');
    values.push(`%${comuna}%`);
  }
  if (ciudad) {
    filters.push('ciudad ILIKE $3');
    values.push(`%${ciudad}%`);
  }

  let query = 'SELECT * FROM publicaciones';
  let countQuery = 'SELECT COUNT(*) FROM publicaciones';

  if (filters.length > 0) {
    query += ` WHERE ${filters.join(' AND ')}`;
    countQuery += ` WHERE ${filters.join(' AND ')}`;
  }

  query += ' ORDER BY publicacion_id DESC LIMIT $4 OFFSET $5';
  values.push(limits, offset);

  const { rows: publicaciones } = await pool.query(query, values);
  const { rows: [{ count: totalPublicaciones }] } = await pool.query(countQuery, values);

  return { publicaciones, totalPublicaciones: parseInt(totalPublicaciones) };
};

const getServiceId = async (publicacion_id) => {
  const query = 'SELECT * FROM publicaciones WHERE publicacion_id = $1';
  const { rows: [publicacion] } = await pool.query(query, [publicacion_id]);
  return publicacion;
};

const getServicesByUser = async ({ usuario_id, page = 1, limit = 8 }) => {
  page = Math.max(1, page);
  const offset = (page - 1) * limit;
  const query = 'SELECT * FROM publicaciones WHERE usuario_id = $1 ORDER BY publicacion_id DESC LIMIT $2 OFFSET $3';
  const queryCount = 'SELECT COUNT(*) FROM publicaciones WHERE usuario_id = %s';

  const { rows: publicaciones } = await pool.query(query, [usuario_id, limit, offset]);
  const { rows: [{ count: totalPublicaciones }] } = await pool.query(queryCount, [usuario_id]);

  return { publicaciones, totalPublicaciones: parseInt(totalPublicaciones) };
};

const newService = async (usuario_id, titulo, contenido, imagen, tipo_servicio, email_contacto, telefono_contacto, ciudad, comuna) => {
  const likes = 0;
  const fecha_publicacion = new Date().toLocaleDateString('es-CL', { timeZone: 'America/Santiago' });
  const query = 'INSERT INTO publicaciones VALUES (DEFAULT, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)';
  const { rowCount } = await pool.query(query, [
    usuario_id,
    titulo,
    contenido,
    imagen,
    tipo_servicio,
    email_contacto,
    telefono_contacto,
    ciudad,
    comuna,
    likes,
    fecha_publicacion,
  ]);

  return rowCount;
};

const updateService = async (publicacion_id, titulo, contenido, imagen, tipo_servicio, email_contacto, telefono_contacto, ciudad, comuna, likes) => {
  const fecha_publicacion = new Date().toLocaleDateString('es-CL', { timeZone: 'America/Santiago' });
  const query = 'UPDATE publicaciones SET titulo = $1, contenido = $2, imagen = $3, tipo_servicio = $4, email_contacto = $5, telefono_contacto = $6, ciudad = $7, comuna = $8, likes = $9, fecha_publicacion = $10 WHERE publicacion_id = $11';
  const { rowCount } = await pool.query(query, [
    titulo,
    contenido,
    imagen,
    tipo_servicio,
    email_contacto,
    telefono_contacto,
    ciudad,
    comuna,
    likes,
    fecha_publicacion,
    publicacion_id,
  ]);

  return rowCount;
};

const removeService = async (publicacion_id) => {
  const query = 'DELETE FROM publicaciones WHERE publicacion_id= $1';
  const { rowCount } = await pool.query(query, [publicacion_id]);

  return rowCount;
};

const getFavoritesByUser = async ({ usuario_id, page = 1, limit = 8 }) => {
  page = Math.max(1, page);
  const offset = (page - 1) * limit;
  const query =
    'SELECT p.* FROM favoritos AS f JOIN publicaciones AS p ON f.publicacion_id = p.publicacion_id WHERE f.usuario_id = $1 ORDER BY ppublicacion_id DESC LIMIT $2 OFFSET $3';
  const { rows: publicaciones } = await pool.query(query, [usuario_id, limit, offset]);
  const { rows: [{ count: totalPublicaciones }] } = await pool.query(
    'SELECT COUNT(*) FROM favoritos WHERE usuario_id = $1',
    [usuario_id]
  );

  return { publicaciones, totalPublicaciones: parseInt(totalPublicaciones) };
};

const newFavorites = async (usuario_id, publicacion_id) => {
  const query = 'INSERT INTO favoritos VALUES (DEFAULT, $1, $2)';
  const { rowCount } = await pool.query(query, [usuario_id, publicacion_id]);

  return rowCount;
};

const removeFavoritesByUser = async (favorito_id) => {
  const query = 'DELETE FROM favoritos WHERE favorito_id= $1';
  const { rowCount } = await pool.query(query, [favorito_id]);

  return rowCount;
};

const getProfileUser = async (usuario_id) => {
  const query = 'SELECT * FROM usuarios WHERE usuario_id = $1';
  const { rows: perfil } = await pool.query(query, [usuario_id]);

  return perfil;
};

const updateProfileUser = async ( usuario_id, nombre, email, contraseña, ciudad, comuna, direccion ) => {
  const query = 'UPDATE usuarios SET nombre = $1, email = $2, contraseña = $3, ciudad = $4, comuna = $5, direccion = $6 WHERE usuario_id = $7';
  const { rowCount } = await pool.query(query, [nombre, email, contraseña, ciudad, comuna, direccion, usuario_id]);

  return rowCount;
};


export const portalModel = {
  getUser,
  checkEmailEnabled,
  newUser,
  getServices,
  getServiceId,
  getServicesByUser,
  newService,
  updateService,
  removeService,
  getFavoritesByUser,
  newFavorites,
  removeFavoritesByUser,
  getProfileUser,
  updateProfileUser,
};
