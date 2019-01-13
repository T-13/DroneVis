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
        var link = 'ws://' + window.location.host + '/socket/0/';
        socket = new WebSocket(link);
        console.log("Socket connecting to " + link);

        socket.onmessage = function(e) {
            //console.log(e.data);
            var data = JSON.parse(e.data);
            updateFunction(data);
        };

        socket.onclose = function(e) {
            console.log('Socket closed');
        };
    };

    return{
        getModel: getModel,
        setupWebSocket:setupWebSocket
    };
}
