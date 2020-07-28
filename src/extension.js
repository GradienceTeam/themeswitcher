/*
Night Theme Switcher Gnome Shell extension

Copyright (C) 2020 Romain Vigier

This program is free software: you can redistribute it and/or modify it under
the terms of the GNU General Public License as published by the Free Software
Foundation, either version 3 of the License, or (at your option) any later
version.

This program is distributed in the hope that it will be useful, but WITHOUT
ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with
this program. If not, see <http s ://www.gnu.org/licenses/>.
*/

'use strict';

const { extensionUtils } = imports.misc;
const { main } = imports.ui;

const Me = extensionUtils.getCurrentExtension();

const compat = Me.imports.compat;
const { log_debug } = Me.imports.utils;
const { SettingsManager } = Me.imports.modules.SettingsManager;
const { Timer } = Me.imports.modules.Timer;
const { GtkThemer } = Me.imports.modules.GtkThemer;
const { ShellThemer } = Me.imports.modules.ShellThemer;
const { IconThemer } = Me.imports.modules.IconThemer;
const { CursorThemer } = Me.imports.modules.CursorThemer;
const { Backgrounder } = Me.imports.modules.Backgrounder;
const { Commander } = Me.imports.modules.Commander;


var enabled = false;
var settingsManager = null;
var timer = null;
var gtkThemer = null;
var shellThemer = null;
var iconThemer = null;
var cursorThemer = null;
var backgrounder = null;
var commander = null;


function init() {
	log_debug('Initializing extension...');
	compat.init_translations(Me.metadata.uuid);
	log_debug('Extension initialized.');
}

function enable() {
	this._await_extensionManager_init().then(() => {
		log_debug('Enabling extension...');
		settingsManager = new SettingsManager();
		timer = new Timer();
		gtkThemer = new GtkThemer();
		shellThemer = new ShellThemer();
		iconThemer = new IconThemer();
		cursorThemer = new CursorThemer();
		backgrounder = new Backgrounder();
		commander = new Commander();

		settingsManager.enable();
		gtkThemer.enable();
		shellThemer.enable();
		iconThemer.enable();
		cursorThemer.enable();
		backgrounder.enable();
		commander.enable();
		timer.enable();

		enabled = true;
		log_debug('Extension enabled.');
	});
}

function disable() {
	log_debug('Disabling extension...');
	enabled = false;

	gtkThemer.disable();
	shellThemer.disable();
	iconThemer.disable();
	cursorThemer.disable();
	backgrounder.disable();
	commander.disable();
	timer.disable();
	settingsManager.disable();

	settingsManager = null;
	timer = null;
	gtkThemer = null;
	shellThemer = null;
	iconThemer = null;
	cursorThemer = null;
	backgrounder = null;
	commander = null;
	log_debug('Extension disabled.');
}

async function _await_extensionManager_init() {
	log_debug('Waiting for the Extension Manager to be initialized...');
	while ( true ) {
		if ( compat.extension_manager_initialized() ) return;
		await null;
	}
}
