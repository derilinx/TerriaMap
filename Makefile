NODE_OPTS=-w "/usr/src" --rm -v "$(realpath .):/usr/src" -v "$(realpath ../terriajs):/usr/src/packages/terriajs"
NODE_IMAGE=node:6


NPM=docker run $(NODE_OPTS) -ti $(NODE_IMAGE) npm

build:
	$(NPM) run gulp build

local: build
	docker run -v "/var/run/docker.sock:/var/run/docker.sock" $(NODE_OPTS) node:6_docker npm run docker-build-local

prod: build
	docker run -v "/var/run/docker.sock:/var/run/docker.sock" $(NODE_OPTS) node:6_docker npm run docker-build-prod

# no -ti
watch:
	docker run $(NODE_OPTS) $(NODE_IMAGE) npm run gulp watch &

# need ports and no -ti
dev-serve:
	docker run -p 3001:3001 $(NODE_OPTS) $(NODE_IMAGE) node node_modules/terriajs-server/lib/app.js --config-file devserverconfig.json &

init:
	$(NPM) install .
	$(NPM) install gulp sync-dependencies
	$(NPM) update
	$(NPM) sync-dependencies --source terriajs --from packages/terriajs/package.json

build-image:
	docker build -t "node:6_docker" -f vendor/Dockerfile vendor
