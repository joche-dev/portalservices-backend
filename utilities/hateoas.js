export const preparar_hateoas = (publicaciones, data, page = 1, limits = 8) => {
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
      likes: p.likes,
    };
  });

  const total = data.length;
  const total_pages = Math.ceil(total / limits);
  console.log(
    "Total registros Limits Total Paginas: ",
    total,
    limits,
    total_pages
  );

  console.log("antes de entrar al hateoas", publicaciones);

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
          : `http://${URL_BASE}/servicios?&page=${parseInt(page) + 1}`,
      previous:
        page <= 1
          ? null
          : `http://${URL_BASE}/servicios?&page=${parseInt(page) - 1}`,
    },
  };
  return HATEOAS;
};
