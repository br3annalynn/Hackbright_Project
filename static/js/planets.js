
function buildScene(){
    SCENE = new THREE.Scene();
    CAMERA = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 100000);
    RENDERER = new THREE.WebGLRenderer();
    RENDERER.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(RENDERER.domElement);
    CAMERA.position.z = 0;
}


function randNum(minRange, maxRange){
    //random returns number between 0, 1
    var randFloat = Math.random();
    return minRange + randFloat * (maxRange - minRange);
}


function randInteger(minRange, maxRange){
    var randFloat = randNum(minRange, maxRange);
    return Math.floor(randFloat);
}


function buildGalaxy(numOfSolarSystems){
    
    var light = new THREE.AmbientLight( 0xCCCC66 );
    SCENE.add(light);
    
    for(var i = 0; i < numOfSolarSystems; i++){
        var solarSystem = new aSolarSystem(MUSICCOLLECTION[i]['tracks']);
        solarSystem.buildSolarSystem();
        solarSystem.translateSS();
        solarSystem.rotateSS();
        solarSystem.setToLocal();
        
        GALAXYLIST.push(solarSystem);
        SCENE.add(solarSystem.solarSystemGroup);
    }
}


function checkLocations(potentialLocation){
    // console.log('checking for location against list:', GALAXYLIST);
    for(var i = 0; i < GALAXYLIST.length; i++){
        if(potentialLocation.distanceTo(GALAXYLIST[i].solarSystemLocation) < 10000){
            return false;
        }
    }
    return true;
}


function aSolarSystem(trackList){
    this.numOfPlanets = trackList.length;
    this.solarSystemList = [];
    this.solarSystemGroup = null;
    this.solarSystemLocation = new THREE.Vector3(0,0,0);
    this.toLocation = new THREE.Vector3(0,0,0);
    this.tipAngle = 0;
    this.trackList = trackList;

    this.buildSolarSystem = function(){
        var group = new THREE.Object3D();
        var sunMaterials = SUNTEXTURES[0];
        //speed of sun rotation
        var mySun = new aPlanet(300, sunMaterials, 0, 0, true, 0);
        var sphere = mySun.buildPlanet();
        mySun.rotAxis();
        group.add(sphere);
        this.solarSystemList.push(mySun);

        var lastDist = 300;
        for(var i = 0; i < this.numOfPlanets; i++){
            //number between 0 and 5
            randInt = randInteger(0, PLANETTEXTURES.length);
            //list of two: image, texture
            var planetMaterials = PLANETTEXTURES[randInt];
            var distance = lastDist + (randNum(130, 300));
            lastDist = distance;
            var startAngle = randNum(0,6);
            var duration = this.trackList[i]['duration'];
            var planetRadius = duration / 4;
            var planet = new aPlanet(planetRadius, planetMaterials, distance, startAngle, false, duration);
            var planetSphere = planet.buildPlanet();
            var planetOrbit = planet.showOrbitPath();
            planet.rotAxis();
            group.add(planetSphere);
            group.add(planetOrbit); 
            this.solarSystemList.push(planet);
        }

        var sunlight = new THREE.PointLight(0xFFFFFF, .8, this.numOfPlanets * 1000);
        group.add(sunlight);
        this.solarSystemGroup = group;
    }


    this.translateSS = function(){
        //check if the location is too close to a current solar system in the galaxy
        var randDist = 0;
        var randDist2 = 0;
        var potentialLocation = new THREE.Vector3(0,0,0);
        var check = false;
        while(check == false){
            randDist = randNum(-60000, 60000);
            randDist2 = randNum(-20000, 20000);
            potentialLocation = new THREE.Vector3(0,0,0);
            potentialLocation.addVectors(new THREE.Vector3(GALAXYAXIS.x * randDist, GALAXYAXIS.y * randDist, GALAXYAXIS.z * randDist), new THREE.Vector3(0, 0, randDist2));
            check = checkLocations(potentialLocation);
        }

        this.solarSystemGroup.translateOnAxis(GALAXYAXIS, randDist);
        this.solarSystemGroup.translateOnAxis(new THREE.Vector3(0, 0, 1), randDist2);
        this.solarSystemLocation.addVectors(new THREE.Vector3(GALAXYAXIS.x * randDist, GALAXYAXIS.y * randDist, GALAXYAXIS.z * randDist), new THREE.Vector3(0, 0, randDist2));

    }
    

    this.rotateSS = function(){
        this.tipAngle = randNum(0, .7);
        this.solarSystemGroup.rotateOnAxis(new THREE.Vector3(0, 0, 1), this.tipAngle);
        this.solarSystemGroup.rotateOnAxis(new THREE.Vector3(1, 0, 0), 0.35);
    }
    

    this.setToLocal = function(){
        var lastPlanetDist = this.solarSystemList[this.numOfPlanets - 1].distFromCenter * 1.5;
        this.toLocation.addVectors(this.solarSystemLocation, new THREE.Vector3(lastPlanetDist * Math.cos(this.tipAngle), lastPlanetDist * Math.sin(this.tipAngle), lastPlanetDist + 1500));
    } 
}


