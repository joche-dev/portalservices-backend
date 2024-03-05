import pkg from 'pg';
import format from 'pg-format';

const URL_BASE = process.env.URL_BASE;

const { Pool } = pkg;

const pool = new Pool({
    allowExitOnIdle: true,
});

const registrarUsuario = async (nombre, email, contraseña, ciudad, comuna, direccion, rol) => {
    const values = [nombre, email, contraseña, ciudad, comuna, direccion, rol];
    console.log(values); 
    const consulta = "INSERT INTO usuarios values (DEFAULT, $1, $2, $3, $4, $5, $6, $7)" 
    const { rowCount }= await pool.query(consulta, values);
    if(!rowCount){
        throw { code: 404, message: "registro fallido" }
    }
    return { code: 201, message: "registro exitoso" }
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

const obtenerServicios = async ({ limits = 8, page = 1 }) => {
    const campo = "publicacion_id";
    const direccion = "DESC";

    //const offset = page * limits // iniciar en pagina 0
    if(page <= 0){
        page=1;
    }
    const offset = (page - 1) * limits // iniciar en pagina 1
    console.log(campo, direccion);

    const formattedQuery = format('SELECT * FROM publicaciones order by %s %s LIMIT %s OFFSET %s', campo, direccion, limits, offset);

    const { rows: publicaciones } = await pool.query(formattedQuery)
    console.log("se hizo la consulta", publicaciones);
    return publicaciones
}

const prepararHATEOAS = async (publicaciones, page=1, limits=8) => {


    // ya con pagina y limites
    const results = publicaciones.map((p) => {
        return {
            usuarioId: p.usuarioId,
            publicacionId: p.publicacionId,
            titulo: p.titulo,
            contenido: p.contenido,
            imagen: p.imagen,
            tipoServicio: p.tipoServicio,
            emailContacto: p.emailContacto,
            telefonoContacto: p.telefonoContacto,
            ciudad: p.ciudad,
            comuna: p.comuna,
            fechaPublicacion: p.fechaPublicacion,
            likes: p.likes
        }
    })

    console.log("Valor de Results: ", results)

    // toda la tabla
    const text = "SELECT * FROM publicaciones";
    const { rows: data } = await pool.query(text);

    // obtener total de elementos
    const total = data.length
    const total_pages = Math.ceil(total / limits);
    console.log("Total registros Limits Total Paginas: ", total, limits, total_pages)

    //HATEOAS COMO RESPUESTA
    const HATEOAS = {
        ok: true,
        results, 
        meta: {
            total_publicaciones: total,
            limit: parseInt(limits),
            page: parseInt(page),
            total_pages: total_pages,
            next:
                total_pages <= page
                    ? null
                    : `http://${URL_BASE}/servicios?&page=${parseInt(page) + 1
                    }`,
            previous:
                page <= 1
                    ? null
                    : `http://${URL_BASE}/servicios?&page=${parseInt(page) - 1
                    }`,
        }
    }

    console.log("Valor de HATEOAS: ", HATEOAS)

    return HATEOAS
}

export { registrarUsuario, comprobarRegistroByEmail, verificarCredencial, obtenerServicios, prepararHATEOAS }