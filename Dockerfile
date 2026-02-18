FROM ubuntu:24.04

# install dependencies from apt
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y \
    vim \
    nginx \
    nodejs \
    npm \
    && apt-get clean && rm -rf /var/lib/apt/lists/*


# set working directory
WORKDIR /sinking-islands

# copy package.json and package-lock.json
COPY package*.json .

# install PM2
RUN npm install -g pm2

# install dependencies from npm
RUN npm install-clean

# copy the rest of the repo
COPY . /sinking-islands

# build application
RUN npm run build

# set up nginx
RUN chmod 644 default.nginx
RUN mv default.nginx /etc/nginx/sites-available/default
CMD ["nginx", "-g", "daemon off;"]

# set up backend
RUN pm2 start sinking-islands-ecosystem.config.js
