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

var THEME_GSETTINGS_SCHEMA = 'org.gnome.desktop.interface';
var THEME_GSETTINGS_PROPERTY = 'gtk-theme';

var NIGHTLIGHT_GSETTINGS_SCHEMA = 'org.gnome.settings-daemon.plugins.color';
var NIGHTLIGHT_GSETTINGS_PROPERTY = 'night-light-enabled';

var LOCATION_GSETTINGS_SCHEMA = 'org.gnome.system.location';
var LOCATION_GSETTINGS_PROPERTY = 'enabled';

// GeoClue2 interfaces from https://gitlab.freedesktop.org/geoclue/geoclue/
var GEOCLUE_MANAGER_INTERFACE = `
<node>
	<interface name="org.freedesktop.GeoClue2.Manager">
		<property name="InUse" type="b" access="read"/>
		<property name="AvailableAccuracyLevel" type="u" access="read"/>
		<method name="GetClient">
			<arg name="client" type="o" direction="out"/>
		</method>
		<method name="CreateClient">
			<arg name="client" type="o" direction="out"/>
		</method>
		<method name="DeleteClient">
			<arg name="client" type="o" direction="in"/>
		</method>
		<method name="AddAgent">
			<arg name="id" type="s" direction="in"/>
		</method>
	</interface>
</node>`;
var GEOCLUE_CLIENT_INTERFACE = `
<node>
	<interface name="org.freedesktop.GeoClue2.Client">
		<property name="Location" type="o" access="read"/>
		<property name="DistanceThreshold" type="u" access="readwrite">
			<annotation name="org.freedesktop.Accounts.DefaultValue" value="0"/>
		</property>
		<property name="TimeThreshold" type="u" access="readwrite">
			<annotation name="org.freedesktop.Accounts.DefaultValue" value="0"/>
		</property>
		<property name="DesktopId" type="s" access="readwrite"/>
		<property name="RequestedAccuracyLevel" type="u" access="readwrite"/>
		<property name="Active" type="b" access="read"/>
		<method name="Start"/>
		<method name="Stop"/>
		<signal name="LocationUpdated">
			<arg name="old" type="o"/>
			<arg name="new" type="o"/>
		</signal>
	</interface>
</node>`;
var GEOCLUE_LOCATION_INTERFACE = `
<node>
	<interface name="org.freedesktop.GeoClue2.Location">
		<property name="Latitude" type="d" access="read"/>
		<property name="Longitude" type="d" access="read"/>
		<property name="Accuracy" type="d" access="read"/>
		<property name="Altitude" type="d" access="read"/>
		<property name="Speed" type="d" access="read"/>
		<property name="Heading" type="d" access="read"/>
		<property name="Description" type="s" access="read"/>
		<property name="Timestamp" type="(tt)" access="read"/>
	</interface>
</node>`;

var debug = false;
