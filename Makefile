# Night Theme Switcher Gnome Shell extension
#
# Copyright (C) 2019, 2020 Romain Vigier
#
# This program is free software: you can redistribute it and/or modify it under
# the terms of the GNU General Public License as published by the Free Software
# Foundation, either version 3 of the License, or (at your option) any later
# version.
#
# This program is distributed in the hope that it will be useful, but WITHOUT
# ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
# FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License along with
# this program. If not, see <http s ://www.gnu.org/licenses/>.

COPYRIGHT_YEAR = 2019, 2020
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
		--extra-source=./compat.js \
		--extra-source=./config.js \
		--extra-source=./convenience.js \
		--extra-source=./utils.js \
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
