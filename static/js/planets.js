
function buildScene(){
    // console.log('building scene');
    SCENE = new THREE.Scene();
    CAMERA = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 80000);
    RENDERER = new THREE.WebGLRenderer();
    RENDERER.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(RENDERER.domElement);
    CAMERA.position.z = 50000;
   
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
        // set numOfPlanets to number of songs on album
        var numOfPlanets = MUSICCOLLECTION[i]['tracks'].length;
        var solarSystem = new aSolarSystem(numOfPlanets);
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

function aSolarSystem(numOfPlanets){
    this.numOfPlanets = numOfPlanets;
    this.solarSystemList = [];
    this.solarSystemGroup = null;
    this.solarSystemLocation = new THREE.Vector3(0,0,0);
    //set distance to view to 800 outside last orbit ring
    this.toLocation = new THREE.Vector3(0,0,0);
    this.tipAngle = 0;


    this.buildSolarSystem = function(){
        var group = new THREE.Object3D();
        // a number between 0 and 5.9;
        var randInt = randInteger(0, SUNTEXTURES.length);
        var sunMaterials = SUNTEXTURES[0];
        //speed of sun rotation
        var mySun = new aPlanet(300, sunMaterials, 0, 0, true);
        var sphere = mySun.buildPlanet();
        mySun.rotAxis();
        group.add(sphere);
        this.solarSystemList.push(mySun);

        var lastDist = 300;
        for(var i = 0; i < this.numOfPlanets; i++){
            //number between 0 and 5
            randInt = randInteger(0, PLANETTEXTURES.length);
            //list of two: image and texture
            var planetMaterials = PLANETTEXTURES[randInt];
            // //make speed slower the further out you go
            // var angle = randNum(4, 7) / 1000;
            //distance from the sun - moves planets out by 100 each time
            var distance = lastDist + (randNum(130, 300));
            lastDist = distance;
            var startAngle = randNum(0,6);
            randRadius = randNum(30, 100);
            var planet = new aPlanet(randRadius, planetMaterials, distance, startAngle, false);
            var planetSphere = planet.buildPlanet();
            var planetOrbit = planet.showOrbitPath();
            planet.rotAxis();
            group.add(planetSphere);
            group.add(planetOrbit); 
            this.solarSystemList.push(planet);

        }
        var sunlight = new THREE.PointLight(0xFFFFFF, .5, this.numOfPlanets * 1000);
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
            randDist = randNum(-30000, 30000);
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
        // console.log('rotating solar system');
        this.tipAngle = randNum(0, 1);
        this.solarSystemGroup.rotateOnAxis(new THREE.Vector3(0, 0, 1), this.tipAngle);
        this.solarSystemGroup.rotateOnAxis(new THREE.Vector3(1, 0, 0), 0.35);
    }
    
    this.setToLocal = function(){
        var lastPlanetDist = this.solarSystemList[this.numOfPlanets - 1].distFromCenter * 1.5;
        // console.log("tipAngle: ", this.tipAngle);
        // console.log("last planet dist: ", lastPlanetDist);
        this.toLocation.addVectors(this.solarSystemLocation, new THREE.Vector3(lastPlanetDist * Math.cos(this.tipAngle), lastPlanetDist * Math.sin(this.tipAngle), 2000));
        // console.log("solar system local: ", this.solarSystemLocation, "Added to location: ", this.toLocation);
    }
}

