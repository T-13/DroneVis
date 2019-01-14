var webActionController = WebActionController();
var scene = null;
var camera = null;
var renderer = null;
var effect = null;
var drone_model = null;
var color = "#ffffff";  // Default white for best visibility

var source_url = "";
var isOnline = false;

var rollPitchYaw = null;
var roll = ['roll', 0];
var pitch = ['pitch', 0];
var yaw = ['yaw', 0];
var channels = null;
var channelsData = [
    ['channel', 1500, 1500, 1500, 1500, 1500, 1500, 1500, 1500]];
var lastAttitudeUpdate = new Date().getTime();
var lastChannelUpdate = lastAttitudeUpdate;

$(function () {
    // Construct url to load static files
    source_url = static_url + "main_view/";

    // Is called when socket receives new data
    var onNewData = function (data) {
        isOnline = data.online;
        if (isOnline) {
            $("#offline_indicator").hide();

            // Update model
            // Inverse yaw and roll for correct rotation
            // Apply X (pitch) and Z (roll) relative to Y (yaw) to allow proper
            // pitch and roll movement when drone's heading is not directly forward
            drone_model.rotation.set(data.pitch, -data.yaw, -data.roll, "YXZ");

            // Update graphs
            roll.push(data.roll);
            yaw.push(data.yaw);
            pitch.push(data.pitch);
            // Limit data cached
            if(roll.length > 30)
            {
                roll.splice(0, 1);
                yaw.splice(0, 1);
                pitch.splice(0, 1);
                roll[0] = "roll";
                pitch[0] = "pitch";
                yaw[0] = "yaw";

            }
            var now = new Date().getTime();
            if(now - lastAttitudeUpdate >= 500)
            {
                rollPitchYaw.load({
                columns: [
                    roll,
                    pitch,
                    yaw
                ]
                });
                lastAttitudeUpdate = now;
            }

            if(now - lastChannelUpdate >= 400) {
                channelsData[0][1] = data["rc_ch1"];
                channelsData[0][2] = data["rc_ch2"];
                channelsData[0][3] = data["rc_ch3"];
                channelsData[0][4] = data["rc_ch4"];
                channelsData[0][5] = data["rc_ch5"];
                channelsData[0][6] = data["rc_ch6"];
                channelsData[0][7] = data["rc_ch7"];
                channelsData[0][8] = data["rc_ch8"];
                console.log(channelsData);
                channels.load({
                    columns: channelsData
                });
                lastChannelUpdate = now;
            }

            // Update text
            var para = document.getElementById("data_text");
            para.innerHTML =
                "<p>Armed: " + (data.armed ? "Yes" : "No") + "</p>" +
                "<p>Heading: " + data.heading + " °</p>" +
                "<p>RSSI: " + data.rssi + " %</p>" +
                "<p>Load: " + data.load + " %</p>" +
                "<p>Battery Voltage: " + data.battery_voltage + " V</p>" +
                "<p>Battery Current: " + data.battery_current + " A</p>" +
                "<p>Battery Remaining: " + data.battery_remaining + " %</p>" +
                "<p>Communication Drop Rate: " + data.comm_drop_rate + " %</p>" +
                "<p>Communication Errors: " + data.comm_errors + "</p>" +
                "<p>Time since boot: " + data.time_since_boot + " ms</p>"
        } else {
            $("#offline_indicator").show();
        }
    };

    setupGraphs();
    setupSelects();
    setupThree();
    webActionController.setupWebSocket(onNewData);  // Connect to server
});

$(window).resize(function () {
    // Re init UI for new size
    setupGraphs();
    updateThree();
});

// Loads a new model as "the drone"
function loadModel(obj) {
    if (drone_model)
        scene.remove(drone_model);

    var objLoader = new THREE.OBJLoader();
    drone_model = objLoader.parse(obj);
    // Enable shadows
    drone_model.name = "drone";
    drone_model.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
            child.castShadow = true;
        }
    });

    // Add to scene, set position and load correct texture
    drone_model.position.set(0, 0, 0);
    scene.add(drone_model);
    loadTexture(color)
}

// Loads new rgb onto "the drone" model
function loadTexture(newColor) {
    color = newColor;
    var selectedObject = scene.getObjectByName("drone");
    if (selectedObject)
        selectedObject.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                child.material = new THREE.MeshPhongMaterial({ color: color });
            }
        });
}

