FROM node:20-alpine

ENV workDir /home/node/app
WORKDIR ${workDir}

RUN mkdir -p ${workDir}/node_modules
RUN chown -R node:node ${workDir}

COPY package.json .
COPY package-lock.json .

USER node

RUN npm ci

COPY ./ ./

EXPOSE 8080

CMD [ "npm", "start" ]