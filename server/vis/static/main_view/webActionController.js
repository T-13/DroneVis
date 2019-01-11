var get_object_url = "/request/getModel/";

function WebActionController() {

    var getModel = function(modelID)
    {
        return $.ajax(
            {
                url: get_object_url + modelID,
                type: "GET",
                timeout: 0,
            })
    };

    return{
        getModel: getModel,
    }

}