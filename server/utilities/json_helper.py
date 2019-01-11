import json
from django.db import models

# Define possible response statuses here
STATUSES = {
    "OK": 0,
    "ERROR_RETRIEVING_DATA": 1,
    "ERROR_LOGIN_FAILED": 2,
    "ERROR_LOGOUT_FAILED": 3,
    "ERROR_INVALID_ID": 4,
    "ERROR_INVALID_PARAMS": 5,
    "ERROR_UNKNOWN": 6,
    "ERROR_NOT_PERMITTED": 7,
}


def is_jsonable(x):
    try:
        json.dumps(x)
        return True
    except:
        return False


def model_to_json(model_type, model, additional_fields=[], serialize_related=True):
    actual_data = dict()

    # loop through fields and convert all to json
    for f in model_type._meta.get_fields():
        if f.is_relation and isinstance(f, models.ForeignKey) and serialize_related:
            obj = getattr(model, f.name)
            if obj:
                sub_model_type = f.related_model
                sub_model = sub_model_type.objects.get(pk=obj.id)
                actual_data[f.name] = model_to_json(sub_model_type, sub_model)
            else:
                actual_data[f.name] = None
        elif not f.is_relation:
            field_value = getattr(model, f.name)
            # Check if object can be serialized to json
            if is_jsonable(field_value):
                actual_data[f.name] = field_value
            else:
                actual_data[f.name] = str(field_value)

    # Add additional fields
    for name, value in additional_fields:
        actual_data[name] = value

    actual_data.pop('_state', None)

    # return jsonable object
    return actual_data


# Returns a json array of object contained in list "data" if they implement a json serializer method "to_json"
def to_json_array(data):
    json_array = []
    if len(data) > 0:
        for i in range(0, len(data)):
            json_array.append(data[i].to_json())
    return json_array


# A json wrapper of server responses
def response_json(status, data=[]):
    jsonable = dict()
    jsonable["status"] = status
    jsonable["data"] = data
    return jsonable
