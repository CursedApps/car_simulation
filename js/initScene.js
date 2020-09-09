var canvas
var engine
var ground
var camera
var scene
var shadowGenerator
var assetsManager

var raceTrack
var dirtL
var dirtR

var vehicules = []
var isSimulationRunning = false
var updateTime = 10

// Resize the babylon engine when the window is resized
window.addEventListener("resize", function () {
        if (engine) {
                engine.resize();
        }
}, false);


window.onload = function () {

        canvas = document.getElementById("renderCanvas"); // Get the canvas element
        engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine

        var targetNode = document.getElementById('splashscreen');
        var observer = new MutationObserver(function () {
                if (targetNode.style.display == 'none') {
                        addUI();
                }
        });

        observer.observe(targetNode, { attributes: true, childList: true });

        setupScene(); //Call the createScene function
        assetsManager = new BABYLON.AssetsManager(scene);


        // Register a render loop to repeatedly render the scene
        engine.runRenderLoop(function () {
                scene.render();
        });

        // Watch for browser/canvas resize events
        window.addEventListener("resize", function () {
                engine.resize();
        });
}

var setupScene = function () {

        // Create the scene space
        scene = new BABYLON.Scene(engine);

        scene.executeWhenReady(function () {
                // Remove loader
                var loader = document.querySelector("#splashscreen");
                loader.style.display = "none";
        });

        // Add a camera to the scene and attach it to the canvas
        setupCamera();

        // Add lights to the scene
        var hemi = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 1, 0), scene);
        hemi.intensity = 0.5;
        hemi.diffuse = new BABYLON.Color3(1, 0.78, 0.51);
        hemi.specular = new BABYLON.Color3(1, 0.89, 0.65);
        hemi.groundColor = new BABYLON.Color3(0.94, 0.6, 0.43);

        var dir = new BABYLON.DirectionalLight("dir", new BABYLON.Vector3(-1, -1, 1), scene);
        dir.position = new BABYLON.Vector3(500, 250, -500);
        dir.intensity = 0.5

        shadowGenerator = new BABYLON.ShadowGenerator(4096, dir);
        shadowGenerator.normalBias = 0.02;
        shadowGenerator.usePercentageCloserFiltering = true;

        scene.shadowsEnabled = true;

        createTerrain()
        createRaceTrack()
        createSkyBox()

        setTimeout(runSimulation, updateTime);

}

var setupCamera = function () {

        camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2, 0, 20, new BABYLON.Vector3(0, 0, 0), scene);
        camera.setPosition(new BABYLON.Vector3(0, 100, 0));

        camera.lowerBetaLimit = 0.1;
        camera.upperBetaLimit = (Math.PI / 2) * 0.9;

        camera.lowerRadiusLimit = 25;
        camera.upperRadiusLimit = 300;

        camera.collisionRadius = new BABYLON.Vector3(1, 1, 1);
        camera.checkCollisions = true;
        camera.useBouncingBehavior = true;
        camera.attachControl(canvas, true);
}

var createTerrain = function () {

        BABYLON.SceneLoader.ImportMesh("", "assets/scenes/terrain_holes/", "terrain.obj", scene, function (newMeshes) {
                ground = newMeshes[0]
                ground.position = new BABYLON.Vector3(0, 0, 0);
                ground.receiveShadows = true;

                ground.collisionsEnabled = true
                ground.checkCollisions = true

                var mix = new BABYLON.MixMaterial("mix", scene);

                //Set the mix texture (represents the RGB values)
                mix.mixTexture1 = new BABYLON.Texture("assets/textures/mixmap.png", scene);
                mix.mixTexture2 = new BABYLON.Texture("assets/textures/mixmap_road.png", scene);

                mix.diffuseTexture1 = new BABYLON.Texture("assets/textures/snow.png", scene);
                mix.diffuseTexture1.roughness = 1.0
                mix.diffuseTexture2 = new BABYLON.Texture("assets/textures/dark_grass.png", scene);
                mix.diffuseTexture2.roughness = 1.0
                mix.diffuseTexture3 = new BABYLON.Texture("assets/textures/grass.png", scene);
                mix.diffuseTexture3.roughness = 1.0
                mix.diffuseTexture4 = new BABYLON.Texture("assets/textures/grass.png", scene);
                mix.diffuseTexture4.roughness = 1.0

                mix.diffuseTexture5 = new BABYLON.Texture("assets/textures/asphalt.png", scene);
                mix.diffuseTexture6 = new BABYLON.Texture("assets/textures/paint.png", scene);
                mix.diffuseTexture7 = new BABYLON.Texture("assets/textures/grass.png", scene);
                mix.diffuseTexture8 = new BABYLON.Texture("assets/textures/grass.png", scene);

                ground.material = mix;

                let pg = new PineGenerator(scene, shadowGenerator, ground, -512, 512, 0, 300);
        });

        BABYLON.SceneLoader.ImportMesh("", "assets/scenes/tunnel/", "tunnel.obj", scene, function (newMeshes) {
                newMeshes.forEach(mesh => {
                        let x = 0
                        let z = -256
                        let y = getHeightAtPoint(x, z)

                        mesh.position = new BABYLON.Vector3(x, y, z - 40)
                        mesh.receiveShadows = true;
                        shadowGenerator.getShadowMap().renderList.push(mesh);
                });

        });

        BABYLON.SceneLoader.ImportMesh("", "assets/scenes/tunnel/", "tunnel.obj", scene, function (newMeshes) {
                newMeshes.forEach(mesh => {
                        let x = 0
                        let z = 385
                        let y = getHeightAtPoint(x, z)

                        mesh.position = new BABYLON.Vector3(x, y, z + 40)
                        mesh.receiveShadows = true;
                        shadowGenerator.getShadowMap().renderList.push(mesh);
                });

        })
}

