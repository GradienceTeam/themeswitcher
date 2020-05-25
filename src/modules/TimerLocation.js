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

const { Gio, GLib } = imports.gi;
const { extensionUtils } = imports.misc;
const Signals = imports.signals;

const Me = extensionUtils.getCurrentExtension();

const e = Me.imports.extension;
const { log_debug } = Me.imports.utils;


// GeoClue2 interfaces from https://gitlab.freedesktop.org/geoclue/geoclue/
const GEOCLUE_MANAGER_INTERFACE = `
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

const GEOCLUE_CLIENT_INTERFACE = `
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

const GEOCLUE_LOCATION_INTERFACE = `
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


/**
 * The Location Timer uses Location Services to get the current sunrise and
 * sunset times.
 *
 * It gets the current user's location with the GeoClue2 DBus proxy and
 * calculate the times.
 *
 * It will recalculate every hour and when the user's location changed to stay
 * up to date.
 *
 * Every second, it will check if the time has changed and signal if that's the
 * case.
 */
var TimerLocation = class {

	constructor() {
		this._previously_daytime = null;
		// Before we have the location suntimes, we'll use the manual schedule
		// times
		this._suntimes = new Map([
			['sunrise', e.settingsManager.schedule_sunrise],
			['sunset', e.settingsManager.schedule_sunrise]
		]);
	}

	enable() {
		log_debug('Enabling Location Timer...');
		this._connect_to_geoclue_dbus_proxy();
		this._listen_to_location_updates();
		this._connect_to_geoclue_location_dbus_proxy();
		this._update_location();
		this._update_suntimes();
		this._watch_for_time_change();
		this._regularly_update_suntimes();
		log_debug('Location Timer enabled.');
	}

	disable() {
		log_debug('Disabling Location Timer...');
		this._stop_regularly_updating_suntimes();
		this._stop_watching_for_time_change();
		this._stop_listening_to_location_updates();
		this._disconnect_from_geoclue_location_dbus_proxy();
		this._disconnect_from_geoclue_dbus_proxy();
		log_debug('Location Timer disabled.');
	}


	get time() {
		return this._is_daytime() ? 'day' : 'night';
	}

	_connect_to_geoclue_dbus_proxy() {
		log_debug('Connecting to GeoClue manager DBus proxy...');
		const GeoClueManagerProxy = Gio.DBusProxy.makeProxyWrapper(GEOCLUE_MANAGER_INTERFACE);
		this._geoclue_manager_dbus_proxy = new GeoClueManagerProxy(
			Gio.DBus.system,
			'org.freedesktop.GeoClue2',
			'/org/freedesktop/GeoClue2/Manager'
		);
		log_debug('Connected to GeoClue manager DBus proxy.');

		log_debug('Getting a GeoClue client...');
		this._geoclue_client = this._geoclue_manager_dbus_proxy.GetClientSync()[0];
		log_debug(`Got a GeoClue client at ${this._geoclue_client}`);

		log_debug('Connecting to GeoClue client DBus proxy...');
		const GeoClueClientProxy = Gio.DBusProxy.makeProxyWrapper(GEOCLUE_CLIENT_INTERFACE);
		this._geoclue_client_dbus_proxy = new GeoClueClientProxy(
			Gio.DBus.system,
			'org.freedesktop.GeoClue2',
			this._geoclue_client
		);
		this._geoclue_client_dbus_proxy.DesktopId = Me.metadata.uuid;
		this._geoclue_client_dbus_proxy.DistanceThreshold = 10000;
		this._geoclue_client_dbus_proxy.RequestedAccuracyLevel = 4;
		log_debug('Connected to GeoClue client DBus proxy.');
	}

	_disconnect_from_geoclue_dbus_proxy() {
		log_debug('Disconnecting from GeoClue DBus proxy...')
		this._geoclue_manager_dbus_proxy.DeleteClientSync(this._geoclue_client);
		this._geoclue_client = null;
		this._geoclue_client_dbus_proxy = null;
		this._geoclue_manager_dbus_proxy = null;
		log_debug('Disconnected from GeoClue DBus proxy.')
	}

	_listen_to_location_updates() {
		log_debug('Listening to location updates...');
		this._location_updates_connect = this._geoclue_client_dbus_proxy.connectSignal('LocationUpdated', this._on_location_updated.bind(this));
		this._geoclue_client_dbus_proxy.StartSync();
	}

	_stop_listening_to_location_updates() {
		this._geoclue_client_dbus_proxy.disconnectSignal(this._location_updates_connect);
		this._location_updates_connect = null;
		this._geoclue_client_dbus_proxy.StopSync();
		log_debug('Stopped listening to location updates.');
	}

	_on_location_updated(proxy, sender, [old_location_path, new_location_path]) {
		log_debug('Location has changed.');
		this._connect_to_geoclue_location_dbus_proxy(new_location_path);
		this._update_location();
		this._update_suntimes();
	}

	_connect_to_geoclue_location_dbus_proxy(path) {
		if ( !path ) {
			path = this._geoclue_client_dbus_proxy.Location;
		}
		if ( path !== '/' ) {
			log_debug('Connecting to GeoClue location DBus proxy...');
			const GeoClueLocationProxy = Gio.DBusProxy.makeProxyWrapper(GEOCLUE_LOCATION_INTERFACE);
			this._geoclue_location_dbus_proxy = new GeoClueLocationProxy(
				Gio.DBus.system,
				'org.freedesktop.GeoClue2',
				path
			);
			log_debug('Connected to GeoClue location DBus proxy.');
		}
	}

	_disconnect_from_geoclue_location_dbus_proxy() {
		log_debug('Disconnecting from GeoClue location DBus proxy...');
		this._geoclue_location_dbus_proxy = null;
		log_debug('Disconnected from GeoClue location DBus proxy.');
	}

	_update_location() {
		if ( this._geoclue_location_dbus_proxy ) {
			log_debug('Updating location...');
			const latitude = this._geoclue_location_dbus_proxy.Latitude;
			const longitude = this._geoclue_location_dbus_proxy.Longitude;

			this.location = new Map([
				['latitude', latitude],
				['longitude', longitude]
			]);
			log_debug(`Current location: (${latitude};${longitude})`);
		}
	}

	_update_suntimes() {
		if ( !this.location ) {
			return;
		}

		log_debug('Updating sun times...');

		Math.rad = degrees => degrees * Math.PI / 180;
		Math.deg = radians => radians * 180 / Math.PI;

		// Calculations from https://www.esrl.noaa.gov/gmd/grad/solcalc/calcdetails.html
		const latitude = this.location.get('latitude');
		const longitude = this.location.get('longitude');

		const dt_now = GLib.DateTime.new_now_local();
		const dt_zero = GLib.DateTime.new_utc(1900, 1, 1, 0, 0, 0);

		const time_span = dt_now.difference(dt_zero);

		const date = time_span / 1000 / 1000 / 60 / 60 / 24 + 2;
		const tz_offset = dt_now.get_utc_offset() / 1000 / 1000 / 60 / 60;
		const time_past_local_midnight = 0;

		const julian_day = date + 2415018.5 + time_past_local_midnight - tz_offset / 24;
		const julian_century = (julian_day - 2451545) / 36525;
		const geom_mean_long_sun = (280.46646 + julian_century * (36000.76983 + julian_century * 0.0003032)) % 360;
		const geom_mean_anom_sun = 357.52911 + julian_century * (35999.05029 - 0.0001537 * julian_century);
		const eccent_earth_orbit = 0.016708634 - julian_century * (0.000042037 + 0.0000001267 * julian_century);
		const sun_eq_of_ctr = Math.sin(Math.rad(geom_mean_anom_sun)) * (1.914602 - julian_century * (0.004817 + 0.000014 * julian_century)) + Math.sin(Math.rad(2 * geom_mean_anom_sun)) * (0.019993 - 0.000101 * julian_century) + Math.sin(Math.rad(3 * geom_mean_anom_sun)) * 0.000289;
		const sun_true_long = geom_mean_long_sun + sun_eq_of_ctr;
		const sun_app_long = sun_true_long - 0.00569 - 0.00478 * Math.sin(Math.rad(125.04 - 1934.136 * julian_century));
		const mean_obliq_ecliptic = 23 + (26 + ((21.448 - julian_century * (46.815 + julian_century * (0.00059 - julian_century * 0.001813)))) / 60) / 60;
		const obliq_corr = mean_obliq_ecliptic + 0.00256 * Math.cos(Math.rad(125.04 - 1934.136 * julian_century));
		const sun_declin = Math.deg(Math.asin(Math.sin(Math.rad(obliq_corr)) * Math.sin(Math.rad(sun_app_long))));
		const var_y = Math.tan(Math.rad(obliq_corr / 2)) * Math.tan(Math.rad(obliq_corr / 2));
		const eq_of_time = 4 * Math.deg(var_y * Math.sin(2 * Math.rad(geom_mean_long_sun)) - 2 * eccent_earth_orbit * Math.sin(Math.rad(geom_mean_anom_sun)) + 4 * eccent_earth_orbit * var_y * Math.sin(Math.rad(geom_mean_anom_sun)) * Math.cos(2 * Math.rad(geom_mean_long_sun)) - 0.5 * var_y * var_y * Math.sin(4 * Math.rad(geom_mean_long_sun)) - 1.25 * eccent_earth_orbit * eccent_earth_orbit * Math.sin(2 * Math.rad(geom_mean_anom_sun)));
		const ha_sunrise = Math.deg(Math.acos(Math.cos(Math.rad(90.833)) / (Math.cos(Math.rad(latitude)) * Math.cos(Math.rad(sun_declin))) - Math.tan(Math.rad(latitude)) * Math.tan(Math.rad(sun_declin))));
		const solar_noon = (720 - 4 * longitude - eq_of_time + tz_offset * 60) / 1440;

		const sunrise_time = solar_noon - ha_sunrise * 4 / 1440;
		const sunset_time = solar_noon + ha_sunrise * 4 / 1440;

		const sunrise = sunrise_time * 24;
		const sunset = sunset_time * 24;

		this._suntimes.set('sunrise', sunrise);
		this._suntimes.set('sunset', sunset);
		log_debug(`New sun times: (sunrise: ${sunrise}; sunset: ${sunset})`);
	}

	_regularly_update_suntimes() {
		log_debug('Regularly updating sun times...');
		this._regularly_update_suntimes_timer = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 3600, () => {
			this._update_suntimes();
			return true; // Repeat the loop
		});
	}

	_stop_regularly_updating_suntimes() {
		GLib.Source.remove(this._regularly_update_suntimes_timer);
		this._regularly_update_suntimes_timer = null;
		log_debug('Stopped regularly updating sun times.');
	}

	_is_daytime() {
		const time = GLib.DateTime.new_now_local();
		const hour = time.get_hour() + time.get_minute() / 60 + time.get_second() / 3600;
		return ( hour >= this._suntimes.get('sunrise') && hour <= this._suntimes.get('sunset') );
	}

	_watch_for_time_change() {
		log_debug('Watching for time change...');
		this._time_change_timer = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 1, () => {
			if ( !Me.imports.extension.enabled ) {
				// The extension doesn't exist anymore, quit the loop
				return false;
			}
			if ( this._previously_daytime !== this._is_daytime() ) {
				this._previously_daytime = this._is_daytime();
				this.emit('time-changed', this.time);
			}
			return true; // Repeat the loop
		});
	}

	_stop_watching_for_time_change() {
		GLib.Source.remove(this._time_change_timer);
		log_debug('Stopped watching for time change.');
	}

}
Signals.addSignalMethods(TimerLocation.prototype);
