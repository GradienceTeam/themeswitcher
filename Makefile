# Night Theme Switcher Gnome Shell extension
#
# Copyright (C) 2019 Romain Vigier
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

COPYRIGHT_YEAR = 2019
AUTHOR_NAME = Romain Vigier
AUTHOR_EMAIL =

NAME = $(shell grep '"name"' ./src/metadata.json | sed 's/\s"name":\s"\(.\+\)",\?/\1/')
UUID = $(shell grep '"uuid"' ./src/metadata.json | sed 's/\s"uuid":\s"\(.\+\)",\?/\1/')
VERSION = $(shell grep '"version"' ./src/metadata.json | sed 's/\s"version":\s\([0-9]\+\),\?/\1/')


.PHONY: build
build: clean
	mkdir -p ./build
	gnome-extensions pack \
		--extra-source=../LICENSE \
		--podir=./po/ \
		--gettext-domain=$(UUID) \
		--out-dir=./build \
		./src

.PHONY: install
install: uninstall build
	gnome-extensions install ./build/$(UUID).shell-extension.zip

.PHONY: clean
clean:
	-rm -rf ./build

.PHONY: uninstall
uninstall:
	-gnome-extensions uninstall $(UUID)

.PHONY: pot
pot:
	mkdir -p ./src/po
	xgettext \
		--from-code=UTF-8 \
		--keyword=_ \
		--package-name="$(NAME)" \
		--package-version="$(VERSION)" \
		--output=./src/po/$(UUID).pot \
		./src/*.js
	sed -i '1,4s/SOME DESCRIPTIVE TITLE./$(NAME)/g' ./src/po/$(UUID).pot
	sed -i '1,4s/YEAR/$(COPYRIGHT_YEAR)/' ./src/po/$(UUID).pot
	sed -i "1,4s/THE PACKAGE'S COPYRIGHT HOLDER/$(AUTHOR_NAME)/" ./src/po/$(UUID).pot
	sed -i "1,4s/FIRST AUTHOR/$(AUTHOR_NAME)/" ./src/po/$(UUID).pot
	sed -i "1,4s/EMAIL@ADDRESS/$(AUTHOR_EMAIL)/" ./src/po/$(UUID).pot
