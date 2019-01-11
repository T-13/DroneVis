# DroneVisServer

### How to setup on Ubuntu 18.0.4:
Dependencies:
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
- A web server, for example [redis](https://redis.io/)
    - `sudo apt install redis-server`
- Correct channel layer backend for Django Channels [channels_redis](https://github.com/django/channels_redis)
    - `pip3 install channels_redis`

### Simple step by step guide:
1. Clone this repository
2. If desired create python3 virtual environment or skip this step
    - `python3-dev` package required
    - `sudo -H pip3 install virtualenv`
    - `$ virtualenv myEnvironment`
    - `$ source myEnvironment/bin/activate`
3. `pip3 install django-filter django-mathfilters django-bootstrap3 django-bootstrap-static django-fontawesome django-jquery channels channels_redis`
4. `sudo apt install redis-server`
5. `$ cd server`
6. `python3 manage.py runserver`

If using python3 virtualenv pip is pip3 and python is python3