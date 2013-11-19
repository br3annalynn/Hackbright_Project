import rdio
import os
import json

CONSUMER_KEY = os.getenv('RDIO_CONSUMER_KEY')
CONSUMER_SECRET = os.getenv('RDIO_CONSUMER_SECRET')
ACCESS_TOKEN_KEY = os.getenv('MY_RDIO_ACCESS_TOKEN_KEY')
ACCESS_TOKEN_SECRET = os.getenv('MY_RDIO_ACCESS_TOKEN_SECRET')

rdio_manager = rdio.Api(CONSUMER_KEY, CONSUMER_SECRET, ACCESS_TOKEN_KEY, ACCESS_TOKEN_SECRET)

# Make an authorized call.
current_user = rdio_manager.current_user()

def get_track_info(track):
    single_track = {}
    single_track['name'] = track.name
    single_track['key'] = track.key
    single_track['duration'] = track.duration
    return single_track


##### Gets the users collection, including names and lengths
def get_user_collection(current_user):
    collection = [];
    user_collection = rdio_manager.get_albums_in_collection(user=current_user.key)
    # print '**************number of albums: ', len(user_collection)

    for i in range(0, len(user_collection)):
        album = {}
        album['name'] = user_collection[i].name
        album['tracks'] = [];
        tracks = rdio_manager.get_tracks_for_album_in_collection(user_collection[i].key, user=current_user.key)
        # print '******album %d: %s' %(i + 1, user_collection[i].name)
        # print 'number of tracks: ', len(tracks)
        for track in tracks:
            album['tracks'].append(get_track_info(track))
        collection.append(album)

    return collection

##### Gets user's playlists
def get_user_playlist(current_user):
    playlists = []
    user_playlists = rdio_manager.get_playlists(extras=['tracks']).owned_playlists

    for playlist in user_playlists:
        single_playlist = {}
        single_playlist['name'] = playlist.name
        single_playlist['tracks'] = []
        
        for track in playlist.tracks:
            single_playlist['tracks'].append(get_track_info(track))
        playlists.append(single_playlist)

    return playlists

print get_user_playlist(current_user)
# print get_user_collection(current_user)





