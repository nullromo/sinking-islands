FROM node:latest

COPY . /work
WORKDIR /work

RUN npm install-clean
