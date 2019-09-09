USER=$(shell id -u)
GROUP=$(shell id -g)
COMMON_NODE_OPTS=-w "/usr/src" --rm -v "$(realpath .):/usr/src" -v "$(realpath ../terriajs):/usr/src/packages/terriajs" 
NODE_OPTS=$(COMMON_NODE_OPTS) -u $(USER):$(GROUP)
DOCKER_NODE_OPTS=-v "/var/run/docker.sock:/var/run/docker.sock" $(COMMON_NODE_OPTS)
NODE_VERSION=8
NODE_IMAGE=node:$(NODE_VERSION)


NPM=docker run $(NODE_OPTS) -ti $(NODE_IMAGE) npm


help:
	@echo "bash: bash shell in node"
	@echo "init: install all of the node_module dependencies"
	@echo "build: build terriamap"
	@echo "build-terriajs: build the core terriajs"
	@echo "local: build the docker image with the local tag"
	@echo "build: build the docker image with the prod tag"

bash:
	docker run $(NODE_OPTS) -ti $(NODE_IMAGE) bash

build-terriajs:
	docker run $(NODE_OPTS) -ti $(NODE_IMAGE) sh -c "cd packages/terriajs && npm run gulp build"

build:
	$(NPM) run gulp build

build-prod:
	$(NPM) run gulp release

docker-build-local:
	docker run $(DOCKER_NODE_OPTS) node:$(NODE_VERSION)_docker npm run docker-build-local
local: build docker-build-local

docker-build-prod:
	docker run $(DOCKER_NODE_OPTS) node:$(NODE_VERSION)_docker npm run docker-build-prod

prod: build-prod docker-build-prod

# no -ti
watch:
	docker run $(NODE_OPTS) $(NODE_IMAGE) npm run gulp watch &

# need ports and no -ti
dev-serve:
	docker run -p 3001:3001 $(NODE_OPTS) $(NODE_IMAGE) node node_modules/terriajs-server/lib/app.js --config-file wwwroot/devserverconfig.json &

init: build-image install yarn

install:
	$(NPM) install .
	$(NPM) install sync-dependencies

	docker run $(NODE_OPTS) -ti $(NODE_IMAGE) node_modules/.bin/sync-dependencies --source terriajs --from packages/terriajs/package.json
	rm -r node_modules/terriajs
	cd node_modules && ln -s ../packages/terriajs

yarn:
	docker run $(NODE_OPTS) -ti $(NODE_IMAGE) yarn

#docker run $(NODE_OPTS) -ti $(NODE_IMAGE) sh -c "cd packages/terriajs && npm install . && rm -rf node_modules/terriajs-cesium"
#	($NPM) run gulp sync-terriajs-dependencies

build-image:
	docker build -t "node:$(NODE_VERSION)_docker" -f vendor/Dockerfile --build-arg NODE_VERSION=$(NODE_VERSION) vendor
