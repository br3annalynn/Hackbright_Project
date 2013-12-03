
function buildScene(){
    SCENE = new THREE.Scene();
    CAMERA = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
    RENDERER = new THREE.WebGLRenderer();
    RENDERER.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(RENDERER.domElement);
    CAMERA.position = new THREE.Vector3(600, 0, 600);
   
}

function randNum(minRange, maxRange){
    //random returns number between 0, 1
    var randFloat = Math.random();
    return minRange + randFloat * (maxRange - minRange);
}

function buildGalaxy(numOfSolarSystems){

    var light = new THREE.AmbientLight( 0xFFFF33 );
    SCENE.add(light);

    for(var i = 1; i <= numOfSolarSystems; i++){
        var solarSystem = new aSolarSystem(5, 0);
        solarSystem.buildSolarSystem();
        solarSystem.translateSS(0);
        solarSystem.rotateSS(0.1);

        GALAXYLIST.push(solarSystem);
        SCENE.add(solarSystem.solarSystemGroup);
    }
}

function aSolarSystem(numOfPlanets, randDist){
    this.numOfPlanets = numOfPlanets;
    this.solarSystemList = [];
    this.solarSystemGroup = null;
    this.solarSystemLocation = new THREE.Vector3(400, 0, 0);

    this.buildSolarSystem = function(){
        var group = new THREE.Object3D();
        var sunMaterials = SUNTEXTURES[0];
        //speed of sun rotation
        var sunAngle = - 0.001;
        var mySun = new aPlanet(200, sunMaterials, 0, sunAngle, 0, true);
        var sphere = mySun.buildPlanet();
        mySun.rotAxis();
        group.add(sphere);
        this.solarSystemList.push(mySun);
        var picCount = 0;
        for(var i = 0; i < this.numOfPlanets; i++){
            var planetMaterials = PLANETTEXTURES[picCount];
            //make speed slower the further out you go
            var angle = (5 - i) / 1000; ///fix for i = 5
            //distance from the sun - moves planets out by 100 each time
            var distance = i * 100 + 200;
            var startAngle = randNum(3, 6.3);
            var planet = new aPlanet(randNum(10, 50), planetMaterials, distance, angle, startAngle, false);
            var planetSphere = planet.buildPlanet();
            var planetOrbit = planet.showOrbitPath();
            planet.rotAxis();
            group.add(planetSphere);
            group.add(planetOrbit);
            this.solarSystemList.push(planet);
            picCount = picCount + 1;
        }
        var sunlight = new THREE.PointLight(0xFFFFFF, .8, this.numOfPlanets * 1000);
        group.add(sunlight);
        this.solarSystemGroup = group;
        
    }
    this.translateSS = function(distance){
        this.solarSystemGroup.translateOnAxis(GALAXYAXIS, distance);
        this.solarSystemGroup.translateOnAxis(new THREE.Vector3(0, 1, 0), -40);
    }
    
    this.rotateSS = function(angle){
        this.solarSystemGroup.rotateOnAxis(new THREE.Vector3(0, 0, 1), angle);
        this.solarSystemGroup.rotateOnAxis(new THREE.Vector3(1, 0, 0), angle);
    }
    
}

function aPlanet(radius, materials, distFromCenter, angleOfRot, angularSpeed, isSun){
    this.radius = radius;
    this.image = IMAGESFOLDER + materials[0];
    this.texture = IMAGESFOLDER + materials[1];
    //Planet distance from sun
    this.distFromCenter = distFromCenter;
    this.planetGeom = null;
    this.rotAxis = null;
    this.angleOfRot = angleOfRot;
    //angular speed is updated during render and represents the angle around the ellipse
    this.angularSpeed = angularSpeed;
    this.isSun = isSun;
  

    this.buildPlanet = function(){
        var geometry = new THREE.SphereGeometry(this.radius, 30, 30);  
        var material = new THREE.MeshPhongMaterial({
            map: THREE.ImageUtils.loadTexture(this.image),
            bumpMap: THREE.ImageUtils.loadTexture(this.texture),
            bumpScale: 3
        });

        var sphere = new THREE.Mesh(geometry, material);
        if(isSun){
            var spriteMaterial = new THREE.SpriteMaterial({ 
                    map: new THREE.ImageUtils.loadTexture( IMAGESFOLDER + 'lensflare.png' ), 
                    useScreenCoordinates: false, 
                    alignment: THREE.SpriteAlignment.center,
                    color: 0xFFFF66, 
                    transparent: false, blending: THREE.AdditiveBlending
            });
            var sprite = new THREE.Sprite( spriteMaterial );
            sprite.scale.set(2000, 2000, 30.0);
            sphere.add(sprite); // this centers the glow at the mesh
        };
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
            var vectorb = Math.random()*5;
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
    }
    var directVector = new THREE.Vector3(toLocation.x - CAMERA.position.x, toLocation.y - CAMERA.position.y, toLocation.z - CAMERA.position.z);
        
    CAMERA.lookAt(currentSolarSystem.solarSystemLocation);


    if(CAMERA.position.distanceTo(toLocation) > 8000){
        CAMERA.position.x = CAMERA.position.x + directVector.x * COUNTER;
        CAMERA.position.y = CAMERA.position.y + directVector.y * COUNTER;
        CAMERA.position.z = CAMERA.position.z + directVector.z * COUNTER;
        COUNTER = COUNTER + 0.008;
    }

    if(CAMERA.position.distanceTo(toLocation) < 8000 && CAMERA.position.distanceTo(toLocation) > 500){
        CAMERA.position.x = CAMERA.position.x + directVector.x * COUNTER;
        CAMERA.position.y = CAMERA.position.y + directVector.y * COUNTER;
        CAMERA.position.z = CAMERA.position.z + directVector.z * COUNTER;
        COUNTER = COUNTER + 0.008/(8000.009 - CAMERA.position.distanceTo(toLocation));
    }
}

//this creates a loop that runs every 60th of a sec
function render(){

    for(var i = 0; i < GALAXYLIST.length; i++){
        for(var x = 0; x < GALAXYLIST[i].solarSystemList.length; x++){
            GALAXYLIST[i].solarSystemList[x].updateSpin();
            GALAXYLIST[i].solarSystemList[x].angularSpeed += .001;
            GALAXYLIST[i].solarSystemList[x].updateOrbit();
        }
    }
    
    RENDERER.render(SCENE, CAMERA);
  
    requestAnimationFrame(render);
}

///////////////////////////////////////////////////////////////////////////////

//global variables
var SCENE, CAMERA, RENDERER;

var IMAGESFOLDER = "../static/images/"

var PLANETTEXTURES = [
    ["venusmap.jpg", "venusbump.jpg"],
    ["mercurymap.jpg", "mercurybump.jpg"],
    ["neptunemap.jpg", "mercurybump.jpg"],
    ["marsmap1k.jpg", "marsbump1k.jpg"],
    ["jupitermap.jpg", "marsbump1k.jpg"],
    ["saturnmap.jpg", "plutobump1k.jpg"],
    ["plutomap1k.jpg", "plutobump1k.jpg"],
    ["uranusmap.jpg", "venusbump.jpg"],
];

var SUNTEXTURES = [
                ['sunmap.jpg', 'generic_bump.jpg'],
               ];

var GALAXYLIST = [];
var GALAXYAXIS = new THREE.Vector3(1, .15, 0.1).normalize();

var COUNTER = 0;
function main(){

    //build SCENE
    buildScene();

    //build galaxy
    var numOfSS = 1;
    buildGalaxy(numOfSS);
    
    //render the SCENE
    render();
}

main();


