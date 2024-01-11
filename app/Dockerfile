# pull base image
FROM node:21-slim

# set our node environment to production
ENV NODE_ENV production

# expose port 19006 for node
EXPOSE 19006

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
COPY --chown=node:node *.js *.tsx tsconfig.json app.json ./
COPY --chown=node:node ./assets ./assets
COPY --chown=node:node ./components ./components
COPY --chown=node:node ./helper ./helper
COPY --chown=node:node ./locales ./locales
COPY --chown=node:node ./screens ./screens

USER node

ENTRYPOINT ["npm", "run"]
CMD ["web"]
