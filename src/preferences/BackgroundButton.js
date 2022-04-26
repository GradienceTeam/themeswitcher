// SPDX-FileCopyrightText: 2021, 2022 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const { Adw, Gdk, GdkPixbuf, Gio, GLib, GObject, Gtk } = imports.gi;
const { extensionUtils } = imports.misc;

const Me = extensionUtils.getCurrentExtension();
const _ = extensionUtils.gettext;


var BackgroundButton = GObject.registerClass({
    GTypeName: 'BackgroundButton',
    Template: 'resource:///org/gnome/shell/extensions/nightthemeswitcher/preferences/ui/BackgroundButton.ui',
    InternalChildren: ['filechooser'],
    Properties: {
        uri: GObject.ParamSpec.string(
            'uri',
            'URI',
            'URI to the background file',
            GObject.ParamFlags.READWRITE,
            null
        ),
        thumb_width: GObject.ParamSpec.int(
            'thumb-width',
            'Thumbnail width',
            'Width of the displayed thumbnail',
            GObject.ParamFlags.READWRITE,
            0, 600,
            180
        ),
        thumb_height: GObject.ParamSpec.int(
            'thumb-height',
            'Thumbnail height',
            'Height of the displayed thumbnail',
            GObject.ParamFlags.READWRITE,
            0, 600,
            180
        ),
    },
}, class BackgroundButton extends Gtk.Button {
    constructor(props = {}) {
        super(props);
        this.#setupSize();
        this.#setupDropTarget();
    }

    #setupSize() {
        const display = Gdk.Display.get_default();
        const monitor = display.get_monitors().get_item(0);
        if (monitor.width_mm === 0 || monitor.height_mm === 0)
            return;
        if (monitor.width_mm > monitor.height_mm)
            this.thumb_height *= monitor.height_mm / monitor.width_mm;
        else
            this.thumb_width *= monitor.width_mm / monitor.height_mm;
    }

    #setupDropTarget() {
        const dropTarget = Gtk.DropTarget.new(Gio.File.$gtype, Gdk.DragAction.COPY);
        dropTarget.connect('drop', (_target, file, _x, _y) => {
            const contentType = Gio.content_type_guess(file.get_basename(), null)[0];
            if (
                Gio.content_type_equals(contentType, 'image/jpeg') ||
                Gio.content_type_equals(contentType, 'image/png') ||
                Gio.content_type_equals(contentType, 'image/svg+xml') ||
                Gio.content_type_equals(contentType, 'image/tiff') ||
                Gio.content_type_equals(contentType, 'application/xml')
            ) {
                this.uri = file.get_uri();
                return true;
            } else {
                if (this.root instanceof Adw.PreferencesWindow) {
                    this.root.add_toast(new Adw.Toast({
                        title: _('Only JPEG, PNG, TIFF, SVG and XML files can be set as background image.'),
                        timeout: 10,
                    }));
                }
                return false;
            }
        });
        this.add_controller(dropTarget);
    }

    vfunc_mnemonic_activate() {
        this.openFileChooser();
    }

    openFileChooser() {
        this._filechooser.transient_for = this.get_root();
        this._filechooser.show();
    }

    onFileChooserResponse(fileChooser, responseId) {
        if (responseId !== Gtk.ResponseType.ACCEPT)
            return;
        this.uri = fileChooser.get_file().get_uri();
    }

    onClicked(_button) {
        this.openFileChooser();
    }

    getThumbnail(_widget, uri, width, height) {
        if (!uri)
            return null;

        let path;
        const file = Gio.File.new_for_uri(uri);
        const contentType = Gio.content_type_guess(file.get_basename(), null)[0];
        if (
            Gio.content_type_equals(contentType, 'image/jpeg') ||
            Gio.content_type_equals(contentType, 'image/png') ||
            Gio.content_type_equals(contentType, 'image/svg+xml') ||
            Gio.content_type_equals(contentType, 'image/tiff')
        ) {
            path = file.get_path();
        } else if (Gio.content_type_equals(contentType, 'application/xml')) {
            const decoder = new TextDecoder('utf-8');
            const contents = decoder.decode(file.load_contents(null)[1]);
            try {
                path = contents.match(/<file>(.+)<\/file>/m)[1];
            } catch (_e) {}
        }

        if (!path)
            return null;

        const pixbuf = GdkPixbuf.Pixbuf.new_from_file(path);
        const scale = pixbuf.width / pixbuf.height > width / height ? height / pixbuf.height : width / pixbuf.width;
        const thumbPixbuf = GdkPixbuf.Pixbuf.new(GdkPixbuf.Colorspace.GDK_COLORSPACE_RGB, pixbuf.has_alpha, pixbuf.bits_per_sample, width, height);
        pixbuf.scale(
            thumbPixbuf,
            0, 0,
            width, height,
            -(pixbuf.width * scale - width) / 2, -(pixbuf.height * scale - height) / 2,
            scale, scale,
            GdkPixbuf.InterpType.GDK_INTERP_BILINEAR
        );

        return Gdk.Texture.new_for_pixbuf(thumbPixbuf);
    }
});