// Sets up UI for user input (texture and model)
function setupSelects() {
    // To style only selects with the selectpicker class
    $('.selectpicker').selectpicker();
    // Add event to select element
    $('#object_select').on('changed.bs.select', function (e, clickedIndex, isSelected, previousValue) {
        webActionController.getModel(e.target[clickedIndex].value).done(function (response) {
            if (response.status == 0) {
                loadModel(response.data)
            }
        });
    });
    // Select first element by default
    var options = document.getElementById("object_select").options;
    if (options.length > 0) {
        webActionController.getModel(options[0].value).done(function (response) {
            if (response.status == 0) {
                loadModel(response.data)
            }
        });
    }

    $("#texture_select").on("change", function (event) {
        loadTexture(event.target.value);
    });

}
// Init graphs
function setupGraphs() {
    rollPitchYaw = c3.generate({
        bindto: "#graph_attitude",
        data: {
            columns: [
                roll,
                pitch,
                yaw
            ]
        },
        padding: {
            top: 10,
            left: 40,
            bottom: 5,
            right: 10
        },
        axis: {
            y: {
                    max: 360,
                    min: 0,
            },
            x: {show:false},
        }
    });

    channels = c3.generate({
        bindto: "#graph_rc_channels",
        data: {
            columns: channelsData,
            type: 'bar'
        },
        bar: {
            width: {
                ratio: 0.8
            },
        },
        padding: {
            top: 10,
            left: 40,
            bottom: 5,
            right: 10
        },
        axis: {
            y: {
                    max: 3000,
                    min: 0,
            },
            x: {show:false},
        },
        color: {
            pattern: ["#009933"]
        }
    });

}

// Init three.js
function setupThree() {
    // Create three.js scene and all needed objects
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    scene.background = new THREE.Color(0x000000);
    camera.position.z = 10;
    renderer = new THREE.WebGLRenderer();
    var container = document.getElementById('canvas');
    var positionInfo = container.getBoundingClientRect();
    var tick = 0;
    var clock = new THREE.Clock(true);
    var options = {
        position: new THREE.Vector3(),
        positionRandomness: 1,
        velocity: new THREE.Vector3(),
        velocityRandomness: 2,
        color: 0xaa88ff,
        colorRandomness: 10,
        turbulence: 0.5,
        lifetime: 10,
        size: 10,
        sizeRandomness: 10
    };
    var spawnerOptions = {
        spawnRate: 2500,
        horizontalSpeed: 0.5,
        verticalSpeed: 1,
        timeScale: 0.1
    };
    var particleSystem = new THREE.GPUParticleSystem({
        maxParticles: 25000
    });
    scene.add(particleSystem);

    // Resize correctly
    renderer.setSize(positionInfo.width/2, positionInfo.height/2);
    container.appendChild(renderer.domElement);
    scene.add(new THREE.AmbientLight(0xffffff, 0.2));
    var light = new THREE.DirectionalLight(0xffffff, 0.5);
    light.castShadow = true;
    light.position.set(1, 1, 1);
    light.shadow.camera.near = 0.4;
    light.shadow.camera.far = 500;
    light.shadow.mapSize.width = 256;
    light.shadow.mapSize.height = 256;
    scene.add(light);

    // Create floor
    var floor = new THREE.Mesh(
        new THREE.BoxGeometry(100, 1, 15), new THREE.MeshLambertMaterial({ color: 0x009933 }));
    // All objects need to cast and receive shadows
    floor.castShadow = true;
    floor.receiveShadow = true;
    floor.position.y = -5;
    scene.add(floor);

    // Set renderer size
    renderer.setSize(positionInfo.width - 2, positionInfo.height - 2);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    container.appendChild(renderer.domElement);

    // Create effect
    effect = new THREE.AnaglyphEffect(renderer);
    effect.setSize(container.offsetWidth - 2, container.offsetHeight - 2);

    // Rotate model slowly when data feed is disconnected
    var update = function () {
        if (!isOnline) {
            if (drone_model) {
                drone_model.rotation.x += 0.01;
                drone_model.rotation.y += 0.01
            }
        }
    };

    //draw scene with effect
    var render = function () {
        effect.render(scene, camera);
    };

    //run game loop (update, render, repeat) and update particle system clock
    var GameLoop = function () {
        requestAnimationFrame(GameLoop);

        var delta = clock.getDelta() * spawnerOptions.timeScale;
        tick += delta;

        if (tick < 0) tick = 0;

        if (delta > 0) {
            options.position.x =-5;
            options.position.y = -10;
            options.position.z = -10;

            for (var x = 0; x < spawnerOptions.spawnRate * delta; x++) {
                particleSystem.spawnParticle(options);
            }
        }

        particleSystem.update(tick);
        update();
        render();
    };

    // Start drawing
    GameLoop();
}

// Update three.js size
function updateThree() {
    var container = document.getElementById('canvas');
    var positionInfo = container.getBoundingClientRect();
    renderer.setSize(positionInfo.width - 2, positionInfo.height - 2);
    effect.setSize(container.offsetWidth -2, container.offsetHeight - 2);
}
