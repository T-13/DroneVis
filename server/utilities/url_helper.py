REQUEST_PREFIX = "request"
API_PREFIX = "api"
DEVELOPER_API_PREFIX = "api2"


# Using REQUEST_PREFIX returns the correct full path
def generate_request_name(name):
    return REQUEST_PREFIX + "/" + name


# Using API_PREFIX returns the correct full path
def generate_api_name(name):
    return API_PREFIX + "/" + name


# Using DEVELOPER_API_PREFIX returns the correct full path
def generate_devel_name(name):
    return DEVELOPER_API_PREFIX + "/" + name
