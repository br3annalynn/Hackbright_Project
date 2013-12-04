#SpaceJamz  
######http://space-james.herokuapp.com/ (Best viewed on Firefox)

SpaceJamz is a 3D space visualization of a user's Rdio music library, inspired by a Bloom project. SpaceJamz visualizes a user's Rdio account in a unique way: each album is represented by a new solar system, where the planets are the songs. Users can play songs, albums, or playlists while the graphics change to the music. 

Made uing: Python, SQLAlchemy, Flask, JavaScript, THREE.js, HTML5 Canvas, WebGL, Rdio API.

![alt text](https://raw.github.com/br3annalynn/Hackbright_Project/master/static/imgs/ScreenShot3.png)


###Space Graphics
######(planets.js)

The space graphics were built using THREE.js, a javascript library that allows you to build 3D objects, place them in 3D space and then move the objects and change the camera view. Planets.js uses a webGL renderer that loops every 60th of a second to animate the planets. The planets orbit using parametric equations that are updated in the renderer. The orbital paths are also drawn using parametric equations. The sun shine is done using a sprite.


###Music Library
######(user\_music.js, player.js, my\_rdio\_search.py)

Once a user logs in, my\_rdio\_search.py sends two requests to the Rdio API to retrieve the user's playlists and music collection. These are then passed using flask, ajax and json to planets.js where the galaxy is populated based on the user's music. Each album is a new solar system and in each solar system the number of planets is equal to the number of songs on the album. The planet's orbit is the length of the song and the planet's size is proportional to the song length. User\_music.js uses the playlist and collections to populate the music box on the left side of the screen, displaying the user's music. Player.js works with the Rdio API to play full songs from the user's collection. When a song plays, the planet corresponding to that song changes into the earth for the duration of the song. 

![alt text](https://raw.github.com/br3annalynn/Hackbright_Project/master/static/imgs/ScreenShot5.png)
