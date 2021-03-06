//set scene size
        var WIDTH = 400,
            HEIGHT = 300;

        //set camera attributes
        var VIEW_ANGLE = 45,
            ASPECT = WIDTH/HEIGHT,
            NEAR = 0.1,
            FAR = 10000;

        
        //create a WebGL renderer, camera and scene
        var renderer = new THREE.WebGLRenderer();
        var camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
        var scene = new THREE.Scene();

        
        //add camera to the screen
        scene.add(camera);

        //the camera starts at 0,0,0 so pull it back
        camera.position.z = 300;

        //start the renderer
        renderer.setSize(WIDTH, HEIGHT);

        //attach the render DOM element
        document.body.appendChild(renderer.domElement);


        //create the particle variables
        var particleCount = 1800,
            particles = new THREE.Geometry(),
            texture = new THREE.ImageUtils.loadTexture("../static/imgs/particle.png"),
            //create particle material
            pMaterial = new THREE.ParticleSystemMaterial({
                    color: 0xFFFFFF, 
                    size: 10, 
                    map: texture,
                    transparent: true
                    });

        //create the individual particles
        for(var p = 0; p < particleCount; p++){
           //create a partical with a random position value, -250 --> 250
            var pX = Math.random() * 500 - 250,
                pY = Math.random() * 500 - 250,
                pZ = Math.random() * 500 - 250,
                vector = new THREE.Vector3(pX, pY, pZ);
                //particle = new THREE.Vector3(vector);

            //add it to the geometry
            particles.vertices.push(vector);
        }

        //create the particle system
        var particleSystem = new THREE.ParticleSystem(particles, pMaterial);

        particleSystem.sortParticles = true;

        //add it to the scene
        scene.add(particleSystem);

        // var translate_mtx = new THREE.Matrix4();
        // translate_mtx.makeTranslation(0, -0.01, 0);

        function update(){
                //this creates a loop that runs every 60th of a sec
                particleSystem.rotation.y += 0.005;
                for(var i = 0; i < particleCount; i++){
                    var y_coord = particles.vertices[i].y;
                    var new_y_cord = y_coord - 0.7;
                    if(new_y_cord < -250){
                        new_y_cord = 250;
                    }
                    particles.vertices[i].setY(new_y_cord);
                }

                renderer.render(scene, camera);
                requestAnimationFrame(update);
                        
        }
        update();