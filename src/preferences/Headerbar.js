// SPDX-FileCopyrightText: 2020, 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const { GLib, Gtk } = imports.gi;
const { extensionUtils } = imports.misc;

const Me = extensionUtils.getCurrentExtension();

const Gettext = imports.gettext.domain(Me.metadata['gettext-domain']);
const _ = Gettext.gettext;

const utils = Me.imports.utils;


var Headerbar = class {
    constructor(stack) {
        this._builder = new Gtk.Builder();
        this._builder.add_from_file(GLib.build_filenamev([Me.path, 'preferences', 'ui', 'headerbar.ui']));

        this.widget = this._builder.get_object('headerbar');

        this._connect(stack);

        return this.widget;
    }

    _connect(stack) {
        const scheduleRadio = this._builder.get_object('schedule_radio');
        scheduleRadio.connect('clicked', () => stack.set_visible_child_name('schedule'));

        const gtkThemeRadio = this._builder.get_object('gtk_theme_radio');
        gtkThemeRadio.connect('clicked', () => stack.set_visible_child_name('gtk-theme'));

        const shellThemeRadio = this._builder.get_object('shell_theme_radio');
        shellThemeRadio.connect('clicked', () => stack.set_visible_child_name('shell-theme'));

        const iconThemeRadio = this._builder.get_object('icon_theme_radio');
        iconThemeRadio.connect('clicked', () => stack.set_visible_child_name('icon-theme'));

        const cursorThemeRadio = this._builder.get_object('cursor_theme_radio');
        cursorThemeRadio.connect('clicked', () => stack.set_visible_child_name('cursor-theme'));

        const backgroundsRadio = this._builder.get_object('backgrounds_radio');
        backgroundsRadio.connect('clicked', () => stack.set_visible_child_name('backgrounds'));

        const commandsRadio = this._builder.get_object('commands_radio');
        commandsRadio.connect('clicked', () => stack.set_visible_child_name('commands'));
    }
};
