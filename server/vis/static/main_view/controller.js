var webActionController = WebActionController();
var scene = null;
var camera = null;
var renderer = null;
var effect = null;
var drone_model = null;
var color = "#009933";  // Default same as graphs
var layout1;
var layout2;
var xPlot = 0;
var source_url = "";
var isOnline = false;

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
            var update = { x: [[++xPlot], [++xPlot], [++xPlot]], y: [[data.pitch], [data.yaw], [data.roll]] };
            if (data.pitch != null || data.yaw != null || data.roll != null) {
                Plotly.extendTraces('graph_attitude', update, [0, 1, 2], 10);
            }
            var trace1 = {
                type: 'bar',
                x: [1, 2, 3, 4, 5, 6, 7, 8],
                y: [data.rc_ch1, data.rc_ch2, data.rc_ch3, data.rc_ch4, data.rc_ch5, data.rc_ch6, data.rc_ch7, data.rc_ch8],
                marker: {
                    color: '#009933',
                    line: {
                        width: 2.5
                    }
                }
            };

            var dataGraph = [trace1];
            Plotly.newPlot('graph_rc_channels', dataGraph, layout2, { responsive: true });

            // Update text
            var para = document.getElementById("data_text");
            para.innerHTML = "<p>Armed: " + (data.armed ? "Yes" : "No") + "</p>" +
                             "<p>Heading: " + data.heading + "°</p>"
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
    layout1 = {
        legend: {
            font: {
                size: 13,
                color: '#ffffff'
              }
          },
        paper_bgcolor: '#00000000',
        plot_bgcolor: '#00000000',
        xaxis: {
            showgrid: true,
            mirror: 'ticks',
            tickfont: {
                color: 'snow'
            },
            gridcolor: 'snow',
            zerolinecolor: 'snow',
            gridwidth: 1,
            title: {
                text: 'Time',
                font: {
                    color: 'snow',
                    size: 16
                }
            }
        },
        yaxis: {
            showgrid: true,
            mirror: 'ticks',
            tickfont: {
                color: 'snow'
            },
            gridcolor: 'snow',
            zerolinecolor: 'snow',
            gridwidth: 2,
            title: {
                text: 'Angle',
                font: {
                    color: 'snow',
                    size: 16
                }
            }
        },
        title: {
            text: 'Roll/Pitch/Yaw',
            font: {
                color: '#ffffff',
                size: 16
            }
        },
        margin: {
            l: 50,
            r: 25,
            b: 50,
            t: 50
        }
    };
    layout2 = {
        paper_bgcolor: '#00000000',
        plot_bgcolor: '#00000000',
        xaxis: {
            showgrid: true,
            mirror: 'ticks',
            tickfont: {
                color: 'snow'
            },
            gridcolor: 'snow',
            zerolinecolor: 'snow',
            gridwidth: 1,
            title: {
                text: 'Channel',
                font: {
                    color: 'snow',
                    size: 16
                }
            }
        },
        yaxis: {
            showgrid: true,
            mirror: 'ticks',
            tickfont: {
                color: 'snow'
            },
            gridcolor: 'snow',
            zerolinecolor: 'snow',
            gridwidth: 2,
            title: {
                text: 'Value',
                font: {
                    color: 'snow',
                    size: 16
                }
            }
        },
        title: {
            text: 'RC Channels',
            font: {
                color: '#ffffff',
                size: 16
            }
        },
        margin: {
            l: 50,
            r: 25,
            b: 50,
            t: 50
        }
    };
    Plotly.newPlot('graph_attitude', [
        {
            x: [0],
            y: [0],
            type: 'scatter',
            name: 'Pitch',
            marker: {
                color: '#009933',
                line: {
                    width: 2.5
                }
            }
        },
        {
            x: [0],
            y: [0],
            type: 'scatter',
            name: 'Yaw',
            marker: {
                color: '#3366ff',
                line: {
                    width: 2.5
                }
            }
        },
        {
            x: [0],
            y: [0],
            type: 'scatter',
            name: 'Roll',
            marker: {
                color: '#ff0000',
                line: {
                    width: 2.5
                }
            }
        }], layout1, { displayModeBar: false });

    var trace1 = {
        type: 'bar',
        x: [1, 2, 3, 4, 5, 6, 7, 8],
        y: [1, 11, 12, 13, 14, 15, 14, 13],
        marker: {
            color: '#009933',
            line: {
                width: 2.5
            }
        }
    };

    var data = [trace1];


    Plotly.newPlot('graph_rc_channels', data, layout2, { responsive: true });
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
        positionRandomness: 3,
        velocity: new THREE.Vector3(),
        velocityRandomness: 5,
        color: 0xaa88ff,
        colorRandomness: 10,
        turbulence: 1,
        lifetime: 100,
        size: 20,
        sizeRandomness: 10
    };
    var spawnerOptions = {
        spawnRate: 1000,
        horizontalSpeed: 1,
        verticalSpeed: 1,
        timeScale: 0.1
    };
    var particleSystem = new THREE.GPUParticleSystem({
        maxParticles: 250000
    });
    scene.add(particleSystem);

    // Resize correctly
    renderer.setSize(positionInfo.width - 2, positionInfo.height - 2);
    container.appendChild(renderer.domElement);

    // Create lights and add to scene
    scene.add(new THREE.AmbientLight(0xffffff, 0.2));
    // Best light is directional for best effects with less work
    var light = new THREE.DirectionalLight(0xffffff, 0.5);
    light.castShadow = true;
    light.position.set(0, 10, 0);
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 1000;
    light.shadow.mapSize.width = 512;
    light.shadow.mapSize.height = 512;
    scene.add(light);

    // Create floor
    var floor = new THREE.Mesh(
        new THREE.BoxGeometry(100, 1, 15), new THREE.MeshLambertMaterial({ color: 0x0d0d0d }));
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
            options.position.x = Math.sin(tick * spawnerOptions.horizontalSpeed) * 10;
            options.position.y = Math.sin(tick * spawnerOptions.verticalSpeed) * 10;
            options.position.z = Math.sin(tick * spawnerOptions.horizontalSpeed + spawnerOptions.verticalSpeed) * 2;

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
    effect.setSize(container.offsetWidth, container.offsetHeight);
}
