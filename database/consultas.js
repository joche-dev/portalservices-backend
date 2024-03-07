import pkg from 'pg';
import format from 'pg-format';

const { Pool } = pkg;

const pool = new Pool({
  allowExitOnIdle: true,
});

const registrarUsuario = async (
  nombre,
  email,
  contraseña,
  ciudad,
  comuna,
  direccion,
  rol
) => {
  const values = [nombre, email, contraseña, ciudad, comuna, direccion, rol];
  const consulta =
    'INSERT INTO usuarios values (DEFAULT, $1, $2, $3, $4, $5, $6, $7)';
  const { rowCount } = await pool.query(consulta, values);

  return rowCount;
};

//verificar comprobarRegistroByEmail y verificarEmail si cumplen la misma funcion

const comprobarRegistroByEmail = async (email) => {
  const consulta = 'SELECT * FROM usuarios WHERE email = $1';
  const { rowCount } = await pool.query(consulta, [email]);
  
  return rowCount;
};

const verificarCredencial = async (email) => {
  const consulta = 'SELECT * FROM usuarios WHERE email = $1';
  const values = [email];
  const {
    rowCount,
    rows: [user],
  } = await pool.query(consulta, values);
  console.log('user y rowCount en verificarCredenciales: ', { user, rowCount });
  return user;
};

const obtenerServicios = async ({ limits = 8, page = 1 }) => {
  const campo = 'publicacion_id';
  const direccion = 'DESC';

  //const offset = page * limits // iniciar en pagina 0
  if (page <= 0) {
    page = 1;
  }
  const offset = (page - 1) * limits; // iniciar en pagina 1

  const formattedQuery = format(
    'SELECT * FROM publicaciones order by %s %s LIMIT %s OFFSET %s',
    campo,
    direccion,
    limits,
    offset
  );

  const { rows: publicaciones } = await pool.query(formattedQuery);
  console.log('se hizo la consulta', publicaciones);
  return publicaciones;
};

const obtenerPublicaciones = async ({ id, limits = 8, page = 1 }) => {
  console.log('entro al obtener publicaciones');
  const campo = 'publicacion_id';
  const direccion = 'DESC';
  //const offset = page * limits // iniciar en pagina 0
  if (page <= 0) {
    page = 1;
  }
  const offset = (page - 1) * limits; // iniciar en pagina 1
  const formattedQuery = format(
    'SELECT * FROM publicaciones JOIN usuario ON publicaciones.usuario_id = usuarios.usuario_id WHERE usuarios.usuario_id = $1 order by %s %s LIMIT %s OFFSET %s',
    id,
    campo,
    direccion,
    limits,
    offset
  );
  const { rows: publicaciones } = await pool.query(formattedQuery);
  console.log('se hizo la consulta', publicaciones);
  return publicaciones;
};

const agregar_publicacion = async (
  usuario_id,
  titulo,
  contenido,
  imagen,
  tipo_servicio,
  email_contacto,
  telefono_contacto,
  ciudad,
  comuna,
  fecha_publicacion
) => {
  const likes = 0;
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

const todas_las_publicaciones = async () => {
  // toda la tabla
  const query = 'SELECT * FROM publicaciones';
  //SELECT * FROM publicaciones WHERE usuario_id = usuario_id
  const { rows: data } = await pool.query(query);

  return data;
};

const publicaciones_usuario = async (usuario_id) => {
  const query = 'SELECT * FROM publicaciones WHERE usuario_id = $1';
  const { rows: data } = await pool.query(query, usuario_id);
  return data;
};

export {
  registrarUsuario,
  comprobarRegistroByEmail,
  verificarCredencial,
  obtenerServicios,
  todas_las_publicaciones,
  obtenerPublicaciones,
  agregar_publicacion,
  publicaciones_usuario,
};
