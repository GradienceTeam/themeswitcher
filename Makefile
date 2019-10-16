UUID = nightthemeswitcher@romainvigier.fr
GSEXT_DIR_LOCAL = $(HOME)/.local/share/gnome-shell/extensions

VERSION = $(shell grep '"version"' ./src/metadata.json | sed 's/.*\s\([0-9.]*\),/\1/')


.PHONY: build
build: clean
	mkdir -p ./build/$(UUID)
	cp -r ./src/* ./build/$(UUID)
	cp ./LICENSE ./build/$(UUID)

.PHONY: install
install: uninstall build
	mkdir -p $(GSEXT_DIR_LOCAL)
	cp -r ./build/* $(GSEXT_DIR_LOCAL)

.PHONY: zip
zip: build
	zip -jr ./build/$(UUID).$(VERSION).zip ./build
	rm -r ./build/$(UUID)

.PHONY: clean
clean:
	-rm -rf ./build

.PHONY: uninstall
uninstall:
	-rm -rf $(GSEXT_DIR_LOCAL)/$(UUID)
