import { useSuffleStore } from "~/app/stores/shuffle";

export type UserSpecialActions =
    'shuffleArtist' |
    'shuffleArtistLikes' |
    'shuffleAlbum' |
    'shuffleAlbumLikes' |
    'shuffleLibrary' |
    'shuffleLibraryLikes' |
    'shuffleGenre' |
    'shuffleGenreLikes'
;

export type UserSpecialActionsConfig = {
    label: string,
    effect: string|null,
    callback: ()=>void
}

export const UserSpecialActionsConfigs: Record<string,UserSpecialActionsConfig> ={
    'shuffleArtist': {
        label: 'Shuffle current artist tracks',
        effect: 'radar',
        callback: ()=>{ useSuffleStore().shuffleCurrentArtist(false) }
    },
    'shuffleArtistLikes': {
        label: 'Shuffle current artist likes',
        effect: 'radar',
        callback: ()=>{ useSuffleStore().shuffleCurrentArtist(true) }
    },
    'shuffleAlbum': {
        label: 'Shuffle current album tracks',
        effect: 'radar',
        callback: ()=>{ useSuffleStore().shuffleCurrentAlbum(false) }
    },
    'shuffleAlbumLikes': {
        label: 'Shuffle current album likes',
        effect: 'radar',
        callback: ()=>{ useSuffleStore().shuffleCurrentAlbum(true) }
    },
    'shuffleLibrary': {
        label: 'Shuffle library tracks',
        effect: null,
        callback: ()=>{ useSuffleStore().shuffleLibrary(false) }
    },
    'shuffleLibraryLikes': {
        label: 'Shuffle library likes',
        effect: null,
        callback: ()=>{ useSuffleStore().shuffleLibrary(true) }
    },
    'shuffleGenre': {
        label: 'Shuffle current genre tracks',
        effect: null,
        callback: ()=>{ useSuffleStore().shuffleCurrentGenre(false) }
    },
    'shuffleGenreLikes': {
        label: 'Shuffle current genre likes',
        effect: 'radar',
        callback: ()=>{ useSuffleStore().shuffleCurrentGenre(true) }
    },
}

export type UserSettings = {
    enableSpecialButtons: boolean,
    specialActions: {
        previous: UserSpecialActions,
        next: UserSpecialActions
    }
};


export const defaultUserSettings: UserSettings = {
    enableSpecialButtons: false,
    specialActions: {
        previous: 'shuffleLibraryLikes',
        next: 'shuffleArtistLikes',
    }
}