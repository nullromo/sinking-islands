FROM ubuntu:24.04

# install dependencies from apt
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y \
    vim \
    nginx \
    nodejs \
    npm


# set working directory
WORKDIR /sinking-islands

# copy package.json and package-lock.json
COPY package*.json .

# install dependencies from npm
RUN npm install-clean

# copy the rest of the repo
COPY . /sinking-islands

# build application
RUN npm run build

# set up nginx
RUN chmod 644 nginx.config
RUN mv nginx.config /etc/nginx/sites-available/default
CMD ["nginx", "-g", "daemon off;"]
