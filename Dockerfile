# build environment
FROM node:9.6.1

# Create a work directory and copy over our dependency manifest files.
RUN mkdir /usr/src/app

COPY . /usr/src/app

WORKDIR /usr/src/app

ENV PATH /usr/src/app/node_modules/.bin:$PATH

RUN npm install 

RUN npm run build

CMD ["node", "app"]

EXPOSE 8080