function aPlanet(radius, materials, distFromCenter, angularSpeed, isSun){
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
    if(isSun){
        this.angleOfRot = -0.002;
    }
    else{
        // set division to length of song
        this.angleOfRot = this.lengthOfOrbit / 180;
    }

    this.buildPlanet = function(){
        // console.log('building planets geometry and texture');
        var geometry = new THREE.SphereGeometry(this.radius, 30, 30);  
        var material = new THREE.MeshPhongMaterial({
            map: THREE.ImageUtils.loadTexture(this.image),
            bumpMap: THREE.ImageUtils.loadTexture(this.texture),
            bumpScale: 5
        });

        var sphere = new THREE.Mesh(geometry, material);
        if(isSun){
            console.log('adding flare');
            var spriteMaterial = new THREE.SpriteMaterial({ 
                    map: new THREE.ImageUtils.loadTexture( IMAGESFOLDER + 'lensflare.png' ), 
                    useScreenCoordinates: false, alignment: THREE.SpriteAlignment.center,
                    color: 0xFFFF66, transparent: false, blending: THREE.AdditiveBlending
            });
            var sprite = new THREE.Sprite( spriteMaterial );
            sprite.scale.set(2000, 2000, 70.0);
            sphere.add(sprite); // this centers the glow at the mesh
        };
        this.planetGeom = sphere;
        return sphere;
    }

    this.showOrbitPath = function(){
        // console.log('showing the orbital path');
        ///makes an ellipse outline
        var geometry = new THREE.Geometry();
        var material = new THREE.LineBasicMaterial( { color: 0x666666, opacity: .5, transparent: true} );
        for(var i = 0; i < 360; i++){
            var thetha = i * Math.PI / 180;
            geometry.vertices.push( new THREE.Vector3(this.distFromCenter*1.5*Math.cos(thetha), 0,  distFromCenter*Math.sin(thetha))) 
        }
        return new THREE.Line(geometry, material);
        
    }
    // this.findOrbitalLength = function(){
    //     var d = this.distFromCenter;
    //     this.lengthOfOrbit = 2 * Math.PI * Math.sqrt((this.distFromCenter * this.distFromCenter + 1.5 * this.distFromCenter * 1.5 * this.distFromCenter) / 2);
    // }

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
        this.planetGeom.rotateOnAxis(this.rotAxis, this.angleOfRot);

    }

    this.updateOrbit = function(){
        //make planets follow an ellpitical path along the xz-plane
        x_direction = this.distFromCenter*1.5*Math.cos(this.angularSpeed);
        z_direction = this.distFromCenter*Math.sin(this.angularSpeed);

        this.planetGeom.position.x = x_direction;
        this.planetGeom.position.z = z_direction;
    }
}
// function turnToNext(currentSolarSystem, nextSolarSystem){
//     var travelVector = new THREE.Vector3(nextSolarSystem.solarSystemLocation.x - currentSolarSystem.solarSystemLocation.x, nextSolarSystem.solarSystemLocation.y - currentSolarSystem.solarSystemLocation.y, nextSolarSystem.solarSystemLocation.z - currentSolarSystem.solarSystemLocation.z);
//     if(CAMERA.)
// }

function moveCameraToSS(currentSolarSystem, out){
    //find directional vector (camera - position)
    if(out){
        var toLocation = new THREE.Vector3(0, 0, 50000);
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
        COUNTER = COUNTER + 0.00008/(8000.09 - CAMERA.position.distanceTo(toLocation));
    }
}

function highlightPlanet(belongs, trackNumber){
    if(belongs == "a"){
        //unhighlist all planets
        for(var i = 0; i < GALAXYLIST[ALBUMNUM].solarSystemList.length; i++){
            console.log('yo');
            var onePlanet = GALAXYLIST[ALBUMNUM].solarSystemList[i];
            console.log(onePlanet.image);
            onePlanet.planetGeom.material.map = THREE.ImageUtils.loadTexture(onePlanet.image);
            onePlanet.planetGeom.material.needsUpdate = true;
            console.log(onePlanet.planetGeom.material.map);
            onePlanet.planetGeom.scale.set(1, 1, 1);
        }
        //highlight selected planet
        
        GALAXYLIST[ALBUMNUM].solarSystemList[trackNumber + 1].planetGeom.material.map = THREE.ImageUtils.loadTexture(IMAGESFOLDER + SONGTEXTURES[0]);
        GALAXYLIST[ALBUMNUM].solarSystemList[trackNumber + 1].planetGeom.material.needsUpdate = true;
        GALAXYLIST[ALBUMNUM].solarSystemList[trackNumber + 1].planetGeom.scale.set(2, 2, 2);
    }
    
}

