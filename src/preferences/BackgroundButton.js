// SPDX-FileCopyrightText: 2021, 2022 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const { Gdk, GdkPixbuf, Gio, GLib, GObject, Gtk } = imports.gi;
const { extensionUtils } = imports.misc;

const Me = extensionUtils.getCurrentExtension();


var BackgroundButton = GObject.registerClass({
    GTypeName: 'BackgroundButton',
    Template: `file://${GLib.build_filenamev([Me.path, 'preferences', 'ui', 'BackgroundButton.ui'])}`,
    InternalChildren: ['filechooser'],
    Properties: {
        path: GObject.ParamSpec.string(
            'path',
            'Path',
            'Path to the background file',
            GObject.ParamFlags.READWRITE,
            null
        ),
        width: GObject.ParamSpec.int(
            'width',
            'Width',
            'Thumbnail width',
            GObject.ParamFlags.READWRITE,
            0, 600,
            180
        ),
        height: GObject.ParamSpec.int(
            'height',
            'Height',
            'Thumbnail height',
            GObject.ParamFlags.READWRITE,
            0, 600,
            120
        ),
    },
}, class BackgroundButton extends Gtk.Button {
    openFileChooser() {
        this._filechooser.transient_for = this.get_root();
        this._filechooser.show();
    }

    onFileChooserResponse(fileChooser, responseId) {
        if (responseId !== Gtk.ResponseType.ACCEPT)
            return;
        this.path = fileChooser.get_file().get_uri();
    }

    onClicked(_button) {
        this.openFileChooser();
    }

    getThumbnail(_widget, path) {
        if (!path)
            return null;
        const pixbuf = GdkPixbuf.Pixbuf.new_from_file(Gio.File.new_for_uri(path).get_path());
        const scale = this.width / (pixbuf.width > pixbuf.height ? pixbuf.height : pixbuf.width);
        const thumbPixbuf = GdkPixbuf.Pixbuf.new(GdkPixbuf.Colorspace.GDK_COLORSPACE_RGB, false, pixbuf.bits_per_sample, this.width, this.height);
        pixbuf.scale(
            thumbPixbuf,
            0, 0,
            this.width, this.height,
            -(pixbuf.width * scale - this.width) / 2, -(pixbuf.height * scale - this.height) / 2,
            scale, scale,
            GdkPixbuf.InterpType.GDK_INTERP_BILINEAR
        );
        return Gdk.Texture.new_for_pixbuf(thumbPixbuf);
    }
});
