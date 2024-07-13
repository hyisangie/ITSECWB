DROP DATABASE ITSECWB_DB;
CREATE DATABASE ITSECWB_DB;
USE ITSECWB_DB;

CREATE TABLE ITSECWB_DB.users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firstname VARCHAR(50) NOT NULL,
    lastname VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    profile_photo VARCHAR(45) NOT NULL,
    role ENUM('admin', 'user') NOT NULL DEFAULT 'user' 
);

CREATE USER IF NOT EXISTS 'itsecur'@'%' IDENTIFIED BY 'lingui250!';

GRANT SELECT, UPDATE, INSERT, DELETE ON ITSECWB_DB.* TO 'itsecur'@'%';

INSERT INTO `users` VALUES (1,'admin','admin','admin@email.com','$2b$10$WlbczTEc7Zv8e.fDAM6tEOPyiFddIMTz0RPNceinvefmZedEt002C','09999999999','1718007341558.png','admin');

CREATE TABLE items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

CREATE TABLE applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  item_id INT NOT NULL,
  quantity INT NOT NULL,
  purpose TEXT NOT NULL,
  applicant_email VARCHAR(255) NOT NULL,
  status ENUM('pending', 'processing', 'ready', 'completed', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES items(id)
);

INSERT INTO items (name) VALUES ('Pen'), ('Notebook'), ('Stapler'), ('Paper clips');