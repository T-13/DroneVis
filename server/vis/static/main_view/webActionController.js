var get_object_url = "/request/getModel/";

function WebActionController() {

    var socket = null;


    var getModel = function(modelID)
    {
        return $.ajax(
            {
                url: get_object_url + modelID,
                type: "GET",
                timeout: 0,
            })
    };
    
    var setupWebSocket = function (updateFunction) {
        socket = new WebSocket('ws://' + window.location.host +
        '/socket/0/');

        console.log("Socket connecting to server");

        socket.onmessage = function(e) {
            var data = JSON.parse(e.data);
            updateFunction(data);
        };

        socket.onclose = function(e) {
            console.log('Chat socket closed');
        };
    };

    return{
        getModel: getModel,
        setupWebSocket:setupWebSocket
    };
}