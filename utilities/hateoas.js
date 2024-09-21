const URL_BASE = process.env.URL_BASE

export const createHateoas = (publicaciones, totalPublicaciones, page = 1, limits = 8) => {
  const total_pages = Math.ceil(totalPublicaciones / limits);
  const nextPage = total_pages <= page ? null : `${URL_BASE}/servicios?&page=${parseInt(page) + 1}`;
  const previousPage = page <= 1 ? null : `${URL_BASE}/servicios?&page=${parseInt(page) - 1}`;

  const HATEOAS = {
    ok: true,
    results: publicaciones,
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
