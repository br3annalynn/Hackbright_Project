
function buildScene(){
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    camera.position.z = 3000;
   
}

function buildGalaxy(numOfSolarSystems){
    this.numOfSolarSystems = numOfSolarSystems;

    for(var i = 1; i <= this.numOfSolarSystems; i++){
        //random number between 0, 1
        var randFloat = Math.random();
        //rand distance between -3000, 3000
        var randDist = randFloat*-6000 + 3000;
        var solarSystem = new aSolarSystem(4, randDist);
        solarSystem.buildSolarSystem();
        solarSystem.translateSS(randDist);
        solarSystem.rotateSS(randFloat);
        galaxyList.push(solarSystem);
        scene.add(solarSystem.solarSystemGroup);
    }
}

function aSolarSystem(numOfPlanets, randDist){
    this.numOfPlanets = numOfPlanets;
    this.solarSystemAxis = new THREE.Vector3(1, 2, 0.1).normalize();
    this.solarSystemList = [];
    this.solarSystemGroup = null;
    this.solarSystemLocation = new THREE.Vector3(galaxyAxis.x * randDist, galaxyAxis.y * randDist, galaxyAxis.z * randDist);
    var correctionVector = new THREE.Vector3(0, 30, 500);
    this.solarSystemViewLocation = new THREE.Vector3(0,0,0);
    this.solarSystemViewLocation.addVectors(this.solarSystemLocation, correctionVector);

    this.buildSolarSystem = function(){
        var group = new THREE.Object3D();
        
        //a number between 0 and 5.9;
        var randInt = Math.floor(Math.random() * 6);
        var sunImage = sunImages[randInt];
        var sunAngle = -0.001;
        var mySun = new aPlanet(100, sunImage, 0, sunAngle, true, this.solarSystemAxis);
        var sphere = mySun.buildPlanet();
        mySun.rotAxis();
        group.add(sphere);
        this.solarSystemList.push(mySun);

        for(var i = 0; i < this.numOfPlanets; i++){
            //number between 0 and 5
            var randInt2 = Math.floor(Math.random() * 6);
            var planetImage = planetImages[randInt2];
            //make speed slower the further out you go
            var angle = (5 - i)/1000;
            var distance = i *100 + 200;
            var planet = new aPlanet((randInt2 + 1)*5, planetImage, distance, angle, false, this.solarSystemAxis);
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
        this.solarSystemGroup.translateOnAxis(galaxyAxis, distance);
    }
    
    this.rotateSS = function(angle){
        this.solarSystemGroup.rotateOnAxis(new THREE.Vector3(0, 0, 1), angle);
    }
    
}

function aPlanet(radius, image, distFromCenter, angleOfRot, isSun){
    this.radius = radius;
    this.image = image;
    this.distFromCenter = distFromCenter;
    this.planetGeom = null;
    this.rotAxis = null;
    this.angleOfRot = angleOfRot;
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
        var line = new THREE.Line(geometry, material);
        return line;
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


function moveCameraToSS(currentSolarSystem){
    
    var toLocation = currentSolarSystem.solarSystemViewLocation;
    //camera.translateOnAxis(toLocation, 2);
    //camera.position.addVectors(camera.position, toLocation);
    if(camera.position.x != currentSolarSystem.solarSystemViewLocation.x){ 
        camera.translateOnAxis(toLocation, 2);
    }
}

function zoomOut(){
    console.log('zooming out now');
    if(camera.position.x >= 0 && camera.position.y >= 0 && camera.position.z <= cameraLocation.z){
        camera.translateOnAxis(cameraLocation, 2);
    }
}


//this creates a loop that runs every 60th of a sec
function render(){

    for(var i = 0; i < galaxyList.length; i++){
        for(var x = 0; x < galaxyList[i].solarSystemList.length; x++){
            galaxyList[i].solarSystemList[x].updateSpin();
            galaxyList[i].solarSystemList[x].angularSpeed += galaxyList[i].solarSystemList[x].angleOfRot;
            galaxyList[i].solarSystemList[x].updateOrbit();
        }
    }
    
    renderer.render(scene, camera);
  
    // console.log(clock.getElapsedTime());
    //moveCameraToSS(galaxyList[0]);
    // if(clock.getElapsedTime() < 30){
    //     moveCameraToSS(galaxyList[0]);
    // }
    // if(clock.getElapsedTime() > 30){
    //     zoomOut();
    // }

    requestAnimationFrame(render);

}


///////////////////////////////////////////////////////////////////////////////

//global variables
var scene, camera, renderer;
var clock = new THREE.Clock(true);
var sunImages = ['sun4.jpg', 'sun.png', 'sun1.gif', 'sun2.jpeg', 'sun3.jpeg', 'sun.jpg'];
var planetImages = ['planet.jpg', 'planet2.png', 'planet1.jpg', 'planet3.jpeg', 'planet4.jpg', 'planet5.png'];
var galaxyList = [];
var galaxyAxis = new THREE.Vector3(1, .15, 0.1).normalize();
var cameraLocation = new THREE.Vector3(0, 0, 2000);

function main(){

    //build scene
    buildScene();

    //build galaxy
    var numOfSS = 2;
    buildGalaxy(numOfSS);
    
    //render the scene
    render();
}

main();


