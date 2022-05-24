#!/bin/sh

# SPDX-FileCopyrightText: 2022 Romain Vigier <contact AT romainvigier.fr>
# SPDX-License-Identifier: GPL-3.0-or-later

ZIP_EXE=$1
UUID=$2
PACK_DIR=$3

# Remove previous archive
rm -f $PACK_DIR/$UUID.zip

# Create the destination directory
mkdir -p $PACK_DIR

# Archive extension
cd $MESON_BUILD_ROOT/$UUID
$ZIP_EXE -r $PACK_DIR/$UUID.zip *

# Remove unarchived files
rm -rf $MESON_BUILD_ROOT/$UUID
