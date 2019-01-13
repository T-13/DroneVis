FROM python:3
ENV PYTHONUNBUFFERED 1

# App
RUN mkdir /code
WORKDIR /code

# Requirements
ADD requirements.txt /code/
RUN pip install -r requirements.txt

ADD . /code/

EXPOSE 8000
