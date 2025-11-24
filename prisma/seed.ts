import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {

  // 1. Crear géneros
  const genres = await Promise.all([
    prisma.genre.upsert({
      where: { slug: 'accion' },
      update: {},
      create: { name: 'Acción', slug: 'accion' },
    }),
    prisma.genre.upsert({
      where: { slug: 'drama' },
      update: {},
      create: { name: 'Drama', slug: 'drama' },
    }),
    prisma.genre.upsert({
      where: { slug: 'comedia' },
      update: {},
      create: { name: 'Comedia', slug: 'comedia' },
    }),
    prisma.genre.upsert({
      where: { slug: 'sci-fi' },
      update: {},
      create: { name: 'Ciencia Ficción', slug: 'sci-fi' },
    }),
    prisma.genre.upsert({
      where: { slug: 'horror' },
      update: {},
      create: { name: 'Horror', slug: 'horror' },
    }),
    prisma.genre.upsert({
      where: { slug: 'romance' },
      update: {},
      create: { name: 'Romance', slug: 'romance' },
    }),
  ]);


  // 2. Crear planes de suscripción
  const plans = await Promise.all([
    prisma.subscriptionPlan.upsert({
      where: { name: 'Premium' },
      update: {},
      create: {
        name: 'Premium',
        description: 'Acceso completo a todo el catálogo de películas y series',
        price: 10.00,
        durationDays: 30,
        features: ['Catálogo completo', 'Sin anuncios', 'Acceso ilimitado', 'Cancela cuando quieras'],
        isActive: true,
      },
    }),
  ]);


  // 3. Crear películas de ejemplo
  
  // URLs base de TMDB para imágenes
  const TMDB_POSTER_BASE = 'https://image.tmdb.org/t/p/w500'; // Posters verticales
  const TMDB_BACKDROP_BASE = 'https://image.tmdb.org/t/p/original'; // Backdrops horizontales
  
  const movies = await Promise.all([
    // Acción (6 películas)
    prisma.movie.create({
      data: {
        title: 'John Wick: Otro Día para Matar',
        description: 'Un ex-asesino a sueldo busca venganza contra aquellos que mataron a su perro y le robaron su auto.',
        thumbnail: `${TMDB_POSTER_BASE}/fZPSd91yGE9fCcCe6OoQr6E3Bev.jpg`,
        backdrop: `${TMDB_BACKDROP_BASE}/ff2ti5DkA9UYLzyqhQfI2kZqEuh.jpg`,
        videoUrl: 'placeholder.mp4',
        duration: 600,
        year: 2014,
        rating: 'R',
        genreId: genres[0].id,
      },
    }),
    prisma.movie.create({
      data: {
        title: 'Mad Max: Fury Road',
        description: 'En un futuro post-apocalíptico, Max se une a Furiosa para escapar de un tirano en el desierto.',
        thumbnail: `${TMDB_POSTER_BASE}/hA2ple9q4qnwxp3hKVNhroipsir.jpg`,
        backdrop: `${TMDB_BACKDROP_BASE}/8CcjyTF3hXIe2wRdFkv52zkOmO1.jpg`,
        videoUrl: 'placeholder.mp4',
        duration: 600,
        year: 2015,
        rating: 'R',
        genreId: genres[0].id,
      },
    }),
    prisma.movie.create({
      data: {
        title: 'El Caballero de la Noche',
        description: 'Batman debe enfrentarse al Joker, un criminal que amenaza con destruir Gotham City.',
        thumbnail: `${TMDB_POSTER_BASE}/qJ2tW6WMUDux911r6m7haRef0WH.jpg`,
        backdrop: `${TMDB_BACKDROP_BASE}/hkBaDkMWbLaf8B1lsWsKX7Ew3Xq.jpg`,
        videoUrl: 'placeholder.mp4',
        duration: 600,
        year: 2008,
        rating: 'PG-13',
        genreId: genres[0].id,
      },
    }),
    prisma.movie.create({
      data: {
        title: 'Avengers: Endgame',
        description: 'Los Avengers se reúnen una última vez para deshacer las acciones de Thanos.',
        thumbnail: `${TMDB_POSTER_BASE}/or06FN3Dka5tukK1e9sl16pB3iy.jpg`,
        backdrop: `${TMDB_BACKDROP_BASE}/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg`,
        videoUrl: 'placeholder.mp4',
        duration: 600,
        year: 2019,
        rating: 'PG-13',
        genreId: genres[0].id,
      },
    }),
    prisma.movie.create({
      data: {
        title: 'Misión: Imposible - Repercusión',
        description: 'Ethan Hunt debe recuperar plutonio robado mientras lidia con las consecuencias de sus acciones pasadas.',
        thumbnail: `${TMDB_POSTER_BASE}/AkJQpZp9WoNdj7pLYSj1L0RcMMN.jpg`,
        backdrop: `${TMDB_BACKDROP_BASE}/8jxXePmbIVQ3bUdJKP4BVu0QmmG.jpg`,
        videoUrl: 'placeholder.mp4',
        duration: 600,
        year: 2018,
        rating: 'PG-13',
        genreId: genres[0].id,
      },
    }),
    prisma.movie.create({
      data: {
        title: 'Top Gun: Maverick',
        description: 'Después de más de 30 años de servicio, Pete Mitchell se enfrenta a drones y a sus propios demonios.',
        thumbnail: `${TMDB_POSTER_BASE}/62HCnUTziyWcpDaBO2i1DX17ljH.jpg`,
        backdrop: `${TMDB_BACKDROP_BASE}/odJ4hx6g6vBt4lBWKFD1tI8WS4x.jpg`,
        videoUrl: 'placeholder.mp4',
        duration: 600,
        year: 2022,
        rating: 'PG-13',
        genreId: genres[0].id,
      },
    }),

    // Drama (6 películas)
    prisma.movie.create({
      data: {
        title: 'Sueño de Fuga',
        description: 'Dos hombres encarcelados se hacen amigos a lo largo de los años, encontrando consuelo y eventual redención.',
        thumbnail: `${TMDB_POSTER_BASE}/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg`,
        backdrop: `${TMDB_BACKDROP_BASE}/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg`,
        videoUrl: 'placeholder.mp4',
        duration: 600,
        year: 1994,
        rating: 'R',
        genreId: genres[1].id,
      },
    }),
    prisma.movie.create({
      data: {
        title: 'Forrest Gump',
        description: 'La vida extraordinaria de un hombre con un corazón noble que participa en eventos históricos.',
        thumbnail: `${TMDB_POSTER_BASE}/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg`,
        backdrop: `${TMDB_BACKDROP_BASE}/7c9UVPPiTPltouxRVY6N9uUaHDa.jpg`,
        videoUrl: 'placeholder.mp4',
        duration: 600,
        year: 1994,
        rating: 'PG-13',
        genreId: genres[1].id,
      },
    }),
    prisma.movie.create({
      data: {
        title: 'Parásitos',
        description: 'Una familia pobre se infiltra en la vida de una familia rica con consecuencias inesperadas.',
        thumbnail: `${TMDB_POSTER_BASE}/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg`,
        backdrop: `${TMDB_BACKDROP_BASE}/TU9NIjwzjoKPwQHoHshkFcQUCG.jpg`,
        videoUrl: 'placeholder.mp4',
        duration: 600,
        year: 2019,
        rating: 'R',
        genreId: genres[1].id,
      },
    }),
    prisma.movie.create({
      data: {
        title: 'El Padrino',
        description: 'El patriarca de una dinastía del crimen organizado transfiere el control a su hijo reacio.',
        thumbnail: `${TMDB_POSTER_BASE}/3bhkrj58Vtu7enYsRolD1fZdja1.jpg`,
        backdrop: `${TMDB_BACKDROP_BASE}/tmU7GeKVybMWFButWEGl2M4GeiP.jpg`,
        videoUrl: 'placeholder.mp4',
        duration: 600,
        year: 1972,
        rating: 'R',
        genreId: genres[1].id,
      },
    }),
    prisma.movie.create({
      data: {
        title: 'La Lista de Schindler',
        description: 'La historia real de cómo un empresario salvó a más de mil judíos del Holocausto.',
        thumbnail: `${TMDB_POSTER_BASE}/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg`,
        backdrop: `${TMDB_BACKDROP_BASE}/loRmRzQXZeqG78TqZuyvSlEQfZb.jpg`,
        videoUrl: 'placeholder.mp4',
        duration: 600,
        year: 1993,
        rating: 'R',
        genreId: genres[1].id,
      },
    }),
    prisma.movie.create({
      data: {
        title: '12 Años de Esclavitud',
        description: 'La historia de un hombre libre afroamericano secuestrado y vendido como esclavo.',
        thumbnail: `${TMDB_POSTER_BASE}/xdANQijuNrJaw1HA61rDccME4Tm.jpg`,
        backdrop: `${TMDB_BACKDROP_BASE}/af98P1bc7lJsFjhHOVWXQgNNgSQ.jpg`,
        videoUrl: 'placeholder.mp4',
        duration: 600,
        year: 2013,
        rating: 'R',
        genreId: genres[1].id,
      },
    }),

    // Comedia (6 películas)
    prisma.movie.create({
      data: {
        title: 'El Gran Hotel Budapest',
        description: 'Un conserje legendario de un famoso hotel europeo se hace amigo de un botones.',
        thumbnail: `${TMDB_POSTER_BASE}/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg`,
        backdrop: `${TMDB_BACKDROP_BASE}/6gNWKEstRaKsfRsyPSe3Dj4IhPG.jpg`,
        videoUrl: 'placeholder.mp4',
        duration: 600,
        year: 2014,
        rating: 'R',
        genreId: genres[2].id,
      },
    }),
    prisma.movie.create({
      data: {
        title: 'Deadpool',
        description: 'Un mercenario con poderes regenerativos busca venganza con mucho humor negro.',
        thumbnail: `${TMDB_POSTER_BASE}/3E53WEZJqP6aM84D8CckXx4pIHw.jpg`,
        backdrop: `${TMDB_BACKDROP_BASE}/n1y094tVDFATSzkTnFxoGZ1qNsG.jpg`,
        videoUrl: 'placeholder.mp4',
        duration: 600,
        year: 2016,
        rating: 'R',
        genreId: genres[2].id,
      },
    }),
    prisma.movie.create({
      data: {
        title: 'Supermalo',
        description: 'Dos amigos intentan disfrutar de su última noche antes de ir a la universidad.',
        thumbnail: `${TMDB_POSTER_BASE}/ek8e8txUyUwd2BNqj6lFEerJfbq.jpg`,
        backdrop: `${TMDB_BACKDROP_BASE}/7OMAfDJikBxfsLi1bcAl3y0bH1l.jpg`,
        videoUrl: 'placeholder.mp4',
        duration: 600,
        year: 2007,
        rating: 'R',
        genreId: genres[2].id,
      },
    }),
    prisma.movie.create({
      data: {
        title: 'Comando Especial',
        description: 'Dos policías jóvenes se infiltran en una escuela secundaria para desmantelar una red de drogas.',
        thumbnail: `${TMDB_POSTER_BASE}/8v3Sqv9UcIUC4ebmpKWROqPBINZ.jpg`,
        backdrop: `${TMDB_BACKDROP_BASE}/7u0tO46OgNUBhFatAGvRKNa2L2y.jpg`,
        videoUrl: 'placeholder.mp4',
        duration: 600,
        year: 2012,
        rating: 'R',
        genreId: genres[2].id,
      },
    }),
    prisma.movie.create({
      data: {
        title: 'Una Guerra de Película',
        description: 'Un grupo de actores prima donna filmando una película de guerra quedan atrapados en una zona de combate real.',
        thumbnail: `${TMDB_POSTER_BASE}/zAurB9mNxfYRoVrVjAJJwGV3sPg.jpg`,
        backdrop: `${TMDB_BACKDROP_BASE}/gPXsl8MpEqTOe0TJw7b3mBJhmaA.jpg`,
        videoUrl: 'placeholder.mp4',
        duration: 600,
        year: 2008,
        rating: 'R',
        genreId: genres[2].id,
      },
    }),
    prisma.movie.create({
      data: {
        title: 'Puñales por la Espalda',
        description: 'Un detective investiga la muerte de un patriarca de una familia disfuncional.',
        thumbnail: `${TMDB_POSTER_BASE}/pThyQovXQrw2m0s9x82twj48Jq4.jpg`,
        backdrop: `${TMDB_BACKDROP_BASE}/tI4pp0bAePr3QcXR2sYxHLXiauy.jpg`,
        videoUrl: 'placeholder.mp4',
        duration: 600,
        year: 2019,
        rating: 'PG-13',
        genreId: genres[2].id,
      },
    }),

    // Sci-Fi (6 películas)
    prisma.movie.create({
      data: {
        title: 'El Origen',
        description: 'Un ladrón que roba secretos a través de los sueños recibe una última misión imposible.',
        thumbnail: `${TMDB_POSTER_BASE}/ljsZTbVsrQSqZgWeep2B1QiDKuh.jpg`,
        backdrop: `${TMDB_BACKDROP_BASE}/s3TBrRGB1iav7gFOCNx3H31MoES.jpg`,
        videoUrl: 'placeholder.mp4',
        duration: 600,
        year: 2010,
        rating: 'PG-13',
        genreId: genres[3].id,
      },
    }),
    prisma.movie.create({
      data: {
        title: 'Interestelar',
        description: 'Un grupo de exploradores viajan a través de un agujero de gusano en busca de un nuevo hogar para la humanidad.',
        thumbnail: `${TMDB_POSTER_BASE}/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg`,
        backdrop: `${TMDB_BACKDROP_BASE}/xJHokMbljvjADYdit5fK5VQsXEG.jpg`,
        videoUrl: 'placeholder.mp4',
        duration: 600,
        year: 2014,
        rating: 'PG-13',
        genreId: genres[3].id,
      },
    }),
    prisma.movie.create({
      data: {
        title: 'Matrix',
        description: 'Un hacker descubre que la realidad es una simulación controlada por máquinas.',
        thumbnail: `${TMDB_POSTER_BASE}/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg`,
        backdrop: `${TMDB_BACKDROP_BASE}/icmmSD4vTTDKOq2vvdulafOGw93.jpg`,
        videoUrl: 'placeholder.mp4',
        duration: 600,
        year: 1999,
        rating: 'R',
        genreId: genres[3].id,
      },
    }),
    prisma.movie.create({
      data: {
        title: 'Blade Runner 2049',
        description: 'Un nuevo blade runner descubre un secreto que podría sumir a la sociedad en el caos.',
        thumbnail: `${TMDB_POSTER_BASE}/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg`,
        backdrop: `${TMDB_BACKDROP_BASE}/ilRyazdMJwN05exqhwK4tMKBYZs.jpg`,
        videoUrl: 'placeholder.mp4',
        duration: 600,
        year: 2017,
        rating: 'R',
        genreId: genres[3].id,
      },
    }),
    prisma.movie.create({
      data: {
        title: 'La Llegada',
        description: 'Una lingüista es reclutada para comunicarse con alienígenas que han llegado a la Tierra.',
        thumbnail: `${TMDB_POSTER_BASE}/x2FJsf1ElAgr63Y3PNPtJrcmpoe.jpg`,
        backdrop: `${TMDB_BACKDROP_BASE}/yIZ1xendyqKvY3FGeeUYUd5X9Mm.jpg`,
        videoUrl: 'placeholder.mp4',
        duration: 600,
        year: 2016,
        rating: 'PG-13',
        genreId: genres[3].id,
      },
    }),
    prisma.movie.create({
      data: {
        title: 'Dune',
        description: 'El hijo de una familia noble debe proteger el recurso más valioso del universo.',
        thumbnail: `${TMDB_POSTER_BASE}/d5NXSklXo0qyIYkgV94XAgMIckC.jpg`,
        backdrop: `${TMDB_BACKDROP_BASE}/jYEW5xZkZk2WTrdbMGAPFuBqbDc.jpg`,
        videoUrl: 'placeholder.mp4',
        duration: 600,
        year: 2021,
        rating: 'PG-13',
        genreId: genres[3].id,
      },
    }),

    // Horror (6 películas)
    prisma.movie.create({
      data: {
        title: 'El Conjuro',
        description: 'Investigadores paranormales ayudan a una familia aterrorizada por una presencia oscura.',
        thumbnail: `${TMDB_POSTER_BASE}/wVYREutTvI2tmxr6ujrHT704wGF.jpg`,
        backdrop: `${TMDB_BACKDROP_BASE}/5kAGbi9MFAobQTVfK4kWPnIfnP0.jpg`,
        videoUrl: 'placeholder.mp4',
        duration: 600,
        year: 2013,
        rating: 'R',
        genreId: genres[4].id,
      },
    }),
    prisma.movie.create({
      data: {
        title: 'Un Lugar en Silencio',
        description: 'Una familia debe vivir en silencio absoluto para evitar ser cazada por criaturas que cazan por el sonido.',
        thumbnail: `${TMDB_POSTER_BASE}/nAU74GmpUk7t5iklEp3bufwDq4n.jpg`,
        backdrop: `${TMDB_BACKDROP_BASE}/roYyPiQDQKmIKUEhO912693tSja.jpg`,
        videoUrl: 'placeholder.mp4',
        duration: 600,
        year: 2018,
        rating: 'PG-13',
        genreId: genres[4].id,
      },
    }),
    prisma.movie.create({
      data: {
        title: '¡Huye!',
        description: 'Un joven afroamericano descubre un secreto perturbador cuando visita a la familia de su novia.',
        thumbnail: `${TMDB_POSTER_BASE}/tFXcEccSQMf3lfhfXKSU9iRBpa3.jpg`,
        backdrop: `${TMDB_BACKDROP_BASE}/bBQHALHRAaaORlPNXv7fNcRXYdx.jpg`,
        videoUrl: 'placeholder.mp4',
        duration: 600,
        year: 2017,
        rating: 'R',
        genreId: genres[4].id,
      },
    }),
    prisma.movie.create({
      data: {
        title: 'Nosotros',
        description: 'Una familia es aterrorizada por sus dobles siniestros durante unas vacaciones.',
        thumbnail: `${TMDB_POSTER_BASE}/ux2dU1jQ2ACIMShzB3yP93Udpzc.jpg`,
        backdrop: `${TMDB_BACKDROP_BASE}/ADJ6V8W96It4KElY2SPZvkKPBR.jpg`,
        videoUrl: 'placeholder.mp4',
        duration: 600,
        year: 2019,
        rating: 'R',
        genreId: genres[4].id,
      },
    }),
    prisma.movie.create({
      data: {
        title: 'Eso',
        description: 'Un grupo de niños se enfrenta a un payaso diabólico que se alimenta del miedo.',
        thumbnail: `${TMDB_POSTER_BASE}/9E2y5Q7WlCVNEhP5GiVTjhEhx1o.jpg`,
        backdrop: `${TMDB_BACKDROP_BASE}/tcheoA2nPATCm2vvXw2hVQoaEFD.jpg`,
        videoUrl: 'placeholder.mp4',
        duration: 600,
        year: 2017,
        rating: 'R',
        genreId: genres[4].id,
      },
    }),
    prisma.movie.create({
      data: {
        title: 'Alien',
        description: 'La tripulación de una nave espacial se enfrenta a una criatura letal que caza a bordo.',
        thumbnail: `${TMDB_POSTER_BASE}/vfrQk5IPloGg1v9Rzbh2Eg3VGyM.jpg`,
        backdrop: `${TMDB_BACKDROP_BASE}/AmR3JG1VQVxU8TfAvljUhfSFUOx.jpg`,
        videoUrl: 'placeholder.mp4',
        duration: 600,
        year: 1979,
        rating: 'R',
        genreId: genres[4].id,
      },
    }),

    // Romance (6 películas)
    prisma.movie.create({
      data: {
        title: 'Diario de una Pasión',
        description: 'Una historia de amor que perdura a través de los años y los obstáculos.',
        thumbnail: `${TMDB_POSTER_BASE}/qom1SZSENdmHFNZBXbtJAU0WTlC.jpg`,
        backdrop: `${TMDB_BACKDROP_BASE}/kMXamIoNIY7wfBpKavorz7ZHjn0.jpg`,
        videoUrl: 'placeholder.mp4',
        duration: 600,
        year: 2004,
        rating: 'PG-13',
        genreId: genres[5].id,
      },
    }),
    prisma.movie.create({
      data: {
        title: 'La La Land',
        description: 'Un músico de jazz y una actriz se enamoran mientras persiguen sus sueños en Los Ángeles.',
        thumbnail: `${TMDB_POSTER_BASE}/tphAq6LgEqMaly6NsyWoq5asDZE.jpg`,
        backdrop: `${TMDB_BACKDROP_BASE}/rVRtRE6HJ5xbdo5jd9aTT8tEVaF.jpg`,
        videoUrl: 'placeholder.mp4',
        duration: 600,
        year: 2016,
        rating: 'PG-13',
        genreId: genres[5].id,
      },
    }),
    prisma.movie.create({
      data: {
        title: 'Cuestión de Tiempo',
        description: 'Un joven descubre que puede viajar en el tiempo y lo usa para mejorar su vida amorosa.',
        thumbnail: `${TMDB_POSTER_BASE}/iR1bVfURbN7r1C46WHFbwCkVve.jpg`,
        backdrop: `${TMDB_BACKDROP_BASE}/fzZmcKQv7ZTGIiPvocPhNs3wUyK.jpg`,
        videoUrl: 'placeholder.mp4',
        duration: 600,
        year: 2013,
        rating: 'R',
        genreId: genres[5].id,
      },
    }),
    prisma.movie.create({
      data: {
        title: 'Orgullo y Prejuicio',
        description: 'La historia de amor entre Elizabeth Bennet y Mr. Darcy en la Inglaterra del siglo XIX.',
        thumbnail: `${TMDB_POSTER_BASE}/sGjIvtVvTlWnia2zfJfHz81pZ9Q.jpg`,
        backdrop: `${TMDB_BACKDROP_BASE}/x4OYcZVHggyZHOrvkCo2HH9kLkF.jpg`,
        videoUrl: 'placeholder.mp4',
        duration: 600,
        year: 2005,
        rating: 'PG',
        genreId: genres[5].id,
      },
    }),
    prisma.movie.create({
      data: {
        title: 'Loco y Estúpido Amor',
        description: 'Un hombre recientemente divorciado recibe lecciones de seducción de un soltero exitoso.',
        thumbnail: `${TMDB_POSTER_BASE}/gBFzkVslmiHVuwwjJ8cl9JZGrmg.jpg`,
        backdrop: `${TMDB_BACKDROP_BASE}/vyrCniZsrXZAW08eECKIp1BMLPh.jpg`,
        videoUrl: 'placeholder.mp4',
        duration: 600,
        year: 2011,
        rating: 'PG-13',
        genreId: genres[5].id,
      },
    }),
    prisma.movie.create({
      data: {
        title: 'Eterno Resplandor de una Mente sin Recuerdos',
        description: 'Una pareja se somete a un procedimiento para borrar sus recuerdos mutuos.',
        thumbnail: `${TMDB_POSTER_BASE}/dWg8smFmBdo8DagynrOXqdVFA0n.jpg`,
        backdrop: `${TMDB_BACKDROP_BASE}/744ybMaYRry1IQKoDakMc4GEU4L.jpg`,
        videoUrl: 'placeholder.mp4',
        duration: 600,
        year: 2004,
        rating: 'R',
        genreId: genres[5].id,
      },
    }),
  ]);


}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
