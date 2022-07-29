// SPDX-FileCopyrightText: 2022 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const { extensionUtils } = imports.misc;

const Me = extensionUtils.getCurrentExtension();

/**
 * Print a message in debug builds.
 *
 * @param  {string} msg Message to print.
 */
function message(msg) {
    if ('@BUILD_TYPE@' === 'debug') // eslint-disable-line no-constant-condition
        console.log(`[${Me.metadata.name}] ${msg}`);
}
