# SPDX-FileCopyrightText: 2019-2021 Romain Vigier <contact AT romainvigier.fr>
# SPDX-License-Identifier: GPL-3.0-or-later


NAME = $(shell grep '"name"' ./src/metadata.json | sed 's/\s"name":\s"\(.\+\)",\?/\1/')
UUID = $(shell grep '"uuid"' ./src/metadata.json | sed 's/\s"uuid":\s"\(.\+\)",\?/\1/')
DOMAIN = $(shell grep '"gettext-domain"' ./src/metadata.json | sed 's/\s"gettext-domain":\s"\(.\+\)",\?/\1/')


.PHONY: build
build:
	mkdir -p ./build
	gnome-extensions pack \
		--force \
		--extra-source=../LICENSE \
		--extra-source=./config.js \
		--extra-source=./utils.js \
		--extra-source=./icons/ \
		--extra-source=./modules/ \
		--extra-source=./preferences/ \
		--extra-source=./schemas/ \
		--extra-source=./settings/ \
		--podir=./po/ \
		--gettext-domain=$(DOMAIN) \
		--out-dir=./build \
		./src

.PHONY: clean
build-clean:
	-rm -rf ./build

.PHONY: install
install: uninstall
	gnome-extensions install --force ./build/$(UUID).shell-extension.zip

.PHONY: uninstall
uninstall:
	-gnome-extensions uninstall $(UUID)

.PHONY: test
test:
	reuse lint
	npm run test

.PHONY: pot
pot:
	mkdir -p ./src/po
	xgettext \
		--from-code=UTF-8 \
		--package-name="$(NAME)" \
		--output=./src/po/$(DOMAIN).pot \
		./src/*.js ./src/**/*.js ./src/schemas/*.xml ./src/preferences/ui/*.ui

.PHONY: update-po
update-po:
	for po_file in $(wildcard ./src/po/*.po); do \
		msgmerge --update $$po_file src/po/$(DOMAIN).pot; \
	done
