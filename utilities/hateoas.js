import { config } from 'dotenv';
config();
const URL_BASE = process.env.URL_BASE

export const createHateoas = (publicaciones, totalPublicaciones, page = 1, limits = 8) => {
  const results = publicaciones.map((p) => {
    return {
      usuarioId: p.usuario_id,
      publicacionId: p.publicacion_id,
      titulo: p.titulo,
      contenido: p.contenido,
      imagen: p.imagen,
      tipoServicio: p.tipo_servicio,
      emailContacto: p.email_contacto,
      telefonoContacto: p.telefono_contacto,
      ciudad: p.ciudad,
      comuna: p.comuna,
      fechaPublicacion: p.fecha_publicacion,
      likes: p.likes,
    };
  });

  const total_pages = Math.ceil(totalPublicaciones / limits);
  const nextPage = total_pages <= page ? null : `${URL_BASE}/servicios?&page=${parseInt(page) + 1}`;
  const previousPage = page <= 1 ? null : `${URL_BASE}/servicios?&page=${parseInt(page) - 1}`;

  const HATEOAS = {
    ok: true,
    results,
    meta: {
      total_publicaciones: parseInt(totalPublicaciones),
      total_pages,
      page: parseInt(page),
      next: nextPage,
      previous: previousPage,
    },
  };
  
  return HATEOAS;
};
