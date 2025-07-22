import { Op, Sequelize } from "sequelize";
import { albumBaseIncludes, trackBaseIncludes } from "~/server/helpers/includes"
import type { Album } from "~/server/models/Album";
import type { Track } from "~/server/models/Track";
import models from "~/server/db/models"
import sequelize from "~/server/db/sequelize";
import { discoverArtist } from "~/server/integrations/spotify/utils/discoverArtist";
import { indexArtist } from "~/server/integrations/spotify/utils/indexArtist";
import type { Artist } from "~/server/models/Artist";

export default defineEventHandler(async event => {

    const lastAdditions = await models.Album.findAll({
        include: albumBaseIncludes,
        where: { addition_date: { [Op.ne]: null } },
        order: [['addition_date', 'DESC']],
        limit: 10
    })

    const user = await getUserSession(event);
    let mostListened: Album[] = [];
    let mostListenedArtists: Artist[] = [];
    const instantPlaylists: { [key: string]: Track[] } = {};
    if (user.user?.id) {
        const [mostListenedId, _] = await sequelize.query(
            `SELECT DISTINCT album, COUNT(user_listening.id) as listening_count
            FROM track
            JOIN user_listening ON track = track.id AND user_listening.user = ${user.user.id}
            WHERE user_listening.timestamp > (NOW() - INTERVAL '1 month')
            GROUP BY track.album
            ORDER BY listening_count DESC
            LIMIT 4
        `) as [{ album: number, listening_count: number }[], number];

        const mostListenedAlbums = await models.Album.findAll({
            where: {
                id: { [Op.in]: mostListenedId.map(row => row.album) }
            }
        })

        mostListened = mostListenedId.map(row =>
            mostListenedAlbums.find(album => album.id == row.album)
        ).filter(album => album !== undefined);

        const [mostListenedGenre, __] = await sequelize.query(`
            SELECT genre.id as id, genre.name as genre, COUNT(*) counting
            FROM user_listening
            JOIN track ON track = track.id
            JOIN album ON track.album = album.id
            JOIN album_genre ON album.id = album_genre.album
            JOIN genre ON album_genre.genre = genre.id
            WHERE user_listening.user = ${user.user.id}
            GROUP BY genre.id
            ORDER BY counting DESC
            LIMIT 4
        `) as [{ id: number, genre: string, counting: number }[], number]



        const [mostListenedArtistsId, ___] = await sequelize.query(
            `SELECT DISTINCT track_artist.artist, COUNT(user_listening.id) as listening_count
            FROM track
            JOIN user_listening ON track = track.id AND user_listening.user = ${user.user.id}
            JOIN track_artist ON track.id = track_artist.track
            WHERE user_listening.timestamp > (NOW() - INTERVAL '1 month')
            GROUP BY track_artist.artist
            ORDER BY listening_count DESC
            LIMIT 7
        `) as [{ artist: number, listening_count: number }[], number];

        mostListenedArtists = await models.Artist.findAll({
            where: {
                id: { [Op.in]: mostListenedArtistsId.map(row => row.artist) }
            }
        })

        type trackQueryResponse = [{ track: number }[], number];

        await Promise.all(mostListenedGenre.map(async ({ id, genre }) => {

            const [likedTracks, ____] = await sequelize.query(`
                SELECT track.id as track
                FROM track
                JOIN album ON track.album = album.id 
                JOIN album_genre ON album_genre.album = album.id 
                JOIN genre ON album_genre.genre = genre.id AND genre.id = ${id}
                WHERE track.id IN (SELECT track FROM user_like WHERE user_like.user = ${user.user.id})
                ORDER BY RANDOM()
                LIMIT 100
            `) as trackQueryResponse;


            const toFetch = likedTracks.length < 25 ? 100 : Math.ceil(likedTracks.length * 0.25);

            const [notLikedTracks, _____] = await sequelize.query(`
                SELECT track.id as track
                FROM track
                JOIN album ON track.album = album.id 
                JOIN album_genre ON album_genre.album = album.id 
                JOIN genre ON album_genre.genre = genre.id AND genre.id = ${id}
                WHERE track.id NOT IN (SELECT track FROM user_like WHERE user_like.user = ${user.user.id})
                ORDER BY RANDOM()
                LIMIT ${toFetch}
            `) as trackQueryResponse;

            const playlist = await models.Track.findAll({
                where: {
                    id: { [Op.in]: [...likedTracks, ...notLikedTracks].map(track => track.track) }
                },
                order: [Sequelize.fn('RANDOM')],
                include: [{
                    model: models.Album,
                    as: 'album_album',
                    include: albumBaseIncludes
                }, ...trackBaseIncludes]
            })

            instantPlaylists[genre] = playlist
        }));
    }


    const artistsOfTheDayId = defineCachedFunction(async (): Promise<number[]> =>{
        return (await models.Artist.findAll({
            attributes: ['id'],
            limit: 5,
            where: {exists_locally: true},
            order: [Sequelize.fn('RANDOM')]
        })).map(artist => artist.id);
    }, {
        maxAge: 3600*24,
        name: 'artistsOfTheDay'
    });

    const artistsOfTheDay = await models.Artist.findAll({
        where: {
            id: { [Op.in]: await artistsOfTheDayId() }
        }
    });

    artistsOfTheDay.forEach(async artist => {
        if (!artist.api_id)
            await discoverArtist(artist.name)

        if (artist.api_id)
            await indexArtist(artist.api_id);
    })

    return {
        lastAdditions,
        mostListened,
        mostListenedArtists,
        instantPlaylists,
        artistsOfTheDay
    }
})
