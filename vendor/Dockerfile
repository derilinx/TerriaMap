ARG NODE_VERSION=6
FROM node:$NODE_VERSION

# Static Docker CLI copied from the official image, replacing the old 18.09 .deb
COPY --from=docker:27-cli /usr/local/bin/docker /usr/local/bin/docker
