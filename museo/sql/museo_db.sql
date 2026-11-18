-- Base de datos del Sistema de Gestión de Museos (XAMPP / phpMyAdmin)
-- Pega este script en la pestaña SQL de phpMyAdmin y ejecútalo.
DROP DATABASE IF EXISTS museo_db;
CREATE DATABASE museo_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE museo_db;

CREATE TABLE museum (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  latitude FLOAT,
  longitude FLOAT,
  landing_page_url VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE exhibition_room (
  id INT AUTO_INCREMENT PRIMARY KEY,
  museum_id INT NOT NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  capacity INT NOT NULL CHECK (capacity > 0),
  CONSTRAINT fk_room_museum FOREIGN KEY (museum_id) REFERENCES museum(id)
) ENGINE=InnoDB;

CREATE TABLE category (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT
) ENGINE=InnoDB;

CREATE TABLE artist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  biography TEXT,
  nationality VARCHAR(80)
) ENGINE=InnoDB;

CREATE TABLE artifact (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  image_url VARCHAR(255),
  created_at DATETIME,
  acquired_at DATETIME,
  condition_percentage INT CHECK (condition_percentage BETWEEN 0 AND 100),
  category_id INT NOT NULL,
  artist_id INT NULL,
  exhibition_room_id INT NULL,
  CONSTRAINT fk_art_category FOREIGN KEY (category_id) REFERENCES category(id),
  CONSTRAINT fk_art_artist   FOREIGN KEY (artist_id) REFERENCES artist(id),
  CONSTRAINT fk_art_room     FOREIGN KEY (exhibition_room_id) REFERENCES exhibition_room(id)
) ENGINE=InnoDB;

-- Historial de exposición (el texto del proyecto lo pide; el diagrama no trae esta tabla)
CREATE TABLE artifact_exhibition (
  id INT AUTO_INCREMENT PRIMARY KEY,
  artifact_id INT NOT NULL,
  exhibition_room_id INT NOT NULL,
  start_date DATETIME NOT NULL,
  end_date DATETIME NULL,
  CONSTRAINT fk_ae_artifact FOREIGN KEY (artifact_id) REFERENCES artifact(id),
  CONSTRAINT fk_ae_room FOREIGN KEY (exhibition_room_id) REFERENCES exhibition_room(id)
) ENGINE=InnoDB;

CREATE TABLE tour (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  start_at DATETIME,
  end_at DATETIME,
  landing_page_url VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE tour_room (
  tour_id INT NOT NULL,
  exhibition_room_id INT NOT NULL,
  sequence_number INT NOT NULL,
  PRIMARY KEY (tour_id, exhibition_room_id),
  CONSTRAINT fk_tr_tour FOREIGN KEY (tour_id) REFERENCES tour(id),
  CONSTRAINT fk_tr_room FOREIGN KEY (exhibition_room_id) REFERENCES exhibition_room(id)
) ENGINE=InnoDB;

-- Datos de prueba
INSERT INTO museum (name, description, latitude, longitude, landing_page_url) VALUES
('Museo de Arte Colonial', 'Colección de arte de la época colonial', 5.5353, -73.3678, 'https://museo.example.com');
INSERT INTO exhibition_room (museum_id, name, description, capacity) VALUES
(1, 'Sala Principal', 'Pinturas y esculturas', 50),
(1, 'Sala Orfebrería', 'Piezas en oro y plata', 30);
INSERT INTO category (name, description) VALUES ('Pintura', 'Obras pictóricas'), ('Escultura', 'Obras en 3D');
INSERT INTO artist (name, biography, nationality) VALUES ('Gregorio Vásquez', 'Pintor del siglo XVII', 'Colombiano');
INSERT INTO artifact (name, description, image_url, created_at, acquired_at, condition_percentage, category_id, artist_id, exhibition_room_id) VALUES
('La Anunciación', 'Óleo sobre lienzo', NULL, '1680-01-01', '1950-05-10', 85, 1, 1, 1),
('Cáliz antiguo', 'Pieza de orfebrería sin autor conocido', NULL, '1700-01-01', '1960-03-02', 35, 2, NULL, 2);
INSERT INTO artifact_exhibition (artifact_id, exhibition_room_id, start_date, end_date) VALUES
(1, 2, '2020-01-01', '2022-12-31'), (1, 1, '2023-01-01', NULL), (2, 2, '2020-01-01', NULL);
INSERT INTO tour (name, description, start_at, end_at, landing_page_url) VALUES
('Recorrido Colonial', 'Visita por las salas principales', '2026-12-01 09:00:00', '2026-12-01 11:00:00', 'https://museo.example.com/tour');
INSERT INTO tour_room VALUES (1, 1, 1), (1, 2, 2);
