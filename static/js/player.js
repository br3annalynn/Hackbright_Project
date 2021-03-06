/*
Copyright (c) 2011 Rdio Inc

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
 */

// a global variable that will hold a reference to the api swf once it has loaded
var apiswf = null;

//playback token and domain for heroku
// var domain = "space-james.herokuapp.com";
// var playback_token = 'GBlSnnLkAPdxb2R2cHlzNHd5ZXg3Z2M0OXdoaDY3aHdrbnNwYWNlLWphbWVzLmhlcm9rdWFwcC5jb21qxunLNj4vuIdykkRblEa2';

//playback token and domain for localhost
var domain = 'localhost';
var playback_token = 'GAlSlUTmAPdxb2R2cHlzNHd5ZXg3Z2M0OXdoaDY3aHdrbmxvY2FsaG9zdGTb13eqrog6UaDbCL0fjP4=';

// var playback_token = $.get('/get_token', playing);
var CURRENTPLAYED = false;
playing(playback_token);

function playing(playback_token){
  
  $(document).ready(function() {
    // on page load use SWFObject to load the API swf into div#apiswf
    // console.log('playback token2: ', playback_token);
    var flashvars = {
      'playbackToken': playback_token, // from token.js
      'domain': domain,                // from token.js
      'listener': 'callback_object'    // the global name of the object that will receive callbacks from the SWF
      };
    var params = {
      'allowScriptAccess': 'always'
    };
    var attributes = {};

    //check for internet
    function setSwf(){
      swfobject.embedSWF('http://www.rdio.com/api/swf/', // the location of the Rdio Playback API SWF
        'apiswf', // the ID of the element that will be replaced with the SWF
        1, 1, '9.0.0', 'expressInstall.swf', flashvars, params, attributes);
    }


    function noSwf(){
      console.log("There is no internet. Music will not play.");
    }


    var i = new Image();
    i.onload = setSwf;
    i.onerror = noSwf;

    i.src = "http://www.johnhpanos.com/jpeg.jpg";

    // swfobject.embedSWF('http://www.rdio.com/api/swf/', // the location of the Rdio Playback API SWF
    //     'apiswf', // the ID of the element that will be replaced with the SWF
    //     1, 1, '9.0.0', 'expressInstall.swf', flashvars, params, attributes);
  

    $('#play').click(function() 
      {
        TRACKNUM = 0;
        playTrack(TRACKNUM);
      });
    $('#play').mousedown(function(){
      $(this).css({'background-image': "url('../static/imgs/deepplay.png')"})});
    $('#play').mouseup(function(){
      $(this).css({'background-image': "url('../static/imgs/newplay.png')"})});
    $('#play').mouseout(function(){
      $(this).css({'background-image': "url('../static/imgs/newplay.png')"})});


    $('#pause').click(function() { apiswf.rdio_pause(); });
    $('#pause').mousedown(function(){
      $(this).css({'background-image': "url('../static/imgs/deeppause.png')"})});
    $('#pause').mouseup(function(){
      $(this).css({'background-image': "url('../static/imgs/newpause.png')"})});
    $('#pause').mouseout(function(){
      $(this).css({'background-image': "url('../static/imgs/newpause.png')"})});

    $('#back').click(function() 
      { 
        CURRENTPLAYED = false;
        if(BELONGS == "a"){
          if(TRACKNUM - 1 < MUSICCOLLECTION[ALBUMNUM]['tracks'].length){
          TRACKNUM = TRACKNUM - 1;
          playTrack(TRACKNUM);
          }
          else{
            console.log('this is the last track on this album');
          }
        }
        else{
          if(TRACKNUM - 1 < PLAYLISTS[PLAYLISTNUM]['tracks'].length){
          TRACKNUM = TRACKNUM - 1;
          playTrack(TRACKNUM);
          }
          else{
            console.log('this is the last track on this playlist');
          }
        }
      });
    $('#back').mousedown(function(){
      $(this).css({'background-image': "url('../static/imgs/deepback.png')"})});
    $('#back').mouseup(function(){
      $(this).css({'background-image': "url('../static/imgs/newback.png')"})});
    $('#back').mouseout(function(){
      $(this).css({'background-image': "url('../static/imgs/newback.png')"})});


    $('#fwd').click(function() 
      { 
        CURRENTPLAYED = false;
        if(BELONGS == "a"){
          if(TRACKNUM + 1 < MUSICCOLLECTION[ALBUMNUM]['tracks'].length){
          TRACKNUM = TRACKNUM + 1;
          playTrack(TRACKNUM);
          }
          else{
            console.log('this is the last track on this album');
          }
        }
        else{
          if(TRACKNUM + 1 < PLAYLISTS[PLAYLISTNUM]['tracks'].length){
          TRACKNUM = TRACKNUM + 1;
          playTrack(TRACKNUM);
          }
          else{
            console.log('this is the last track on this playlist');
          }
        }
        
      });
    $('#fwd').mousedown(function(){
      $(this).css({'background-image': "url('../static/imgs/deepfwd.png')"})});
    $('#fwd').mouseup(function(){
      $(this).css({'background-image': "url('../static/imgs/newfwd.png')"})});
    $('#fwd').mouseout(function(){
      $(this).css({'background-image': "url('../static/imgs/newfwd.png')"})});

  })
}


