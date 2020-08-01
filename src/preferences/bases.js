/*
Night Theme Switcher Gnome Shell extension

Copyright (C) 2020 Romain Vigier

This program is free software: you can redistribute it and/or modify it under
the terms of the GNU General Public License as published by the Free Software
Foundation, either version 3 of the License, or (at your option) any later
version.

This program is distributed in the hope that it will be useful, but WITHOUT
ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with
this program. If not, see <http s ://www.gnu.org/licenses/>.
*/

const { Gtk } = imports.gi;


var SettingsPage = class {

    constructor(label, description, contentWidget) {
        this.label = new Gtk.Label({
            label,
        });

        this.page = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            spacing: 30,
            margin_top: 30,
            margin_end: 36,
            margin_start: 36,
            margin_bottom: 36,
            valign: Gtk.Align.START,
            halign: Gtk.Align.CENTER,
        });

        const descriptionWidget = new Gtk.Label({
            label: description,
            use_markup: true,
            width_request: 600,
            max_width_chars: 60,
            wrap: true,
            justify: Gtk.Justification.LEFT,
            halign: Gtk.Align.START,
        });
        this.page.pack_start(descriptionWidget, false, false, 0);

        this.page.pack_start(contentWidget, false, false, 0);
    }

};

var SettingsList = class {

    constructor() {
        const frame = new Gtk.Frame({
            can_focus: false,
        });

        const list = new Gtk.ListBox({
            border_width: 0,
            margin: 0,
            can_focus: false,
            selection_mode: Gtk.SelectionMode.NONE,
        });
        frame.add(list);

        frame.add_row = widget => {
            if (list.get_children().length > 0) {
                const separator = new Gtk.Separator({
                    orientation: Gtk.Orientation.VERTICAL,
                    can_focus: false,
                });
                list.add(separator);
            }
            list.add(widget);
        };

        return frame;
    }

};

var SettingsListRow = class {

    constructor(label, widget) {
        const row = new Gtk.Box({
            margin: 16,
            spacing: 30,
            orientation: Gtk.Orientation.HORIZONTAL,
            can_focus: false,
        });

        const labelWidget = new Gtk.Label({
            label,
            halign: Gtk.Align.START,
        });
        row.pack_start(labelWidget, true, true, 0);

        widget.set_halign(Gtk.Align.END);
        row.pack_start(widget, false, false, 0);

        return row;
    }

};
