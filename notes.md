brew install npm
brew install gnu-tar
npm install .
npm install gulp
cd wwwroot && npm run gulp
npm run docker-build-local




    build:
      context: ./terriamap
      dockerfile: Dockerfile

# Requires node 6, on ubuntu.

npm install -g sync-dependencies
sync-dependencies --source terriajs --from packages/terriajs/package.json
yarn install

# to have a live version running on localhost
cd packages/terriajs && npm run gulp watch &
npm run gulp watch &
npm serve

# To build and run in docker on prod
npm run gulp build && npm run docker-build-local
pushd ../ckan-docker-compose/ && docker-compose build terriamap && docker-compose up -d && popd


# on the mac, use the makefile...
