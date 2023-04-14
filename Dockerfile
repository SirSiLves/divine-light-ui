
### STAGE 1: Build ###
FROM node:18-alpine AS build
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build --prod

### STAGE 2: Run ###
FROM nginx:1.18-alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /usr/src/app/dist/divine-light-ui /usr/share/nginx/html


# docker build -t divine-light-docker:latest .
# docker save divine-light-docker:latest -o "divine-light-docker.tar" divine-light-docker
# on error: sudo vi ~/.npmrc -> exclude artifactory path
# on error: npm config set registry "https://registry.npmjs.org"
# old: npm config set registry "https://artifactory.rch.cloud/artifactory/api/npm/rch-npm-group/"
# NAS: 4201 / 81

