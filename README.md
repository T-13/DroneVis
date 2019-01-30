# DroneVis

[![Heroku](https://heroku-badge.herokuapp.com/?app=dronevis&style=flat)](https://dronevis.herokuapp.com/)

Drone telemetry visualization project at FERI. Contains final project product, usable for remote telemetry viewing of any drone data (MAVLink currently supported). Certain tasks from [T-13/DroneTasks](https://github.com/T-13/DroneTasks) were merged and included.

This repository contains everything required to set up the software visualization. Refer to the [wiki](https://github.com/T-13/DroneVis/wiki) for detailed documentation on flight firmware, hardware components, wiring and getting data to DroneVis.


### Features

- 3D Rotation Visualization
  - Model Selection
  - Object Color Selection
- Graph Visualization
  - Attitude (Pitch, Roll, Yaw)
  - RC Channels (up to 8)
  - Arm Status
  - Heading
  - Throttle
  - RSSI (Receive Signal Strength Indicator)
  - Load
  - Battery (Voltage, Current, Remaining)
  - Communication Link (Drop Rate, Error Count)
  - Time Since Boot
- Giver applications
  - MAVLink decoder


## Components

### Server

Django web application (`vis`) serves static front-end website, runs sqlite database and provides websocket API for givers (below).

### Givers

Client applications which obtain data, decode it if necessary and send it to server for visualization. Also known as providers.

All gives are named `type_giver.py` and can be executed directly, in the background they import `giver.py` which handles the overall connection to DroneVis Server. Simply subclassing `Giver` allows for easy implementation of any protocols, decoders or generators.

**Current Givers:**
- Random (test/example)
- MAVLink (via serial port, using `pymavlink`)


## Setup

### Docker

- Install [Docker](https://www.docker.com/get-started)
- [Linux] Install [Docker Compose](https://docs.docker.com/compose/install/)
- Run Docker (or `docker.service` on Linux)
- Run `$ docker-compose build` to build the Docker image
- Run `$ docker-compose up` to run the image

Docker automatically loads `vis/fixtures/initial_data.json` fixture with 4 models and test admin account (`admin:admin`, accessible from `/admin`).

### Manual

#### Ubuntu (18.0.4)

**Dependencies:**
- Python 3.5 or newer (Ubuntu 18.0.4 has 3.6.5 by default)
- Django
    - `pip3 install django`
- Django channels 2.0
    - `pip3 install channels`
- Filtering support
    - `pip3 install django-filter`
- Improved html template filtering
    - `pip3 install django-mathfilters`
- Proper static bootstrap include
    - `pip3 install django-bootstrap3`
    - `pip3 install django-bootstrap-static`
- Proper static fontawesome include
    - `pip3 install django-fontawesome`
- Proper static jquery include
    - `pip3 install django-jquery`
- A web server, for example: [redis](https://redis.io/)
    - `sudo apt install redis-server`
- Correct channel layer backend for Django Channels: [channels_redis](https://github.com/django/channels_redis)
    - `pip3 install channels_redis`

#### Simple step by step guide

1. Clone this repository
2. If desired create python3 virtual environment else skip this step
    - `python3-dev` package required
    - `sudo -H pip3 install virtualenv`
    - `$ virtualenv myEnvironment`
    - `$ source myEnvironment/bin/activate`
3. `pip3 install django-filter django-mathfilters django-bootstrap3 django-bootstrap-static django-fontawesome django-jquery channels channels_redis`
4. `sudo apt install redis-server`
5. `sudo service redis-server start`
6. `$ cd server`
7. `python3 manage.py runserver`

If using python3 virtualenv pip is pip3 and python is python3
