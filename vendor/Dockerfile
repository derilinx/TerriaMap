ARG NODE_VERSION=6
from node:$NODE_VERSION

run cd /tmp && \
    wget https://download.docker.com/linux/debian/dists/jessie/pool/test/amd64/docker-ce-cli_18.09.0~ce~0.5.tp5-0~debian_amd64.deb && \
    dpkg -i *.deb && rm *.deb
