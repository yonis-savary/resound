CREATE TABLE user (
    uuid VARCHAR(36) DEFAULT UUID() PRIMARY KEY,
    login VARCHAR(200) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL
);



CREATE TABLE artist (
    uuid VARCHAR(36) DEFAULT UUID() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);



CREATE TABLE album (
    uuid VARCHAR(36) DEFAULT UUID() PRIMARY KEY,
    artist VARCHAR(36) NOT NULL REFERENCES artist(uuid) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    genre VARCHAR(100) NULL,
    release_year INT NULL,

    accent_color_hex VARCHAR(7),

    cached_total_duration_seconds INT NULL,
    cached_track_number INT NULL,

    UNIQUE(artist, name)
);



CREATE TABLE track (
    uuid VARCHAR(36) DEFAULT UUID() PRIMARY KEY,
    edition_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
    album VARCHAR(36) NOT NULL REFERENCES album(uuid) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    position INT NULL,
    artist VARCHAR(100) NULL,
    producer VARCHAR(255) NULL,
    duration_seconds INT NULL,
    path VARCHAR(1024) NOT NULL,
    size_kb INT DEFAULT NULL,

    UNIQUE(album, name)
);



CREATE TABLE playlist (
    uuid VARCHAR(36) DEFAULT UUID() PRIMARY KEY,
    creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user VARCHAR(36) NOT NULL REFERENCES user(uuid) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    private BOOLEAN DEFAULT FALSE
);



CREATE TABLE playlist_track (
    id INT PRIMARY KEY AUTO_INCREMENT,
    position INT NULL,
    playlist VARCHAR(36) REFERENCES playlist(uuid) ON DELETE CASCADE,
    track VARCHAR(36) REFERENCES track(uuid) ON DELETE CASCADE
);



CREATE TABLE user_listening (
    id INT PRIMARY KEY AUTO_INCREMENT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
    user VARCHAR(36) NOT NULL REFERENCES user(uuid) ON DELETE CASCADE,
    track VARCHAR(36) NOT NULL REFERENCES track(uuid) ON DELETE CASCADE,
    playlist VARCHAR(36) NULL REFERENCES playlist(uuid) ON DELETE SET NULL
);



CREATE TABLE embedded_media (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    url VARCHAR(255) NOT NULL
);



CREATE TABLE tag_anomaly (
    id INT PRIMARY KEY AUTO_INCREMENT,
    filename VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL
);


DELIMITER //

CREATE TRIGGER album_cached_data_update_on_insert
AFTER insert ON track
FOR EACH ROW
BEGIN
        UPDATE album
        SET
            cached_total_duration_seconds = (SELECT SUM(duration_seconds) FROM track WHERE album = new.album),
            cached_track_number = (SELECT COUNT(uuid) FROM track WHERE album = new.album)
        WHERE uuid = new.album;
END //

CREATE TRIGGER album_cached_data_update_on_update
AFTER update ON track
FOR EACH ROW
BEGIN
        UPDATE album
        SET
            cached_total_duration_seconds = (SELECT SUM(duration_seconds) FROM track WHERE album = album.uuid),
            cached_track_number = (SELECT COUNT(uuid) FROM track WHERE album = album.uuid)
        WHERE uuid IN (old.album, new.album);
END //

CREATE TRIGGER album_cached_data_update_on_delete
AFTER delete ON track
FOR EACH ROW
BEGIN
        UPDATE album
        SET
            cached_total_duration_seconds = (SELECT SUM(duration_seconds) FROM track WHERE album = old.album),
            cached_track_number = (SELECT COUNT(uuid) FROM track WHERE album = old.album)
        WHERE uuid = old.album;
END //

DELIMITER ;