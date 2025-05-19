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

export const UserSpecialActionsLabels: Array<{value: UserSpecialActions, label: string}> =  [
    { value: 'shuffleArtist', label: 'Shuffle current artist tracks' },
    { value: 'shuffleArtistLikes', label: 'Shuffle current artist likes' },
    { value: 'shuffleAlbum', label: 'Shuffle current album tracks' },
    { value: 'shuffleAlbumLikes', label: 'Shuffle current album likes' },
    { value: 'shuffleLibrary', label: 'Shuffle current library tracks' },
    { value: 'shuffleLibraryLikes', label: 'Shuffle current library likes' },
    { value: 'shuffleGenre', label: 'Shuffle current genre tracks' },
    { value: 'shuffleGenreLikes', label: 'Shuffle current genre likes' },
]

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