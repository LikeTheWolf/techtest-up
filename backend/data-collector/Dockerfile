## STAGE 1 ##
FROM node:20-alpine AS development

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

RUN yarn build
## END OF STAGE 1 ##

## STAGE 2 ##
FROM node:20-alpine AS production

ENV NODE_ENV=production

WORKDIR /usr/src/app

# Create directory for SSL certificates
RUN mkdir -p /usr/src/app/ssl

COPY package.json yarn.lock ./

# dont include dev dependancies
# frozen lockfile is the yarn equivalent of npm install ci
# which reinstalls all dependancies from lockfile
RUN yarn install --frozen-lockfile --production

# copy the built files from dev stage to prod stage
COPY --from=development /usr/src/app/dist ./dist

EXPOSE 5000

CMD ["node", "dist/server.js"]