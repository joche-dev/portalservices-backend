import pkg from 'pg';

const { Pool } = pkg;

const pool = new Pool({
    allowExitOnIdle: true,
});

const registrarUsuario = async (nombre, email, contraseña, ciudad, comuna, direccion, rol) => {
    const values = [nombre, email, contraseña, ciudad, comuna, direccion, rol];
    console.log(values); 
    const consulta = "INSERT INTO usuarios values (DEFAULT, $1, $2, $3, $4, $5, $6, $7)" 
    await pool.query(consulta, values); 
}

const comprobarRegistroByEmail = async (email) => {
    console.log("entró en la comprobacion del email");
    const consulta = "SELECT * FROM usuarios WHERE email = $1" 
    const values = [email];
    const { rows: [usuario], rowCount } = await pool.query(consulta, values);
    console.log(rowCount);
    if (rowCount) throw { code: 406, message: "Email registrado en la tabla" }
}

const verificarCredencial = async (email) => {
    const consulta = "SELECT * FROM usuarios WHERE email = $1" 
    const values = [email];
    const { rowCount, rows: [user]  } = await pool.query(consulta, values)
    console.log("user y rowCount en verificarCredenciales: ", { user, rowCount });

    if (!rowCount) throw { code: 404, message: "No se encontró ningún usuario con estas credenciales" }

    return user
}

export { registrarUsuario, comprobarRegistroByEmail, verificarCredencial }