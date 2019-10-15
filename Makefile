UUID = nightthemeswitcher@romainvigier.fr
GSEXT_DIR_LOCAL = $(HOME)/.local/share/gnome-shell/extensions


.PHONY: build
build: clean
	mkdir -p ./build/$(UUID)
	cp -r ./src/* ./build/$(UUID)

.PHONY: install
install: build
	cp -r ./build/* $(GSEXT_DIR_LOCAL)/$(UUID)

.PHONY: zip
zip: build
	zip -jr ./build/$(UUID).zip ./build
	rm -r ./build/$(UUID)

.PHONY: clean
clean:
	-rm -rf ./build
