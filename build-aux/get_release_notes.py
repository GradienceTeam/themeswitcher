#!/usr/bin/env python3

# SPDX-FileCopyrightText: 2021 Romain Vigier <contact AT romainvigier.fr>
# SPDX-License-Identifier: GPL-3.0-or-later

"""Get release notes for a specific release."""


import argparse
import re

from typing import Dict, List


releases: Dict[str, str] = {}


def parse_changelog(path: str):
    """Parse a changelog file for versions and release notes.

    Args:
        path (str): Path to the changelog file.
    """
    release_regex = re.compile(r"^##\s")
    version_regex = re.compile(r"([\d\.]+)")

    current_version = ''
    current_notes: List[str] = []

    with open(path, "r") as f:
        for line in f.readlines():
            if release_regex.match(line):
                if current_version != '':
                    releases[current_version] = ''.join(current_notes).strip()
                current_notes = []
                current_version = version_regex.findall(line)[0]
            else:
                current_notes.append(line)
        releases[current_version] = ''.join(current_notes).strip()


def print_release_notes(version: str):
    """Print the release notes of the given release.

    Args:
        version (str): The requested version.
    """
    print(releases[version.replace("v", "")])


argparser = argparse.ArgumentParser()
argparser.add_argument(
    "-f", "--file",
    default="CHANGELOG.md",
    help="Path to the changelog file",
    metavar="CHANGELOG")
argparser.add_argument("version", help="Version to get the release notes for")
args = argparser.parse_args()


parse_changelog(args.file)
print_release_notes(args.version)
