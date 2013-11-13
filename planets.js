
function buildScene(){
    SCENE = new THREE.Scene();
    CAMERA = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
    RENDERER = new THREE.WebGLRenderer();
    RENDERER.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(RENDERER.domElement);
    CAMERA.position.z = 8000;
   
}

function randNum(minRange, maxRange){
    //random returns number between 0, 1
    var randFloat = Math.random();
    return minRange + randFloat * (maxRange - minRange);
}

function buildGalaxy(numOfSolarSystems){

    for(var i = 1; i <= numOfSolarSystems; i++){
        var randDist = randNum(-3000, 3000);
        var solarSystem = new aSolarSystem(4, randDist);
        solarSystem.buildSolarSystem();
        solarSystem.translateSS(randDist);
        solarSystem.rotateSS(randNum(0, 1));
        GALAXYLIST.push(solarSystem);
        SCENE.add(solarSystem.solarSystemGroup);
    }
}

function aSolarSystem(numOfPlanets, randDist){
    this.numOfPlanets = numOfPlanets;
    this.solarSystemList = [];
    this.solarSystemGroup = null;
    this.solarSystemLocation = new THREE.Vector3(GALAXYAXIS.x * randDist, GALAXYAXIS.y * randDist, GALAXYAXIS.z * randDist);
    //set distance to view to 1000 outside last orbit ring
    this.distanceToView = 200 + numOfPlanets*100 + 1000


    this.buildSolarSystem = function(){
        var group = new THREE.Object3D();
        
        //a number between 0 and 5.9;
        var randInt = Math.floor(randNum(0, 6));
        var sunImage = sunImages[randInt];
        //speed of sun rotation
        var sunAngle = - 0.001;
        var mySun = new aPlanet(100, sunImage, 0, sunAngle, true);
        var sphere = mySun.buildPlanet();
        mySun.rotAxis();
        group.add(sphere);
        this.solarSystemList.push(mySun);

        for(var i = 0; i < this.numOfPlanets; i++){
            //number between 0 and 5
            randInt = Math.floor(randNum(0, 6));
            var planetImage = planetImages[randInt];
            //make speed slower the further out you go
            var angle = (5 - i) / 1000; ///fix for i = 5
            //distance from the sun - moves planets out by 100 each time
            var distance = i * 100 + 200;
            var planet = new aPlanet((randInt + 1) * 5, planetImage, distance, angle, false);
            var planetSphere = planet.buildPlanet();
            var planetOrbit = planet.showOrbitPath();
            planet.rotAxis();
            planet.setPosition();
            group.add(planetSphere);
            group.add(planetOrbit);
            this.solarSystemList.push(planet);
        }
        this.solarSystemGroup = group;
        
    }
    this.translateSS = function(distance){
        this.solarSystemGroup.translateOnAxis(GALAXYAXIS, distance);
    }
    
    this.rotateSS = function(angle){
        this.solarSystemGroup.rotateOnAxis(new THREE.Vector3(0, 0, 1), angle);
    }
    
}

function aPlanet(radius, image, distFromCenter, angleOfRot, isSun){
    this.radius = radius;
    this.image = image;
    //Planet distance from sun
    this.distFromCenter = distFromCenter;
    this.planetGeom = null;
    this.rotAxis = null;
    this.angleOfRot = angleOfRot;
    //angular speed is updated during render and represents the angle around the ellipse
    this.angularSpeed = angleOfRot;
    this.isSun = isSun;
  

    this.buildPlanet = function(){
        var geometry = new THREE.SphereGeometry(this.radius, 16, 16);
        var texture = new THREE.ImageUtils.loadTexture(this.image);
        var material = new THREE.MeshBasicMaterial({map: texture});
        var sphere = new THREE.Mesh(geometry, material);
        this.planetGeom = sphere;
        return sphere;
    }

    this.showOrbitPath = function(){
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

    this.setPosition = function(){
        //set the planet to a start position 
        this.planetGeom.position.x = this.distFromCenter;
        //this.planetGeom.translateOnAxis(this.planeAxis, distFromCenter);
        
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


function moveCameraToSS(currentSolarSystem, out){
    //find directional vector (camera - position)
    if(out){
        toLocation = new THREE.Vector3(0, 0, 10000);
        //how from from the object the camera should stop
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


    if(CAMERA.position.distanceTo(toLocation) > distanceOut + 2000){
        CAMERA.position.x = CAMERA.position.x + directVector.x * COUNTER;
        CAMERA.position.y = CAMERA.position.y + directVector.y * COUNTER;
        CAMERA.position.z = CAMERA.position.z + directVector.z * COUNTER;
        COUNTER = COUNTER + 0.0005;
    }

    if(CAMERA.position.distanceTo(toLocation) < distanceOut + 2000 && CAMERA.position.distanceTo(toLocation) > distanceOut){
        CAMERA.position.x = CAMERA.position.x + directVector.x * COUNTER;
        CAMERA.position.y = CAMERA.position.y + directVector.y * COUNTER;
        CAMERA.position.z = CAMERA.position.z + directVector.z * COUNTER;
        COUNTER = COUNTER + 0.0005/(2001 - CAMERA.position.distanceTo(toLocation));
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
  
    
    // console.log('time');
    // console.log(CLOCK.getElapsedTime());
    // console.log('counter');
    // console.log(COUNTER);
    
    if(CLOCK.getElapsedTime() < 5){
        moveCameraToSS(GALAXYLIST[0], false);
    }
    if(CLOCK.getElapsedTime() > 5 && CLOCK.getElapsedTime() < 5.1){
        COUNTER = 0;
    } 
    if(CLOCK.getElapsedTime() > 5 && CLOCK.getElapsedTime() < 10){
        moveCameraToSS(GALAXYLIST[0], true);
    }
    if(CLOCK.getElapsedTime() > 10 && CLOCK.getElapsedTime() < 10.1){
        COUNTER = 0;
    }
    if(CLOCK.getElapsedTime() > 10){
        moveCameraToSS(GALAXYLIST[1], false);
    }

    requestAnimationFrame(render);

}


///////////////////////////////////////////////////////////////////////////////

//global variables
var SCENE, CAMERA, RENDERER;
var CLOCK = new THREE.Clock(true);
var sunImages = ['sun4.jpg', 'sun.png', 'sun1.gif', 'sun2.jpeg', 'sun3.jpeg', 'sun.jpg'];
var planetImages = ['planet.jpg', 'planet2.png', 'planet1.jpg', 'planet3.jpeg', 'planet4.jpg', 'planet5.png'];
var GALAXYLIST = [];
var GALAXYAXIS = new THREE.Vector3(1, .15, 0.1).normalize();
//var CAMERALOCATION = new THREE.Vector3(0, 0, 2000);
var COUNTER = 0;
function main(){

    //build SCENE
    buildScene();

    //build galaxy
    var numOfSS = 2;
    buildGalaxy(numOfSS);
    
    //render the SCENE
    render();
}

main();


