var webActionController = WebActionController();
var scene = null;
var camera = null;

var drone_model = null;
var color = "#009933";

var source_url = "";

$(function () {
    source_url = static_url + "main_view/";

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    scene.background = new THREE.Color( 0x000000 );
    camera.position.z = 10;

    var renderer = new THREE.WebGLRenderer();
    var container = document.getElementById('canvas');
    var positionInfo = container.getBoundingClientRect();

    renderer.setSize(positionInfo.width-2, positionInfo.height-2);
    container.appendChild(renderer.domElement);

        var data = [
            {
              x: [0, 1, 2, 3, 4, 5, 6, 7, 8],
              y: [0, 1, 2, 3, 4, 5, 6, 7, 8],
              type: 'scatter',
              marker: {
                color: '#009933',
                line: {
                    width: 2.5
                }
            }
            }
          ];

        var layout = {
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
                    text: 'X',
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
                    text: 'Y',
                    font: {
                      color: 'snow',
                      size: 16
                    }
                }
            },
            title: {
                text: 'Some title',
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
    Plotly.newPlot('tester1', data, layout, {displayModeBar: false});
    Plotly.newPlot('tester', data, layout, {displayModeBar: false});


    var keyLight = new THREE.DirectionalLight(new THREE.Color('hsl(30, 100%, 75%)'), 1.0);
    keyLight.position.set(-100, 0, 100);

    var fillLight = new THREE.DirectionalLight(new THREE.Color('hsl(240, 100%, 75%)'), 0.75);
    fillLight.position.set(100, 0, 100);

    var backLight = new THREE.DirectionalLight(0xffffff, 1.0);
    backLight.position.set(100, 0, -100).normalize();

    scene.add(keyLight);
    scene.add(fillLight);
    scene.add(backLight);

    var update = function () {
        scene.rotation.x += 0.01;
        scene.rotation.y += 0.01;
    };

    //draw scene
    var render = function () {
        renderer.render(scene, camera);
    };

    //run game loop (update, render, repeat)
    var GameLoop = function () {
        requestAnimationFrame(GameLoop);
        update();
        render();
    };

    setupSelects();
    GameLoop();
});


function loadModel(obj)
{
    if (drone_model)
        scene.remove( drone_model );

    var objLoader = new THREE.OBJLoader();
    drone_model = objLoader.parse(obj);
    drone_model.name = "drone";

    scene.add(drone_model);
    drone_model.position.z = 0;
    drone_model.position.x = 0;
    drone_model.position.y = 0;
    loadTexture(color)
}
function loadTexture(newColor)
{
    color = newColor;
    var selectedObject = scene.getObjectByName("drone");
    if(selectedObject)
        selectedObject.traverse(function(child)
        {
            if (child instanceof THREE.Mesh)
            {
                child.material = new THREE.MeshPhongMaterial( { color: color } );
            }
        });
}


function setupSelects()
{
    // To style only selects with the selectpicker class
    $('.selectpicker').selectpicker();
    // Add event to select element
    $('#object_select').on('changed.bs.select', function (e, clickedIndex, isSelected, previousValue) {
        webActionController.getModel(e.target[clickedIndex].value).done(function(response)
        {
            if(response.status == 0)
            {
                loadModel(response.data)
            }
        });
    });
    // Select first element by default
    var options = document.getElementById("object_select").options;
    if(options.length > 0) {
        webActionController.getModel(options[0].value).done(function(response)
        {
            if(response.status == 0)
            {
                loadModel(response.data)
            }
        });
    }

    $("#texture_select").on("change", function (event) {
        loadTexture(event.target.value);
    });

}