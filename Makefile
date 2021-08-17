# SPDX-FileCopyrightText: 2019-2021 Romain Vigier <contact AT romainvigier.fr>
# SPDX-License-Identifier: GPL-3.0-or-later

COPYRIGHT_YEAR = 2019-2021
AUTHOR_NAME = Romain Vigier
AUTHOR_EMAIL =

NAME = $(shell grep '"name"' ./src/metadata.json | sed 's/\s"name":\s"\(.\+\)",\?/\1/')
UUID = $(shell grep '"uuid"' ./src/metadata.json | sed 's/\s"uuid":\s"\(.\+\)",\?/\1/')
VERSION = $(shell grep '"version"' ./src/metadata.json | sed 's/\s"version":\s\([0-9]\+\),\?/\1/')


.PHONY: build
build: build-clean
	mkdir -p ./build
	gnome-extensions pack \
		--extra-source=../LICENSE \
		--extra-source=./config.js \
		--extra-source=./utils.js \
		--extra-source=./icons/ \
		--extra-source=./modules/ \
		--extra-source=./preferences/ \
		--extra-source=./schemas/ \
		--extra-source=./settings/ \
		--podir=./po/ \
		--gettext-domain=$(UUID) \
		--out-dir=./build \
		./src

.PHONY: build-clean
build-clean:
	-rm -rf ./build
	find ./src/ -type f -name "*.ui~" -delete

.PHONY: install
install: uninstall
	gnome-extensions install ./build/$(UUID).shell-extension.zip

.PHONY: uninstall
uninstall:
	-gnome-extensions uninstall $(UUID)

.PHONY: clean
clean: build-clean deps-clean

.PHONY: test
test: test-lint test-variants

.PHONY: test-lint
test-lint:
	npx eslint .

.PHONY: test-variants
test-variants:
	cat ./src/modules/GtkVariants.js ./tests/gtk_themes/_variants.js.template > ./tests/gtk_themes/_variants.js
	cat ./src/modules/ShellVariants.js ./tests/shell_themes/_variants.js.template > ./tests/shell_themes/_variants.js
	npm run test

.PHONY: deps-install
deps-install:
	npm install

.PHONY: deps-clean
deps-clean:
	-rm -rf ./node_modules

.PHONY: pot
pot:
	mkdir -p ./src/po
	xgettext \
		--from-code=UTF-8 \
		--keyword=_ \
		--package-name="$(NAME)" \
		--package-version="$(VERSION)" \
		--output=./src/po/$(UUID).pot \
		./src/*.js ./src/**/*.js ./src/schemas/*.xml ./src/preferences/ui/*.ui
	sed -i '1,4s/SOME DESCRIPTIVE TITLE./$(NAME)/g' ./src/po/$(UUID).pot
	sed -i '1,4s/YEAR/$(COPYRIGHT_YEAR)/' ./src/po/$(UUID).pot
	sed -i "1,4s/THE PACKAGE'S COPYRIGHT HOLDER/$(AUTHOR_NAME)/" ./src/po/$(UUID).pot
	sed -i "1,4s/FIRST AUTHOR/$(AUTHOR_NAME)/" ./src/po/$(UUID).pot
	sed -i "1,4s/EMAIL@ADDRESS/$(AUTHOR_EMAIL)/" ./src/po/$(UUID).pot

.PHONY: add-po
add-po:
ifdef LANGUAGE_CODE
	msginit --no-translator --input=src/po/$(UUID).pot --output=src/po/$(LANGUAGE_CODE).po --locale=$(LANGUAGE_CODE)
else
	@echo "Please specify the code of the language you want to add, for example:"
	@echo "	make add-po LANGUAGE_CODE=fr"
endif

.PHONY: update-po
update-po:
	for po_file in $(wildcard ./src/po/*.po); do \
		msgmerge --update --no-fuzzy-matching --backup=none $$po_file src/po/$(UUID).pot; \
	done
