import pkg from 'pg';
import format from 'pg-format';

const { Pool } = pkg;

const pool = new Pool({
  allowExitOnIdle: true,
});

const getUser = async (email) => {
  const consulta = 'SELECT * FROM usuarios WHERE email = $1;';
  const {
    rows: [user],
  } = await pool.query(consulta, [email]);
  return user;
};

const checkEmailEnabled = async (email) => {
  const consulta = 'SELECT email FROM usuarios WHERE email = $1';
  const { rowCount } = await pool.query(consulta, [email]);

  return rowCount;
};

const newUser = async (
  nombre,
  email,
  contraseña,
  ciudad,
  comuna,
  direccion = '',
  rol = 'user'
) => {
  const consulta =
    'INSERT INTO usuarios values (DEFAULT, $1, $2, $3, $4, $5, $6, $7) RETURNING *;';
  const values = [nombre, email, contraseña, ciudad, comuna, direccion, rol];
  const {
    rows: [user],
  } = await pool.query(consulta, values);

  return user;
};

const getServices = async ({ limits = 8, page = 1 }) => {
  const order = 'DESC';
  page = Math.max(1, page);
  const offset = (page - 1) * limits;

  const publicacionesQuery = format(
    'SELECT * FROM publicaciones ORDER BY publicacion_id %s LIMIT %s OFFSET %s',
    order,
    limits,
    offset
  );
  const { rows: publicaciones } = await pool.query(publicacionesQuery);

  const totalPublicacionesQuery = format('SELECT COUNT(*) FROM publicaciones');
  const { rows: totalRows } = await pool.query(totalPublicacionesQuery);
  const totalPublicaciones = parseInt(totalRows[0].count);

  return { publicaciones, totalPublicaciones };
};

const getServiceId = async (postId) => {
  const query = format(
    'SELECT * FROM publicaciones WHERE publicacion_id = %s',
    postId
  );
  const {
    rows: [publicacion],
  } = await pool.query(query);

  return publicacion;
};

const getServicesByUser = async ({ usuarioId, page = 1, limit = 8 }) => {
  const order = 'DESC';
  page = Math.max(1, page);
  const offset = (page - 1) * limit;
  const query =
    'SELECT * FROM publicaciones WHERE usuario_id = %s ORDER BY publicacion_id %s LIMIT %s OFFSET %s';

  const publicacionesQuery = format(query, usuarioId, order, limit, offset);
  const { rows: publicaciones } = await pool.query(publicacionesQuery);

  const totalPublicacionesQuery = format(
    'SELECT COUNT(*) FROM publicaciones WHERE usuario_id = %s',
    usuarioId
  );
  const { rows: totalRows } = await pool.query(totalPublicacionesQuery);
  const totalPublicaciones = parseInt(totalRows[0].count);

  return { publicaciones, totalPublicaciones };
};

const newService = async (
  usuario_id,
  titulo,
  contenido,
  imagen,
  tipo_servicio,
  email_contacto,
  telefono_contacto,
  ciudad,
  comuna
) => {
  const likes = 0;
  const fecha_publicacion = new Date();
  const values = [
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
  ];
  const consulta =
    'INSERT INTO publicaciones values (DEFAULT, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)';
  const { rowCount } = await pool.query(consulta, values);

  return rowCount;
};

const updateService = async (
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
) => {
  const fecha_publicacion = new Date();
  const values = [
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
  ];

  const consulta =
    'UPDATE publicaciones SET titulo = $1, contenido = $2, imagen = $3, tipo_servicio = $4, email_contacto = $5, telefono_contacto = $6, ciudad = $7, comuna = $8, likes = $9, fecha_publicacion = $10 WHERE publicacion_id = $11';

  const { rowCount } = await pool.query(consulta, values);

  return rowCount;
};

const removeService = async (postId) => {
  const query = 'DELETE FROM publicaciones WHERE publicacion_id= $1';
  const { rowCount } = await pool.query(query, [postId]);
  return rowCount;
};

const getFavoritesByUser = async ({ usuarioId, page = 1, limit = 8 }) => {
  const order = 'DESC';
  page = Math.max(1, page);
  const offset = (page - 1) * limit;

  const query =
    ' SELECT * FROM favoritos AS f JOIN publicaciones AS p ON f.publicacion_id = p.publicacion_id WHERE f.usuario_id = %s ORDER BY p.publicacion_id %s LIMIT %s OFFSET %s';

  const publicacionesQuery = format(query, usuarioId, order, limit, offset);
  const { rows: publicaciones } = await pool.query(publicacionesQuery);

  const totalPublicacionesQuery = format(
    'SELECT COUNT(*) FROM favoritos WHERE usuario_id = %s',
    usuarioId
  );
  const { rows: totalRows } = await pool.query(totalPublicacionesQuery);
  const totalPublicaciones = parseInt(totalRows[0].count);

  return { publicaciones, totalPublicaciones };
};

const newFavorites = async (usuario_id, publicacion_id) => {
  values = [usuario_id, publicacion_id];
  const consulta = 'INSERT INTO favoritos values (DEFAULT, $1, $2)';
  const { rowCount } = await pool.query(consulta, values);

  return rowCount;
};

const removeFavoritesByUser = async (favoritoId) => {
  const query = 'DELETE FROM favoritos WHERE favorito_id= $1';
  const { rowCount } = await pool.query(query, [favoritoId]);
  return rowCount;
};

const getProfileUser = async () => {};

const updateProfileUser = async () => {};

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
