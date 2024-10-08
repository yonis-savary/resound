CREATE TABLE user (
    id INT PRIMARY KEY AUTO_INCREMENT,
    login VARCHAR(200) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL
);
-- DELIMITER


CREATE TABLE artist (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE
);
-- DELIMITER



CREATE TABLE album (
    id INT PRIMARY KEY AUTO_INCREMENT,
    artist INT NOT NULL REFERENCES artist(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    genre VARCHAR(100) NULL,
    release_year INT NULL,

    accent_color_hex VARCHAR(7),

    cached_total_duration_seconds INT NULL,
    cached_track_number INT NULL,

    UNIQUE(artist, name)
);
-- DELIMITER



CREATE TABLE track (
    id INT PRIMARY KEY AUTO_INCREMENT,
    edition_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    album INT NOT NULL REFERENCES album(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    position INT NULL,
    disc_number SMALLINT NULL,
    artist VARCHAR(100) NULL,
    producer VARCHAR(255) NULL,
    duration_seconds INT NULL,
    path VARCHAR(1024) NOT NULL,
    size_kb INT DEFAULT NULL,

    UNIQUE(album, name)
);
-- DELIMITER



CREATE TABLE playlist (
    id INT PRIMARY KEY AUTO_INCREMENT,
    creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user INT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    private BOOLEAN DEFAULT FALSE
);
-- DELIMITER



CREATE TABLE playlist_track (
    id INT PRIMARY KEY AUTO_INCREMENT,
    position INT NULL,
    playlist INT REFERENCES playlist(id) ON DELETE CASCADE,
    track INT REFERENCES track(id) ON DELETE CASCADE
);
-- DELIMITER



CREATE TABLE user_listening (
    id INT PRIMARY KEY AUTO_INCREMENT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user INT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    track INT NOT NULL REFERENCES track(id) ON DELETE CASCADE,
    playlist INT NULL REFERENCES playlist(id) ON DELETE SET NULL
);
-- DELIMITER



CREATE TABLE embedded_media (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    url VARCHAR(255) NOT NULL
);
-- DELIMITER



CREATE TABLE tag_anomaly (
    id INT PRIMARY KEY AUTO_INCREMENT,
    filename VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL
);
-- DELIMITER


DELIMITER //
CREATE TRIGGER album_cached_data_update_on_insert
AFTER insert ON track
FOR EACH ROW
BEGIN
        UPDATE album
        SET
            cached_total_duration_seconds = (SELECT SUM(duration_seconds) FROM track WHERE album = new.album),
            cached_track_number = (SELECT COUNT(id) FROM track WHERE album = new.album)
        WHERE id = new.album;
END//
-- DELIMITER

CREATE TRIGGER album_cached_data_update_on_update
AFTER update ON track
FOR EACH ROW
BEGIN
        UPDATE album
        SET
            cached_total_duration_seconds = (SELECT SUM(duration_seconds) FROM track WHERE album = album.id),
            cached_track_number = (SELECT COUNT(id) FROM track WHERE album = album.id)
        WHERE id IN (old.album, new.album);
END//
-- DELIMITER

CREATE TRIGGER album_cached_data_update_on_delete
AFTER delete ON track
FOR EACH ROW
BEGIN
        UPDATE album
        SET
            cached_total_duration_seconds = (SELECT SUM(duration_seconds) FROM track WHERE album = old.album),
            cached_track_number = (SELECT COUNT(id) FROM track WHERE album = old.album)
        WHERE id = old.album;
END//
-- DELIMITER

DELIMITER ;


CREATE TABLE user_like (
    user INT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    track INT NOT NULL REFERENCES track(id) ON DELETE CASCADE,
    UNIQUE(user, track)
);
-- DELIMITER





ALTER TABLE album ADD COLUMN user_author INT;
-- DELIMITER

ALTER TABLE album ADD CONSTRAINT FOREIGN KEY (user_author) REFERENCES user(id);
-- DELIMITER

UPDATE album SET user_author = 1;
-- DELIMITER

ALTER TABLE album MODIFY COLUMN user_author INT NOT NULL;
-- DELIMITER