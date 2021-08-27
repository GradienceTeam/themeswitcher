# SPDX-FileCopyrightText: 2020, 2021 Romain Vigier <contact AT romainvigier.fr>
# SPDX-License-Identifier: GPL-3.0-or-later

FROM fedora:34

# Build gnome-extensions
RUN dnf install --nodocs -y gcc git glib2-devel gnome-autoar-devel json-glib-devel meson \
	&& dnf clean all \
	&& git clone --depth 1 --branch 40.0 https://gitlab.gnome.org/GNOME/gnome-shell.git /src/gnome-shell \
	&& cd /src/gnome-shell/subprojects/extensions-tool \
	&& ./generate-translations.sh \
	&& meson builddir --prefix=/usr --buildtype=release -Dman=false -Dbash_completion=disabled \
	&& meson install -C builddir \
	&& rm -r /src/gnome-shell \
	&& dnf remove -y gcc git glib2-devel gnome-autoar-devel json-glib-devel meson

# Install runtime dependencies
RUN dnf install --nodocs -y findutils gettext gnome-autoar json-glib make gzip brotli \
	&& dnf clean all
