var tabLinks = new Array();
var contentDivs = new Array();

function init() {

      // Grab the tab links and content divs from the page
      var tabListItems = document.getElementById('tabs').childNodes;
      for ( var i = 0; i < tabListItems.length; i++ ) {
        if ( tabListItems[i].nodeName == "LI" ) {
          var tabLink = getFirstChildWithTagName( tabListItems[i], 'A' );
          var id = getHash( tabLink.getAttribute('href') );
          tabLinks[id] = tabLink;
          contentDivs[id] = document.getElementById( id );
        }
      }

      // Assign onclick events to the tab links, and
      // highlight the first tab
      var i = 0;

      for ( var id in tabLinks ) {
        tabLinks[id].onclick = showTab;
        tabLinks[id].onfocus = function() { this.blur() };
        if ( i == 0 ) tabLinks[id].className = 'selected';
        i++;
      }

      //assign onclick event for albums
        $('.album').click(function(){
            $('#musicbox').hide();
            $('playlistbox').hide();
            $('#playbox').show();
            ALBUMNUM = $(this).attr('albumNumber')
            fillInAlbumBox(ALBUMNUM);
            ALBUMCLICKED = true;
            
        });

        // $('.playlist').click(function(){
        //     $('#musicbox').hide();
        //     $('playlistbox').hide();
        //     $('#playbox').show();
        //     ALBUMNUM = $(this).attr('albumNumber')
        //     fillInAlbumBox(ALBUMNUM);
        //     ALBUMCLICKED = true;
            
        // });
    
        $('#username').click(function(){
            $('#albumbox').empty();
            $('#username').empty();
            $('#playbox').hide();
            $('#musicbox').show();
            ALBUMCLICKED = false;

            
      });

      // Hide all content divs except the first
      var i = 0;

      for ( var id in contentDivs ) {
        if ( i != 0 ) contentDivs[id].className = 'tabContent hide';
        i++;
      }
    }


function showTab() {
    var selectedId = getHash( this.getAttribute('href') );

    // Highlight the selected tab, and dim all others.
    // Also show the selected content div, and hide all others.
    for ( var id in contentDivs ) {
        if ( id == selectedId ) {
          tabLinks[id].className = 'selected';
          contentDivs[id].className = 'tabContent';
        } else {
          tabLinks[id].className = '';
          contentDivs[id].className = 'tabContent hide';
        }
    }

    // Stop the browser following the link
    return false;
}


function getFirstChildWithTagName( element, tagName ) {
    for ( var i = 0; i < element.childNodes.length; i++ ) {
        if ( element.childNodes[i].nodeName == tagName ) return element.childNodes[i];
    }
}


function getHash( url ) {
    var hashPos = url.lastIndexOf ( '#' );
    return url.substring( hashPos + 1 );
}

function fillInMusicbox(){
    $('#playbox').hide();
    $('#user_music').append(USERNAME, "'s Music");

    for(var i = 0; i < MUSICCOLLECTION.length; i++){
        var albumTitle = MUSICCOLLECTION[i]['name'];
        $('#album_list').append('<p class="album" id="album' + i + '" albumNumber="' + i + '">' + albumTitle + '<p>');
    }

    for(var i = 0; i < PLAYLISTS.length; i++){
        var playlistTitle = PLAYLISTS[i]['name'];
        $('#playlist_list').append('<p class="playlist" id="playist' + i + '" playlistNumber="' + i + '">' + playlistTitle + '<p>');
    }
}

function fillInAlbumBox(albumNum){
    $('#username').append(USERNAME, "'s Music");
    var albumName = MUSICCOLLECTION[albumNum]['name'];
    $('#albumbox').append('<h2>' + albumName + '</h2>');
    var albumTracks = MUSICCOLLECTION[albumNum]['tracks'];
    for(var i = 0; i < albumTracks.length; i++){
        $('#albumbox').append('<p>' + albumTracks[i]['name'] + '</p>');
    }
}

function fillInPlaylistBox(playlistNum){
    $('#username').append(USERNAME, "'s Music");
    var playlistName = PLAYLISTS[playlistNum]['name'];
    $('#albumbox').append('<h2>' + playlistName + '</h2>');
    var playlistTracks = PLAYLISTS[playlistNum]['tracks'];
    for(var i = 0; i < playlistTracks.length; i++){
        $('#albumbox').append('<p>' + playlistTracks[i]['name'] + '</p>');
    }
}

////////////////////////////////////
var USERNAME;
var PLAYLISTS;
var ALBUMNUM = 0;


result = $.get('/get_playlists', import_playlists);

function import_playlists(result){
    // set music collection to a list of album dictionaries

    var data = $.parseJSON(result);
    PLAYLISTS = data['playlists'];
    USERNAME = data['user_name'].split(" ")[0];
    fillInMusicbox();
    init();
}