function onkeypress(e) {
               
    if (e.keyCode == '37') {
        e.preventDefault();
        console.log('left pressed');
        CAMERA.position.x = CAMERA.position.x - 10;
    }
    else if (e.keyCode == '38') {
        e.preventDefault();
        console.log('up pressed');
        CAMERA.position.y = CAMERA.position.y + 20;
    }
    else if (e.keyCode == '39') {
        e.preventDefault();
        console.log('right pressed');
        CAMERA.position.x = CAMERA.position.x + 20;
    }
    else if (e.keyCode == '40') {
        e.preventDefault();
        console.log('down pressed');
        CAMERA.position.y = CAMERA.position.y - 20;
    }
}
var VECTOR = new THREE.Vector3(0, 0, 0);
//this creates a loop that runs every 60th of a sec
function render(){

    // if(HIGHLIGHT){
    //     //th planet that is playing
    //     GALAXYLIST[ALBUMNUM].solarSystemList[PLANETPLAYING + 1].
    //     console.log(GALAXYLIST[ALBUMNUM].solarSystemList[PLANETPLAYING + 1]);
    // }

    for(var i = 0; i < GALAXYLIST.length; i++){
        for(var x = 0; x < GALAXYLIST[i].solarSystemList.length; x++){
            GALAXYLIST[i].solarSystemList[x].updateSpin();
            GALAXYLIST[i].solarSystemList[x].angularSpeed += GALAXYLIST[i].solarSystemList[x].angleOfRot;
            GALAXYLIST[i].solarSystemList[x].updateOrbit();
        }
    }
    
    RENDERER.render(SCENE, CAMERA);
  
    if (ALBUMCLICKED){
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
    
    document.addEventListener('keypress', onkeypress, false);
    //////////change from click to while clicked
    $('#upButton').mousedown(function(e){CAMERA.position.y = CAMERA.position.y + 50});
    $('#downButton').mousedown(function(e){CAMERA.position.y = CAMERA.position.y - 50});
    $('#leftButton').mousedown(function(e){CAMERA.position.x = CAMERA.position.x - 50});
    $('#rightButton').mousedown(function(e){CAMERA.position.x = CAMERA.position.x + 50});
    $('#outButton').mousedown(function(e){CAMERA.position.z = CAMERA.position.z + 50});
    $('#inButton').mousedown(function(e){CAMERA.position.z = CAMERA.position.z - 50});


    //render the SCENE
    render();
}

///////////////////////////////////////////////////////////////////////////////

//global variables
var SCENE, CAMERA, RENDERER;
var CLOCK = new THREE.Clock(true);
var IMAGESFOLDER = "../static/images/"

/*
 * This list holds lists of one or two elements.
 * The first element is always a texture to be applied to a sphere.
 * The second element, if there is one, is a bump map to be
 * applied to a sphere.
 */

var PLANETTEXTURES = [
    ["jupitermap.jpg", "marsbump1k.jpg"],
    ["marsmap1k.jpg", "marsbump1k.jpg"],
    ["mercurymap.jpg", "mercurybump.jpg"],
    ["moonmap1k.jpg", "moonbump1k.jpg"],
    ["plutomap1k.jpg", "plutobump1k.jpg"],
    ["saturnmap.jpg", "plutobump1k.jpg"],
    ["venusmap.jpg", "venusbump.jpg"],
    ["neptunemap.jpg", "mercurybump.jpg"],
    ["uranusmap.jpg", "venusbump.jpg"]
];

var SONGTEXTURES = ["earthmap1k.jpg", "earthbump1k.jpg"];


var SUNTEXTURES = [
                ['sunmap.jpg', 'generic_bump.jpg'],
                ['sun.png', 'generic_bump.jpg'],
                ['sun1.gif', 'generic_bump.jpg'],
                ['sun.jpg', 'generic_bump.jpg'],
                ['sun4.jpg', 'generic_bump.jpg']
               ];
          

var GALAXYLIST = [];
var GALAXYAXIS = new THREE.Vector3(1, .15, 0.1).normalize();
var MUSICCOLLECTION;
var ALBUMCLICKED = false;
var COUNTER = 0;
var HIGHLIGHT = false;
// var SPOTLIGHT = new THREE.SpotLight( 0xFF3300, 10 );




var result = $.get('/get_music_collection', import_music);

function import_music(result){
    // set music collection to a list of album dictionaries

    var data = $.parseJSON(result);
    MUSICCOLLECTION = data['collection'];
    main();

}