function aPlanet(radius, materials, distFromCenter, angularSpeed, isSun, duration){
    this.radius = radius;
    this.image = IMAGESFOLDER + materials[0];
    this.texture = IMAGESFOLDER + materials[1];
    //Planet distance from sun
    this.distFromCenter = distFromCenter;
    this.planetGeom = null;
    this.rotAxis = null;
    this.angleOfRot = null;
    //angular speed is updated during render and represents the angle around the ellipse
    this.angularSpeed = angularSpeed;
    this.isSun = isSun;
    this.lengthOfOrbit = 2 * Math.PI * Math.sqrt((this.distFromCenter * this.distFromCenter + 1.5 * this.distFromCenter * 1.5 * this.distFromCenter) / 2);
    // console.log(this.lengthOfOrbit);
    if(isSun){
        this.angleOfRot = 0.002;
    }
    else{
        // set division to length of song
        this.angleOfRot = this.lengthOfOrbit / (duration * 60 * 1000);
    }


    this.buildPlanet = function(){
        // console.log('building planets geometry and texture');
        var geometry = new THREE.SphereGeometry(this.radius, 15, 15);  
        var material = new THREE.MeshPhongMaterial({
            map: THREE.ImageUtils.loadTexture(this.image),
            bumpMap: THREE.ImageUtils.loadTexture(this.texture),
            // bumpScale: this.bump
            bumpScale: 5
        });

        var sphere = new THREE.Mesh(geometry, material);
        if(isSun){
            // console.log('adding flare');
            var spriteMaterial = new THREE.SpriteMaterial({ 
                    map: new THREE.ImageUtils.loadTexture( IMAGESFOLDER + 'lensflare.png' ), 
                    useScreenCoordinates: false, 
                    alignment: THREE.SpriteAlignment.center,
                    color: 0xFFFF66, 
                    transparent: false, blending: THREE.AdditiveBlending
            });
            var sprite = new THREE.Sprite( spriteMaterial );
            sprite.scale.set(3000, 3000, 70.0);
            sphere.add(sprite); // this centers the glow at the mesh
        };
        this.planetGeom = sphere;
        return sphere;
    }


    this.showOrbitPath = function(){
        ///makes an ellipse outline
        var geometry = new THREE.Geometry();
        var material = new THREE.LineBasicMaterial( { color: 0x666666, opacity: .2, transparent: true} );
        for(var i = 0; i < 360; i++){
            var thetha = i * Math.PI / 180;
            geometry.vertices.push( new THREE.Vector3(this.distFromCenter * 1.5 * Math.cos(thetha), 0,  distFromCenter * Math.sin(thetha))) 
        }
        return new THREE.Line(geometry, material);
    }


    this.rotAxis = function(){
        if(this.isSun){
            this.rotAxis = new THREE.Vector3(0, 1, 0);
        }
        else{
            var vectorAngle = Math.random();
            var vectora = vectorAngle;
            var vectorb = vectorAngle * 4;
            this.rotAxis = new THREE.Vector3(vectora, vectorb, 0.1).normalize();
            // this.rotAxis = new THREE.Vector3(0, 1, 0);
        }
    }


    this.updateSpin = function(){
        this.planetGeom.rotateOnAxis(this.rotAxis, -0.003);

    }


    this.updateOrbit = function(){
        //make planets follow an ellpitical path along the xz-plane
        x_direction = this.distFromCenter * 1.5 * Math.cos(this.angularSpeed);
        z_direction = this.distFromCenter * Math.sin(this.angularSpeed);

        this.planetGeom.position.x = x_direction;
        this.planetGeom.position.z = z_direction;
    }
}


