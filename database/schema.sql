CREATE TABLE "user" (
    id SERIAL PRIMARY KEY,
    username VARCHAR(200) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL
);

INSERT INTO "user" (username, password)
VALUES (
    'root',
    '$2b$10$QCtj0aCerkTA030GfZR/yO.fr3TRzDwb4gJyGBDY6G4AwePcyzFfG'
);

CREATE TABLE artist (
    id SERIAL PRIMARY KEY,
    last_update TIMESTAMP NOT NULL DEFAULT '2000-01-01 00:00:00',
    last_discography_update TIMESTAMP NOT NULL DEFAULT '2000-01-01 00:00:00',
    api_id VARCHAR(50),
    picture_path VARCHAR(255),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    exists_locally BOOLEAN DEFAULT FALSE,
    description TEXT,
    url VARCHAR(255)
);

CREATE TABLE album (
    id SERIAL PRIMARY KEY,
    last_update TIMESTAMP NOT NULL DEFAULT '2000-01-01 00:00:00',
    api_id VARCHAR(50),
    url VARCHAR(255),
    type VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    release_date DATE,
    picture_path VARCHAR(255),
    total_duration_milliseconds_cache INT,
    track_count_cache INT,
    exists_locally BOOLEAN DEFAULT FALSE,
    addition_date TIMESTAMP NULL,
    color VARCHAR(7) NULL
);

CREATE TABLE album_artist (
    id SERIAL PRIMARY KEY,
    album INT NOT NULL,
    artist INT NOT NULL,
    UNIQUE(album, artist),
    FOREIGN KEY (album) REFERENCES album(id) ON DELETE CASCADE,
    FOREIGN KEY (artist) REFERENCES artist(id) ON DELETE CASCADE
);

CREATE TABLE genre (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE album_genre (
    id SERIAL PRIMARY KEY,
    album INT NOT NULL,
    genre INT NOT NULL,
    UNIQUE (album, genre),
    FOREIGN KEY (album) REFERENCES album(id) ON DELETE CASCADE,
    FOREIGN KEY (genre) REFERENCES genre(id) ON DELETE CASCADE
);

CREATE TABLE track (
    id SERIAL PRIMARY KEY,
    api_id VARCHAR(50),
    album INT NOT NULL,
    discovery_date TIMESTAMP NULL,
    position INT,
    disc_number SMALLINT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    path VARCHAR(255),
    duration_milliseconds INT,
    explicit BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (album) REFERENCES album(id) ON DELETE CASCADE
);

CREATE TABLE track_artist (
    id SERIAL PRIMARY KEY,
    track INT NOT NULL,
    artist INT NOT NULL,
    UNIQUE(track, artist),
    FOREIGN KEY (track) REFERENCES track(id) ON DELETE CASCADE,
    FOREIGN KEY (artist) REFERENCES artist(id) ON DELETE CASCADE
);

CREATE TABLE user_like (
    id SERIAL PRIMARY KEY,
    "user" INT NOT NULL,
    track INT NOT NULL,
    UNIQUE("user", track),
    FOREIGN KEY ("user") REFERENCES "user"(id) ON DELETE CASCADE,
    FOREIGN KEY (track) REFERENCES track(id) ON DELETE CASCADE
);

CREATE TABLE user_wishlist (
    id SERIAL PRIMARY KEY,
    "user" INT NOT NULL,
    album INT NOT NULL,
    UNIQUE("user", album),
    FOREIGN KEY ("user") REFERENCES "user"(id) ON DELETE CASCADE,
    FOREIGN KEY (album) REFERENCES album(id) ON DELETE CASCADE
);

CREATE TABLE playlist (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    author INT NOT NULL,
    FOREIGN KEY (author) REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE TABLE playlist_track (
    id SERIAL PRIMARY KEY,
    position INT NOT NULL CHECK (position > 0),
    playlist INT NOT NULL,
    track INT NOT NULL,
    UNIQUE(playlist, position),
    FOREIGN KEY (playlist) REFERENCES playlist(id) ON DELETE CASCADE,
    FOREIGN KEY (track) REFERENCES track(id) ON DELETE CASCADE
);


CREATE TABLE user_listening (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "user" INT NOT NULL,
    track INT NOT NULL,
    playlist INT NULL,
    FOREIGN KEY ("user") REFERENCES "user"(id) ON DELETE CASCADE,
    FOREIGN KEY (track) REFERENCES track(id) ON DELETE CASCADE,
    FOREIGN KEY (playlist) REFERENCES playlist(id) ON DELETE SET NULL
);




--- migration 1 : add picture_path_hash to artist / album

ALTER TABLE "artist" ADD COLUMN "picture_path_hash" VARCHAR(50) NULL;
ALTER TABLE "album" ADD COLUMN "picture_path_hash" VARCHAR(50) NULL;