# pull base image
FROM node:21-slim

# set our node environment to production
ENV NODE_ENV production

# expose port 5173 for node / vite
EXPOSE 5173

# install global packages
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV PATH /home/node/.npm-global/bin:$PATH
RUN npm install --unsafe-perm -g npm@latest

# install dependencies first
RUN mkdir /app && chown node:node /app
WORKDIR /app

COPY ./package.json ./package-lock.json ./
RUN chown -R node:node /app
RUN npm install

# copy in our source code last, as it changes the most
COPY --chown=node:node *.js *.tsx tsconfig.* *.html ./
COPY --chown=node:node ./src ./src
COPY --chown=node:node ./public ./public

USER node

ENTRYPOINT ["npm", "run"]
CMD ["web"]
