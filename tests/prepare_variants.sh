#!/bin/sh

# SPDX-FileCopyrightText: 2021 Romain Vigier <contact AT romainvigier.fr>
# SPDX-License-Identifier: GPL-3.0-or-later

grep -vE 'imports|^const Me' ./src/modules/GtkVariants.js | cat ./src/enums/Time.js - ./tests/gtk_themes/_variants.js.template > ./tests/gtk_themes/_variants.js
grep -vE 'imports|^const Me' ./src/modules/ShellVariants.js | cat ./src/enums/Time.js - ./tests/shell_themes/_variants.js.template > ./tests/shell_themes/_variants.js
