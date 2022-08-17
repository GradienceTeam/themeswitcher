// SPDX-FileCopyrightText: 2022 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const { extensionUtils } = imports.misc;

const Me = extensionUtils.getCurrentExtension();

const { Time } = Me.imports.enums.Time;


/**
 * Time source base class.
 *
 * It needs to be enabled before being able to retrieve the time and disabled
 * before being disposed.
 *
 * It emits the `time-changed` signal containing the new time when the time
 * changes.
 */
var Source = class {
    enable() {}

    disable() {}

    /**
     * @type {Time}
     */
    get time() {
        return Time.UNKNOWN;
    }
};