function moveCameraToSS(currentSolarSystem, out){
    //find directional vector (camera - position)
    if(out){
        var toLocation = new THREE.Vector3(0, 0, 70000);
    }
    else{
        var toLocation = currentSolarSystem.toLocation;
    }

    //find directional vector (camera - position)
    var directVector = new THREE.Vector3(toLocation.x - CAMERA.position.x, toLocation.y - CAMERA.position.y, toLocation.z - CAMERA.position.z);
    
    CAMERA.lookAt(currentSolarSystem.solarSystemLocation);

    if(CAMERA.position.distanceTo(toLocation) > 8000){
        CAMERA.position.x = CAMERA.position.x + directVector.x * COUNTER;
        CAMERA.position.y = CAMERA.position.y + directVector.y * COUNTER;
        CAMERA.position.z = CAMERA.position.z + directVector.z * COUNTER;
        COUNTER = COUNTER + 0.00008;
    }

    if(CAMERA.position.distanceTo(toLocation) < 8000 && CAMERA.position.distanceTo(toLocation) > 0){
        CAMERA.position.x = CAMERA.position.x + directVector.x * COUNTER;
        CAMERA.position.y = CAMERA.position.y + directVector.y * COUNTER;
        CAMERA.position.z = CAMERA.position.z + directVector.z * COUNTER;
        COUNTER = COUNTER + 0.00008/(8000.009 - CAMERA.position.distanceTo(toLocation));
    }
}


function highlightPlanet(belongs, trackNumber){
    
    //unhighlight all planets
    for(var i = 0; i < GALAXYLIST[ALBUMNUM].solarSystemList.length; i++){
        var scaleFactor = GALAXYLIST[ALBUMNUM].solarSystemList[trackNumber + 1].radius / 150;
        var onePlanet = GALAXYLIST[ALBUMNUM].solarSystemList[i];
        onePlanet.planetGeom.material.map = THREE.ImageUtils.loadTexture(onePlanet.image);
        onePlanet.planetGeom.material.needsUpdate = true;
        onePlanet.planetGeom.scale.set(1, 1, 1);
    }
    //highlight selected planet
    var scaleFactor = 150 / GALAXYLIST[ALBUMNUM].solarSystemList[trackNumber + 1].radius;
    GALAXYLIST[ALBUMNUM].solarSystemList[trackNumber + 1].planetGeom.material.map = THREE.ImageUtils.loadTexture(IMAGESFOLDER + SONGTEXTURES[0]);
    GALAXYLIST[ALBUMNUM].solarSystemList[trackNumber + 1].planetGeom.material.needsUpdate = true;
    GALAXYLIST[ALBUMNUM].solarSystemList[trackNumber + 1].planetGeom.scale.set(scaleFactor, scaleFactor, scaleFactor);
}


function findSS(key){
    for(var i = 0; i < MUSICCOLLECTION.length; i++){
        for(var x = 0; x < MUSICCOLLECTION[i]['tracks'].length; x++){
            if(MUSICCOLLECTION[i]['tracks'][x]['key'] == key){
                ALBUMNUM = i;
                ALBUMCLICKED = true;
                break;
            }
        }
    }
}


