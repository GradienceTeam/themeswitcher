// SPDX-FileCopyrightText: 2022 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * Print a message in debug builds.
 *
 * @param {string} msg Message to print.
 */
export function message(msg) {
    if (NTSMetadata['build-type'] === 'debug')
        console.log(`[${NTSMetadata.name}] ${msg}`);
}
