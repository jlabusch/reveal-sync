GROUP_VARS=ansible/group_vars/ontario
NAME=$(shell node -e 'console.log(require("./package.json").name)')
VERSION=$(shell node -e 'console.log(require("./package.json").version)')
PACKAGE=ansible/roles/reveal_sync/files/$(NAME)-$(VERSION).tbz2
NODE_SOURCES=index.js $(wildcard lib/*.js)