function playMusic(){
  // console.log('clicked');
  CURRENTPLAYED = false;
  TRACKNUM = parseInt($(this).attr('songNumber'));
  playTrack(TRACKNUM);
}


function playTrack(trackNumber){
  if(BELONGS == "a"){
    var key = MUSICCOLLECTION[ALBUMNUM]['tracks'][trackNumber]['key'];
    // console.log('playing: ', MUSICCOLLECTION[ALBUMNUM]['tracks'][trackNumber]['name']);
  }
  else if(BELONGS == "p"){
    var key = PLAYLISTS[PLAYLISTNUM]['tracks'][trackNumber]['key'];
    findSS(key);
    // console.log('playing: ', PLAYLISTS[PLAYLISTNUM]['tracks'][trackNumber]['name']);
  }
  apiswf.rdio_play(key);
  highlightName(trackNumber);
}


// the global callback object
var callback_object = {};

callback_object.ready = function ready(user) {
  // Called once the API SWF has loaded and is ready to accept method calls.

  // find the embed/object element
  apiswf = $('#apiswf').get(0);

  apiswf.rdio_startFrequencyAnalyzer({
    frequencies: '10-band',
    period: 100
  });

}


callback_object.freeRemainingChanged = function freeRemainingChanged(remaining) {
  $('#remaining').text(remaining);
}


callback_object.playStateChanged = function playStateChanged(playState) {
  // The playback state has changed.
  // The state can be: 0 - paused, 1 - playing, 2 - stopped, 3 - buffering or 4 - paused.
  // console.log(playState);
  if(playState == 1){
    CURRENTPLAYED = true;
  }
  if(playState == 2){
    if(CURRENTPLAYED == true){
      TRACKNUM = TRACKNUM + 1;
      CURRENTPLAYED = false;
      playTrack(TRACKNUM);
      
    }
  }
}


callback_object.playingTrackChanged = function playingTrackChanged(playingTrack, sourcePosition) {
  // The currently playing track has changed.
  // Track metadata is provided as playingTrack and the position within the playing source as sourcePosition.
}


callback_object.playingSourceChanged = function playingSourceChanged(playingSource) {
  // The currently playing source changed.
  // The source metadata, including a track listing is inside playingSource.
}


callback_object.volumeChanged = function volumeChanged(volume) {
  // The volume changed to volume, a number between 0 and 1.
}


callback_object.muteChanged = function muteChanged(mute) {
  // Mute was changed. mute will either be true (for muting enabled) or false (for muting disabled).
}


callback_object.positionChanged = function positionChanged(position) {
  //The position within the track changed to position seconds.
  // This happens both in response to a seek and during playback.
  // console.log("position: ", position);
}


callback_object.queueChanged = function queueChanged(newQueue) {
  // The queue has changed to newQueue.
}


callback_object.shuffleChanged = function shuffleChanged(shuffle) {
  // The shuffle mode has changed.
  // shuffle is a boolean, true for shuffle, false for normal playback order.
}


callback_object.repeatChanged = function repeatChanged(repeatMode) {
  // The repeat mode change.
  // repeatMode will be one of: 0: no-repeat, 1: track-repeat or 2: whole-source-repeat.
}


callback_object.playingSomewhereElse = function playingSomewhereElse() {
  // An Rdio user can only play from one location at a time.
  // If playback begins somewhere else then playback will stop and this callback will be called.
}


callback_object.updateFrequencyData = function updateFrequencyData(arrayAsString) {
  // console.log("frequency: ");
  // console.log(arrayAsString);
  // Called with frequency information after apiswf.rdio_startFrequencyAnalyzer(options) is called.
  // arrayAsString is a list of comma separated floats.

  // var arr = arrayAsString.split(',');

  // $('#freq div').each(function(i) {
  //   $(this).width(parseInt(parseFloat(arr[i])*500));
  // })
}

