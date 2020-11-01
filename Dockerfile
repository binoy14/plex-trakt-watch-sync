FROM node:12

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn --frozen-lockfile --prod

COPY build/ .

ARG ACCESS_TOKEN
ARG API_KEY
ENV NODE_ENV production

EXPOSE 3000

CMD ["node", "server.js"]
