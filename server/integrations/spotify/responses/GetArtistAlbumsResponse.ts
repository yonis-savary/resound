export interface GetArtistAlbumsResponse {
    href:     string;
    limit:    number;
    next:     string;
    offset:   number;
    previous: null;
    total:    number;
    items:    Item[];
}

export interface Item {
    album_type:             AlbumGroup;
    total_tracks:           number;
    available_markets:      string[];
    external_urls:          ExternalUrls;
    href:                   string;
    id:                     string;
    images:                 Image[];
    name:                   string;
    release_date:           Date;
    release_date_precision: string;
    type:                   AlbumGroup;
    uri:                    string;
    artists:                Artist[];
    album_group:            AlbumGroup;
}

export enum AlbumGroup {
    Album = "album",
    Single = "single",
    AppearsOn = "appears_on"
}

export interface Artist {
    external_urls: ExternalUrls;
    href:          string;
    id:            string;
    name:          string;
    type:          string;
    uri:           string;
}

export interface ExternalUrls {
    spotify: string;
}

export interface Image {
    url:    string;
    height: number;
    width:  number;
}
