
function buildScene(){
    // console.log('building scene');
    SCENE = new THREE.Scene();
    CAMERA = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 60000);
    RENDERER = new THREE.WebGLRenderer();
    RENDERER.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(RENDERER.domElement);
    CAMERA.position.z = 30000;
   
}

function randNum(minRange, maxRange){
    //random returns number between 0, 1
    var randFloat = Math.random();
    return minRange + randFloat * (maxRange - minRange);
}

function buildGalaxy(numOfSolarSystems){
    

    for(var i = 0; i < numOfSolarSystems; i++){
        // set numOfPlanets to number of songs on album
        var numOfPlanets = MUSICCOLLECTION[i]['tracks'].length;
        var solarSystem = new aSolarSystem(numOfPlanets);
        solarSystem.buildSolarSystem();
        solarSystem.translateSS();
        solarSystem.rotateSS(randNum(0, 1));

        GALAXYLIST.push(solarSystem);
        console.log('adding solar system to the scene');
        SCENE.add(solarSystem.solarSystemGroup);
    }
}

function checkLocations(potentialLocation){
    // console.log('checking for location against list:', GALAXYLIST);
    for(var i = 0; i < GALAXYLIST.length; i++){
        if(potentialLocation.distanceTo(GALAXYLIST[i].solarSystemLocation) < 6000 + GALAXYLIST[i].distanceToView){
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
    this.distanceToView = 1000 + numOfPlanets*200;


    this.buildSolarSystem = function(){
        var group = new THREE.Object3D();
        //a number between 0 and 5.9;
        var randInt = Math.floor(randNum(0, 6));
        var sunImage = sunImages[randInt];
        //speed of sun rotation
        var sunAngle = - 0.001;
        var mySun = new aPlanet(100, sunImage, 0, sunAngle, 0, true);
        var sphere = mySun.buildPlanet();
        mySun.rotAxis();
        group.add(sphere);
        this.solarSystemList.push(mySun);

        // console.log('building', this.numOfPlanets, 'planets');
        for(var i = 0; i < this.numOfPlanets; i++){
            //number between 0 and 5
            randInt = Math.floor(randNum(0, 6));
            var planetImage = planetImages[randInt];
            //make speed slower the further out you go
            var angle = (this.numOfPlanets + 1 - i) / 1000;
            //distance from the sun - moves planets out by 100 each time
            var distance = i * 100 + 200;
            var startAngle = randNum(0,6);
            var planet = new aPlanet((randInt + 1) * 6, planetImage, distance, angle, startAngle, false);
            var planetSphere = planet.buildPlanet();
            var planetOrbit = planet.showOrbitPath();
            planet.rotAxis();
            group.add(planetSphere);
            group.add(planetOrbit);
            this.solarSystemList.push(planet);
        }
        this.solarSystemGroup = group;
        
    }

    this.translateSS = function(){
        // console.log('translating solar system');
        //check if the location is too close to a current solar system in the galaxy
        var randDist = 0;
        var randDist2 = 0;
        var potentialLocation = new THREE.Vector3(0,0,0);
        var check = false;
        while(check == false){
            randDist = randNum(-20000, 20000);
            randDist2 = randNum(-10000, 10000);
            potentialLocation = new THREE.Vector3(0,0,0);
            potentialLocation.addVectors(new THREE.Vector3(GALAXYAXIS.x * randDist, GALAXYAXIS.y * randDist, GALAXYAXIS.z * randDist), new THREE.Vector3(0, 0, randDist2));
            check = checkLocations(potentialLocation);
        }

        this.solarSystemGroup.translateOnAxis(GALAXYAXIS, randDist);
        this.solarSystemGroup.translateOnAxis(new THREE.Vector3(0, 0, 1), randDist2);
        this.solarSystemLocation.addVectors(new THREE.Vector3(GALAXYAXIS.x * randDist, GALAXYAXIS.y * randDist, GALAXYAXIS.z * randDist), new THREE.Vector3(0, 0, randDist2));
  
    }
    
    this.rotateSS = function(angle){
        // console.log('rotating sola system');
        this.solarSystemGroup.rotateOnAxis(new THREE.Vector3(0, 0, 1), angle);
        this.solarSystemGroup.rotateOnAxis(new THREE.Vector3(1, 0, 0), 0.35);
    }
    
}

function aPlanet(radius, image, distFromCenter, angleOfRot, angularSpeed, isSun){
    this.radius = radius;
    this.image = image;
    //Planet distance from sun
    this.distFromCenter = distFromCenter;
    this.planetGeom = null;
    this.rotAxis = null;
    this.angleOfRot = angleOfRot;
    //angular speed is updated during render and represents the angle around the ellipse
    this.angularSpeed = angularSpeed;
    this.isSun = isSun;
  

    this.buildPlanet = function(){
        // console.log('building planets geometry and texture');
        var geometry = new THREE.SphereGeometry(this.radius, 16, 16);
        var texture = new THREE.ImageUtils.loadTexture(this.image);
        var material = new THREE.MeshBasicMaterial({map: texture});
        var sphere = new THREE.Mesh(geometry, material);
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

    this.rotAxis = function(){
        if(this.isSun){
            this.rotAxis = new THREE.Vector3(0, 1, 0);
        }
        else{
            var vectora = Math.random();
            var vectorb = Math.random()*2;
            this.rotAxis = new THREE.Vector3(vectora, vectorb, 0.1).normalize();
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
        toLocation = new THREE.Vector3(0, 0, 30000);
        //how far from the object the camera should stop
        distanceOut = 0;
    }
    else{
        toLocation = currentSolarSystem.solarSystemLocation;
        //how from from the object the camera should stop
        distanceOut = currentSolarSystem.distanceToView;
    }
    //find directional vector (camera - position)
    var directVector = new THREE.Vector3(toLocation.x - CAMERA.position.x, toLocation.y - CAMERA.position.y, toLocation.z - CAMERA.position.z);
    
    CAMERA.lookAt(currentSolarSystem.solarSystemLocation);


    if(CAMERA.position.distanceTo(toLocation) > distanceOut + 4000){
        CAMERA.position.x = CAMERA.position.x + directVector.x * COUNTER;
        CAMERA.position.y = CAMERA.position.y + directVector.y * COUNTER;
        CAMERA.position.z = CAMERA.position.z + directVector.z * COUNTER;
        COUNTER = COUNTER + 0.0003;
    }

    if(CAMERA.position.distanceTo(toLocation) < distanceOut + 4000 && CAMERA.position.distanceTo(toLocation) > distanceOut){
        CAMERA.position.x = CAMERA.position.x + directVector.x * COUNTER;
        CAMERA.position.y = CAMERA.position.y + directVector.y * COUNTER;
        CAMERA.position.z = CAMERA.position.z + directVector.z * COUNTER;
        COUNTER = COUNTER + 0.0003/(4001 - CAMERA.position.distanceTo(toLocation));
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
  
    if (ALBUMCLICKED){
        moveCameraToSS(GALAXYLIST[ALBUMNUM], false);
        }
    
    else{
        moveCameraToSS(GALAXYLIST[ALBUMNUM], true);
    }
 
    requestAnimationFrame(render);

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
var sunImages = ['../static/imgs/sun4.jpg', '../static/imgs/sun.png', '../static/imgs/sun1.gif', '../static/imgs/sun2.jpeg', '../static/imgs/sun3.jpeg', '../static/imgs/sun.jpg'];
var planetImages = ['../static/imgs/planet.jpg', '../static/imgs/planet2.png', '../static/imgs/planet1.jpg', '../static/imgs/planet3.jpeg', '../static/imgs/planet4.jpg', '../static/imgs/planet5.png'];
var GALAXYLIST = [];
var GALAXYAXIS = new THREE.Vector3(1, .15, 0.1).normalize();
var MUSICCOLLECTION;
var ALBUMCLICKED = false;
var COUNTER = 0;



var result = $.get('/get_music_collection', import_music);

function import_music(result){
    // set music collection to a list of album dictionaries

    var data = $.parseJSON(result);
    MUSICCOLLECTION = data['collection'];
    main();

}



