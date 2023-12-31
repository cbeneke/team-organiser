# pull base image
FROM node:21-slim

# set our node environment, either development or production
# defaults to production, compose overrides this to development on build and run
ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

# default to port 19006 for node, and 19001 and 19002 (tests) for debug
ARG PORT=19006
ENV PORT $PORT
EXPOSE $PORT 19001 19002

# install global packages
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV PATH /home/node/.npm-global/bin:$PATH
RUN npm install --unsafe-perm -g npm@latest expo-cli@latest

# install dependencies first
RUN mkdir /app && chown node:node /app
WORKDIR /app

COPY ./package.json ./package-lock.json ./
RUN chown -R node:node /app
RUN npm install

# copy in our source code last, as it changes the most
COPY . ./
RUN chown -R node:node /app

USER node

ENTRYPOINT ["npm", "run"]
CMD ["web"]
