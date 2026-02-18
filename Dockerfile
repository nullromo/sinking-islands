FROM node:latest

COPY . /work
WORKDIR /work

RUN npm i npm-run-all
