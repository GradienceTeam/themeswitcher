// SPDX-FileCopyrightText: 2020, 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const { Gdk, GLib, Gtk } = imports.gi;
const { extensionUtils } = imports.misc;

const Me = extensionUtils.getCurrentExtension();

const Gettext = imports.gettext.domain(Me.metadata['gettext-domain']);
const _ = Gettext.gettext;

const utils = Me.imports.utils;


var OndemandKeyboardShortcutDialog = class {
    constructor(settings) {
        this._builder = new Gtk.Builder();
        this._builder.add_from_file(GLib.build_filenamev([Me.path, 'preferences', 'ui', 'ondemand_keyboard_shortcut_dialog.ui']));

        this.widget = this._builder.get_object('dialog');

        this._connectSettings(settings);

        return this.widget;
    }

    _connectSettings(settings) {
        const eventController = this._builder.get_object('event-controller');
        eventController.connect('key-pressed', (_widget, keyval, keycode, state) => {
            let mask = state & Gtk.accelerator_get_default_mod_mask();
            mask &= ~Gdk.ModifierType.LOCK_MASK;

            if (mask === 0 && keyval === Gdk.KEY_Escape) {
                this.widget.visible = false;
                return Gdk.EVENT_STOP;
            }

            if (
                !utils.isBindingValid({ mask, keycode, keyval }) ||
                !utils.isAccelValid({ mask, keyval })
            )
                return Gdk.EVENT_STOP;

            const binding = Gtk.accelerator_name_with_keycode(
                null,
                keyval,
                keycode,
                mask
            );
            settings.time.ondemandKeybinding = binding;
            this.widget.close();
            return Gdk.EVENT_STOP;
        });
    }
};
