# Night Theme Switcher Gnome Shell extension
#
# Copyright (C) 2020 Romain Vigier
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

FROM fedora:33

# Build gnome-extensions
RUN dnf install --nodocs -y gcc git glib2-devel gnome-autoar-devel json-glib-devel meson \
	&& dnf clean all \
	&& git clone --depth 1 --branch 3.38.3 https://gitlab.gnome.org/GNOME/gnome-shell.git /src/gnome-shell \
	&& cd /src/gnome-shell/subprojects/extensions-tool \
	&& ./generate-translations.sh \
	&& meson builddir --prefix=/usr --buildtype=release -Dman=false -Dbash_completion=disabled \
	&& meson install -C builddir \
	&& rm -r /src/gnome-shell \
	&& dnf remove -y gcc git glib2-devel gnome-autoar-devel json-glib-devel meson

# Install runtime dependencies
RUN dnf install --nodocs -y findutils gettext gnome-autoar make \
	&& dnf clean all
