CREATE DATABASE IF NOT EXISTS voluntariado CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE voluntariado;

DROP TABLE IF EXISTS event_volunteers;
DROP TABLE IF EXISTS volunteers;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(120) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL, -- hash scrypt no formato "salt:hash"
  role ENUM('admin', 'user') NOT NULL DEFAULT 'user'
);

CREATE TABLE events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(120) NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  location VARCHAR(120) NOT NULL,
  max_volunteers INT NOT NULL DEFAULT 10,
  CHECK (max_volunteers > 0)
);

CREATE TABLE volunteers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  phone VARCHAR(20)
);

CREATE TABLE event_volunteers (
  event_id INT NOT NULL,
  volunteer_id INT NOT NULL,
  PRIMARY KEY (event_id, volunteer_id),
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (volunteer_id) REFERENCES volunteers(id) ON DELETE CASCADE
);

-- Senha de ambos os usuários: 123456 (guardada com hash scrypt)
INSERT INTO users (email, password, role) VALUES
  ('admin@ifrs.edu.br', '43c9fc094ff1bbc6c544d8aeb67a650a:9dd5aadebff6eb287fb0ea97930299db6a23ffe819ba83073abd62e2f87e5e4c33f1e21cf238abbe4e1e820b9104c2ce42e3f857fb6b72447c2c1afa11a322b7', 'admin'),
  ('user@ifrs.edu.br', '585302c12bceede80f15ef8859b83b7e:71e432f9f4b8f3fce704075ef5a22edfc78fc40d83e2d9203a2aee2a3b750eae43de68153872e9adc3cdaf7725d631b9775581ef38e3ec6767d1afa43a98d76c', 'user');

INSERT INTO events (title, description, event_date, location, max_volunteers) VALUES
  ('Campanha de Doação de Sangue', 'Parceria com o hemocentro', '2026-11-10', 'Ginásio do IFRS', 3),
  ('Arrecadação de Alimentos', 'Alimentos não perecíveis', '2026-11-20', 'Hall de entrada', 10),
  ('Mutirão Ambiental', 'Limpeza do arroio', '2026-12-05', 'Parque Municipal', 15);

INSERT INTO volunteers (name, email, phone) VALUES
  ('Ana Souza', 'ana@email.com', '54999990001'),
  ('Bruno Lima', 'bruno@email.com', '54999990002'),
  ('Carla Dias', 'carla@email.com', '54999990003');

INSERT INTO event_volunteers (event_id, volunteer_id) VALUES
  (1, 1),
  (2, 2);