function onKeyPress(e) {
               
    if (e.keyCode == '37') {
        e.preventDefault();
        console.log('left pressed');
        GALAXYLIST[ALBUMNUM].toLocation.x = GALAXYLIST[ALBUMNUM].toLocation.x - 100;
    }

    else if (e.keyCode == '38' && !e.shiftKey) {
        e.preventDefault();
        console.log('up pressed');
        GALAXYLIST[ALBUMNUM].toLocation.y = GALAXYLIST[ALBUMNUM].toLocation.y + 100;
    }

    else if (e.keyCode == '39') {
        e.preventDefault();
        console.log('right pressed');
        GALAXYLIST[ALBUMNUM].toLocation.x = GALAXYLIST[ALBUMNUM].toLocation.x + 100;
    }

    else if (e.keyCode == '40' && !e.shiftKey) {
        e.preventDefault();
        console.log('down pressed', e.shiftKey);
        GALAXYLIST[ALBUMNUM].toLocation.y = GALAXYLIST[ALBUMNUM].toLocation.y - 100;
    }

    else if (e.keyCode == '38' && e.shiftKey) {
        e.preventDefault();
        console.log('up and shift pressed');
        GALAXYLIST[ALBUMNUM].toLocation.z = GALAXYLIST[ALBUMNUM].toLocation.z - 100;
    }

    else if (e.keyCode == '40' && e.shiftKey) {
        e.preventDefault();
        console.log('down and shift pressed');
        GALAXYLIST[ALBUMNUM].toLocation.z = GALAXYLIST[ALBUMNUM].toLocation.z + 100;
    }
}


//this creates a loop that runs every 60th of a sec
function render(){

    for(var i = 0; i < GALAXYLIST.length; i++){
        for(var x = 0; x < GALAXYLIST[i].solarSystemList.length; x++){
            GALAXYLIST[i].solarSystemList[x].updateSpin();
            GALAXYLIST[i].solarSystemList[x].angularSpeed += GALAXYLIST[i].solarSystemList[x].angleOfRot;
            GALAXYLIST[i].solarSystemList[x].updateOrbit();
        }
    }
    
    RENDERER.render(SCENE, CAMERA);
  
    if(ALBUMCLICKED){
        moveCameraToSS(GALAXYLIST[ALBUMNUM], false);
        }
    
    else{
        moveCameraToSS(GALAXYLIST[ALBUMNUM], true);
    }
 
    requestAnimationFrame(render);
}
         

function main(){

    //build SCENE
    buildScene();

    //build galaxy
    var numOfSS = MUSICCOLLECTION.length;
    buildGalaxy(numOfSS);
    
    //add avent listener for arrow keys to change camera views
    document.addEventListener('keypress', onKeyPress, false);
 
    //render the SCENE
    render();
}


///////////////////////////////////////////////////////////////////////////////

//global variables
var SCENE, CAMERA, RENDERER;
var CLOCK = new THREE.Clock(true);
var IMAGESFOLDER = "../static/images/"


var PLANETTEXTURES = [
    ["jupitermap.jpg", "marsbump1k.jpg"],
    ["marsmap1k.jpg", "marsbump1k.jpg"],
    ["mercurymap.jpg", "mercurybump.jpg"],
    ["plutomap1k.jpg", "plutobump1k.jpg"],
    ["saturnmap.jpg", "plutobump1k.jpg"],
    ["venusmap.jpg", "venusbump.jpg"],
    ["neptunemap.jpg", "mercurybump.jpg"],
    ["uranusmap.jpg", "venusbump.jpg"],
    ["planet1.jpeg", "venusbump.jpg"],
    ["planet2.jpeg", "venusbump.jpg"],
    ["planet3.jpeg", "venusbump.jpg"],
];

var SONGTEXTURES = ["earthmap1k.jpg", "earthbump1k.jpg"];


var SUNTEXTURES = [
                ['sunmap.jpg', 'generic_bump.jpg'],
               ];
          
var GALAXYLIST = [];
var GALAXYAXIS = new THREE.Vector3(1, .15, 0.1).normalize();
var MUSICCOLLECTION = [];
var ALBUMCLICKED = false;
var COUNTER = 0;
var HIGHLIGHT = false;


$.get('/get_music_collection', resultsReturned1);

var COUNT = 0;
var RESULTS1;

function resultsReturned1(result){
    COUNT++;
    RESULTS1 = result;
    if(COUNT == 2){
        importPlaylists(RESULTS2);
        importMusic(RESULTS1);
    }
}

function importMusic(result){
    // set music collection to a list of album dictionaries

    var data = $.parseJSON(result);
    MUSICCOLLECTION = data['collection'];
    main();
}