var createSkyBox = function () {
        var skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 2000.0 }, scene);
        var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("assets/textures/cute_skybox/skybox", scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.disableLighting = true;
        skybox.material = skyboxMaterial;
}

var createRaceTrack = function () {

        let x = 0
        let z = 200
        let y = getHeightAtPoint(x, z)


        BABYLON.SceneLoader.ImportMesh("", "assets/scenes/finish/", "finish_line.obj", scene, function (newMeshes) {
                newMeshes.forEach(mesh => {
                        mesh.position = new BABYLON.Vector3(x, y, z)
                        mesh.receiveShadows = true;
                        mesh.material.backFaceCulling = false;
                        shadowGenerator.getShadowMap().renderList.push(mesh);
                });

                raceTrack = newMeshes
        });

        y = getHeightAtPoint(x + 30, z)
        BABYLON.SceneLoader.ImportMesh("", "assets/scenes/dirt/", "dirt.obj", scene, function (newMeshes) {
                newMeshes.forEach(mesh => {
                        mesh.position = new BABYLON.Vector3(x + 30, y, z)
                        mesh.receiveShadows = true;
                        shadowGenerator.getShadowMap().renderList.push(mesh);
                });

                dirtR = newMeshes
        });

        y = getHeightAtPoint(x - 30, z)
        BABYLON.SceneLoader.ImportMesh("", "assets/scenes/dirt/", "dirt.obj", scene, function (newMeshes) {
                newMeshes.forEach(mesh => {
                        mesh.position = new BABYLON.Vector3(x - 30, y, z)
                        mesh.receiveShadows = true;
                        shadowGenerator.getShadowMap().renderList.push(mesh);
                });

                dirtL = newMeshes
        });
}

var placeRaceTrack = function(length) {
        let startLinePos = -107

        let x = 0
        let z = startLinePos + length
        let y = getHeightAtPoint(x, z)

        raceTrack.forEach(mesh => {
                mesh.position = new BABYLON.Vector3(x, y, z)
        });

        y = getHeightAtPoint(x + 30, z)
        dirtR.forEach(mesh => {
                mesh.position = new BABYLON.Vector3(x + 30, y, z)
        });

        y = getHeightAtPoint(x - 30, z)
        dirtL.forEach(mesh => {
                mesh.position = new BABYLON.Vector3(x - 30, y, z)
        });
}

var addUI = function() {
        let input = document.getElementById("input");

        if (!input) {
                input = document.createElement("input");
                input.type = "file";
                input.style.position = "absolute";
                input.style.right = "20px";
                input.style.top = "60px";
                input.style.zIndex = "2"
                input.accept = ".json,.png";
                document.body.appendChild(input);
        }

        // Files input
        var filesInput = new BABYLON.FilesInput(engine, null, null, null, null, null, function () { BABYLON.Tools.ClearLogCache() }, function () {}, null);
        filesInput.onProcessFileCallback = (function (file, name, extension) {
        if (filesInput._filesToLoad && filesInput._filesToLoad.length === 1 && extension) {
                BABYLON.Tools.ReadFile(file, function(dataText) {
                    var data = JSON.parse(dataText);
                    setupSimulation(data);
                });
        }
        return false;
    }).bind(this);

    input.addEventListener('change', function (event) {
        var filestoLoad;
        // Handling files from input files
        if (event && event.target && event.target.files) {
            filesToLoad = event.target.files;
        }
        filesInput.loadFiles(event);
    }, false);     

}

var setupSimulation = function(data) {
        // Simulation
        let simulation = data.simulation
        if (simulation == null) {
                console.log("No simulation found :(")
                return;
        }

        // Place track
        let track = simulation.track
        if (track == null) {
                console.log("No track found :(")
                return;
        }

        let trackLength = track.length
        if (trackLength == null) {
                console.log("No track length found :(")
                return;
        }

        if(trackLength <= 0 || isNaN(trackLength)) {
                console.log("Invalid track length! >:(")
                return;
        }

        if(trackLength > 200){
                console.log("Track length max value is 200 >:(")
                return;
        }

        placeRaceTrack(trackLength);

        // Build vehicules
        let vehiculesData = simulation.vehicules
        if(vehiculesData == null || vehiculesData.length === 0){
                console.log("No vehicules to simulate :(")
                return;
        }

        for (const vehicule of vehiculesData){
                let name = vehicule.name
                if (name == null){
                        console.log("Vehicule has no name :(")
                        continue;
                }

                let components = vehicule.components
                if (components == null || components.length === 0){
                        console.log(`Vehicule ${name} has no components :(`)
                        continue;
                }

                let movements = vehicule.movements
                if (movements == null || movements.length === 0){
                        console.log(`No movements found for vehicule ${name} :(`)
                        continue;
                }

                vehicules.push(new Vehicule(name, components, movements, scene, shadowGenerator, -107))
        }

}

var runSimulation = function() {
        if(isSimulationRunning) {
                success = false
                vehicules.forEach(v => {
                       success = success || v.toNextState()
                })
                isSimulationRunning = success
        }

        setTimeout(runSimulation, updateTime);
}