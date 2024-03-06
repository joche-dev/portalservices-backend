CREATE DATABASE portal_servicios;

\c portal_servicios;

CREATE TABLE IF NOT EXISTS Usuarios (
    Usuario_ID SERIAL PRIMARY KEY,
    Nombre VARCHAR(50) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    Contraseña VARCHAR(100) NOT NULL,
    Ciudad VARCHAR(50),
    Comuna VARCHAR(50),
    Direccion VARCHAR(255),
    --Foto_Perfil VARCHAR(255),  -- URL de la imagen
    Rol VARCHAR(20) NOT NULL  -- roles "usuario"-"administrador"
);

-- Tabla de Publicaciones
CREATE TABLE IF NOT EXISTS Publicaciones (
    Publicacion_ID SERIAL PRIMARY KEY,
    Usuario_ID INT NOT NULL,
    Titulo VARCHAR(100) NOT NULL,
    Contenido TEXT NOT NULL,
    Imagen VARCHAR(255),  -- URL de la imagen
    Tipo_Servicio VARCHAR(50) NOT NULL,  -- Tipos de servicio que aplican
    Email_Contacto VARCHAR(100) NOT NULL,
    Telefono_Contacto VARCHAR(20) NOT NULL,
    Ciudad VARCHAR(50) NOT NULL,
    Comuna VARCHAR(50) NOT NULL,
    Likes INT DEFAULT 0,  -- Conteo de "me gusta", inicia en 0 por defecto
    Fecha_Publicacion DATE NOT NULL,
    FOREIGN KEY (Usuario_ID) REFERENCES Usuarios(Usuario_ID)
);

-- Tabla de Favoritos
CREATE TABLE IF NOT EXISTS Favoritos (
    Favorito_ID SERIAL PRIMARY KEY,
    Usuario_ID INT NOT NULL,
    Publicacion_ID INT NOT NULL,
    FOREIGN KEY (Usuario_ID) REFERENCES Usuarios(Usuario_ID),
    FOREIGN KEY (Publicacion_ID) REFERENCES Publicaciones(Publicacion_ID)
);