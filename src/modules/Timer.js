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

const MainLoop = imports.mainloop;
const { Gio, GLib } = imports.gi;
const { extensionUtils, fileUtils } = imports.misc;
const { main } = imports.ui;

const Me = extensionUtils.getCurrentExtension();
const config = Me.imports.config;

const { log_debug } = Me.imports.utils;

const Gettext = imports.gettext.domain(Me.metadata.uuid);
const _ = Gettext.gettext;


/*
The Timer checks for changes in the time of day and reports them.

I can either use Night Light or Location Services as a source.

As Night Light or Location Services are essential for the extension to work,
it continuously checks if one of them is enabled and warns the user if that's
not the case. To not overwhelm the user with notifications, it only warns once
and then only listens to Night Light or Location Services changes to reactivate
itself automatically.
*/

var Timer = class {

	constructor() {
		log_debug('Initializing Timer...');
		this.settings = extensionUtils.getSettings();
		this.nightlight_gsettings = new Gio.Settings({ schema: config.NIGHTLIGHT_GSETTINGS_SCHEMA });
		this.location_gsettings = new Gio.Settings({ schema: config.LOCATION_GSETTINGS_SCHEMA });
		log_debug('Nightlighter initialized.');
	}

	enable() {
		log_debug('Enabling Timer...');
		try {
			this.ready = false;
			this.settings.set_string('time-source', this._get_source());
			this._listen_to_nightlight_status();
			this._listen_to_location_status();
			this._listen_to_force_manual_status();
			switch (this.settings.get_string('time-source')) {
				case 'nightlight':
					log_debug('Using Night Light as a source.');
					this._connect_to_color_dbus_proxy();
					this._listen_to_nightlight_changes();
					break;
				case 'location':
					log_debug('Using Location Services as a source.');
					this._connect_to_geoclue_dbus_proxy();
					this._listen_to_location_changes();
					this._connect_to_geoclue_location_dbus_proxy();
					this._update_location();
					this._update_location_suntimes();
					this._watch_for_location_time_change();
					this._regularly_update_location_suntimes();
					break;
				case 'manual':
					log_debug('Using manual schedule as a source.');
					this._watch_for_location_time_change();
			}
			this.ready = true;
			this.emit();
			log_debug('Timer enabled.');
		}
		catch(e) {
			if ( e.message ) {
				main.notifyError(Me.metadata.name, e.message);
			}
		}
	}

	disable() {
		log_debug('Disabling Timer...');
		this._stop_listening_to_nightlight_status();
		this._stop_listening_to_location_status();
		this._stop_listening_to_force_manual_status();
		switch (this.settings.get_string('time-source')) {
			case 'nightlight':
				this._stop_listening_to_nightlight_changes();
				this._disconnect_from_color_dbus_proxy();
				break;
			case 'location':
				this._stop_regularly_updating_location_suntimes();
				this._stop_watching_for_location_time_change();
				this._stop_listening_to_location_changes();
				this._disconnect_from_geoclue_location_dbus_proxy();
				this._disconnect_from_geoclue_dbus_proxy();
				break;
		}
		log_debug('Timer disabled.');
	}

	get current() {
		if ( this.ready ) {
			switch (this.settings.get_string('time-source')) {
				case 'nightlight':
					return this._is_nightlight_active() ? 'night' : 'day';
				case 'location':
				case 'manual':
					return this._is_location_daytime() ? 'day' : 'night';
			}
		}
		else {
			return 'day';
		}
	}

	subscribe(callback) {
		this.time_change_callback = callback;
	}

	emit() {
		if ( this.time_change_callback ) {
			this.time_change_callback();
		}
	}

	_get_source() {
		if ( this._is_force_manual_enabled() ) {
			return 'manual';
		}
		else if ( this._is_nightlight_enabled() ) {
			return 'nightlight';
		}
		else if ( this._is_location_enabled() ) {
			return 'location';
		}
		else {
			return 'manual';
		}
	}


	/*
	Check if Night Light is enabled and restart the Timer on changes.
	*/

	_is_nightlight_enabled() {
		return this.nightlight_gsettings.get_boolean(config.NIGHTLIGHT_GSETTINGS_PROPERTY);
	}

	_listen_to_nightlight_status() {
		if ( !this.nightlight_status_connect ) {
			this.nightlight_status_connect = this.nightlight_gsettings.connect(
				'changed::' + config.NIGHTLIGHT_GSETTINGS_PROPERTY,
				this._on_nightlight_status_changed.bind(this)
			);
			log_debug('Listening to Night Light status changes...');
		}
	}

	_stop_listening_to_nightlight_status() {
		if ( this.nightlight_gsettings && this.nightlight_status_connect ) {
			this.nightlight_gsettings.disconnect(this.nightlight_status_connect);
			this.nightlight_status_connect = null;
			log_debug('Stopped listening to Night Light status changes.');
		}
	}

	_on_nightlight_status_changed() {
		log_debug('Night Light status has changed.');
		this.enable();
	}


	/*
	Check if Location Services are enabled and restart the Timer on changes.
	*/

	_is_location_enabled() {
		return this.location_gsettings.get_boolean(config.LOCATION_GSETTINGS_PROPERTY);
	}

	_listen_to_location_status() {
		if ( !this.location_status_connect ) {
			this.location_status_connect = this.location_gsettings.connect(
				'changed::' + config.LOCATION_GSETTINGS_PROPERTY,
				this._on_location_status_changed.bind(this)
			);
			log_debug('Listening to Location Services status changes...');
		}
	}

	_stop_listening_to_location_status() {
		if ( this.location_gsettings && this.location_status_connect ) {
			this.location_gsettings.disconnect(this.location_status_connect);
			this.location_status_connect = null;
			log_debug('Stopped listening to Location Services status changes.');
		}
	}

	_on_location_status_changed() {
		log_debug('Location Services status has changed.');
		this.enable();
	}

	/*
	Check if the user wants to force a manual schedule and restart the Timer on
	changes.
	*/

	_is_force_manual_enabled() {
		return this.settings.get_boolean('time-force-manual');
	}

	_listen_to_force_manual_status() {
		if ( !this.force_manual_status_connect ) {
			this.force_manual_status_connect = this.settings.connect(
				'changed::time-force-manual',
				this._on_force_manual_status_changed.bind(this)
			);
			log_debug('Listening to manual schedule status changes...');
		}
	}

	_stop_listening_to_force_manual_status() {
		if ( this.settings && this.force_manual_status_connect ) {
			this.settings.disconnect(this.force_manual_status_connect);
			this.force_manual_status_connect = null;
			log_debug('Stopped listening to manual schedule status changes.');
		}
	}

	_on_force_manual_status_changed() {
		log_debug('Manual schedule status has changed.');
		this.enable();
	}


	/*
	Use Night Light as a time source.
	*/

	_connect_to_color_dbus_proxy() {
		try {
			log_debug('Connecting to Color DBus proxy...');
			const color_interface = fileUtils.loadInterfaceXML('org.gnome.SettingsDaemon.Color');
			const ColorProxy = Gio.DBusProxy.makeProxyWrapper(color_interface);
			this.color_dbus_proxy = new ColorProxy(
				Gio.DBus.session,
				'org.gnome.SettingsDaemon.Color',
				'/org/gnome/SettingsDaemon/Color'
			);
			log_debug('Connected to Color DBus proxy.');
		}
		catch(e) {
			const message = _('Unable to connect to Color DBus proxy.');
			throw new Error(message);
		}
	}

	_disconnect_from_color_dbus_proxy() {
		if ( this.color_dbus_proxy ) {
			log_debug('Disconnecting from Color DBus Proxy...');
			this.color_dbus_proxy = null;
			log_debug('Disconnected from Color DBus Proxy.');
		}
	}

	_listen_to_nightlight_changes() {
		if ( !this.nightlight_changes_connect ) {
			this.nightlight_changes_connect = this.color_dbus_proxy.connect(
				'g-properties-changed',
				this._on_nightlight_changed.bind(this)
			);
			log_debug('Listening to Night Light changes...');
		}
	}

	_stop_listening_to_nightlight_changes() {
		if ( this.color_dbus_proxy && this.nightlight_changes_connect ) {
			this.color_dbus_proxy.disconnect(this.nightlight_changes_connect);
			this.nightlight_changes_connect = null;
			log_debug('Stopped listening to Night Light changes.');
		}
	}

	_on_nightlight_changed(sender, dbus_properties) {
		const properties = dbus_properties.deep_unpack();
		if ( properties.NightLightActive ) {
			log_debug('Night Light has become ' + (properties.NightLightActive.unpack() ? '' : 'in') + 'active.');
			this.emit();
		}
	}

	_is_nightlight_active() {
		if ( this.color_dbus_proxy ) {
			return this.color_dbus_proxy.NightLightActive;
		}
	}


	/*
	Use location as a time source.
	*/

	_connect_to_geoclue_dbus_proxy() {
		try {
			log_debug('Connecting to GeoClue Manager DBus proxy...');
			const GeoClueManagerProxy = Gio.DBusProxy.makeProxyWrapper(config.GEOCLUE_MANAGER_INTERFACE);
			this.geoclue_manager_dbus_proxy = new GeoClueManagerProxy(
				Gio.DBus.system,
				'org.freedesktop.GeoClue2',
				'/org/freedesktop/GeoClue2/Manager'
			);
			log_debug('Connected to GeoClue Manager DBus proxy.');
		}
		catch(e) {
			const message = _('Unable to connect to GeoClue Manager DBus proxy.');
			throw new Error(message);
		}

		try {
			log_debug('Requesting new GeoClue Client...');
			this.geoclue_client = this.geoclue_manager_dbus_proxy.GetClientSync()[0];
			log_debug(`Got a GeoClue Client at ${this.geoclue_client}`);
		}
		catch(e) {
			const message = _('Unable to get a GeoClue Client.');
			throw new Error(message);
		}

		try {
			log_debug('Connecting to GeoClue Client DBus proxy...');
			const GeoClueClientProxy = Gio.DBusProxy.makeProxyWrapper(config.GEOCLUE_CLIENT_INTERFACE);
			this.geoclue_client_dbus_proxy = new GeoClueClientProxy(
				Gio.DBus.system,
				'org.freedesktop.GeoClue2',
				this.geoclue_client
			);
			this.geoclue_client_dbus_proxy.DesktopId = Me.metadata.uuid;
			this.geoclue_client_dbus_proxy.DistanceThreshold = 10000;
			this.geoclue_client_dbus_proxy.RequestedAccuracyLevel = 4;
			log_debug('Connected to GeoClue Client DBus proxy.');
		}
		catch(e) {
			const message = _('Unable to connect to GeoClue Client DBus proxy.');
			throw new Error(message);
		}
	}

	_disconnect_from_geoclue_dbus_proxy() {
		if ( this.geoclue_client_dbus_proxy ) {
			log_debug('Disconnecting from GeoClue Client DBus proxy...');
			if ( this.geoclue_manager_dbus_proxy && this.geoclue_client ) {
				this.geoclue_manager_dbus_proxy.DeleteClientSync(this.geoclue_client);
				this.geoclue_client = null;
			}
			this.geoclue_client_dbus_proxy = null;
			log_debug('Disconnected from GeoClue Client DBus Proxy.');
		}

		if ( this.geoclue_manager_dbus_proxy ) {
			log_debug('Disconnecting from GeoClue Manager DBus proxy...');
			this.geoclue_manager_dbus_proxy = null;
			log_debug('Disconnected from GeoClue Manager DBus proxy.');
		}
	}

	_listen_to_location_changes() {
		if ( !this.location_changes_connect ) {
			this.location_changes_connect = this.geoclue_client_dbus_proxy.connectSignal('LocationUpdated', this._on_location_changed.bind(this));
			this.geoclue_client_dbus_proxy.StartSync();
			log_debug('Listening to location changes...');
		}
	}

	_stop_listening_to_location_changes() {
		if ( this.geoclue_client_dbus_proxy && this.location_changes_connect ) {
			this.geoclue_client_dbus_proxy.disconnectSignal(this.location_changes_connect);
			this.location_changes_connect = null;
			this.geoclue_client_dbus_proxy.StopSync();
			log_debug('Stopped listening to location changes.');
		}
	}

	_on_location_changed(proxy, sender, [old_location_path, new_location_path]) {
		log_debug('Location has changed.');
		this._connect_to_geoclue_location_dbus_proxy(new_location_path);
		this._update_location();
		this._update_location_suntimes();
	}

	_connect_to_geoclue_location_dbus_proxy(path) {
		if ( !path && this.geoclue_client_dbus_proxy ) {
			path = this.geoclue_client_dbus_proxy.Location;
		}
		if ( path !== '/' ) {
			try {
				log_debug('Connecting to GeoClue Location DBus proxy...');
				const GeoClueLocationProxy = Gio.DBusProxy.makeProxyWrapper(config.GEOCLUE_LOCATION_INTERFACE);
				this.geoclue_location_dbus_proxy = new GeoClueLocationProxy(
					Gio.DBus.system,
					'org.freedesktop.GeoClue2',
					path
				);
				log_debug('Connected to GeoClue Location DBus proxy.');
			}
			catch(e) {
				const message = _('Unable to connect to GeoClue Location DBus proxy.');
				throw new Error(message);
			}
		}
	}

	_disconnect_from_geoclue_location_dbus_proxy() {
		if ( this.geoclue_location_dbus_proxy ) {
			log_debug('Disconnecting from GeoClue Location DBus proxy...');
			this.geoclue_location_dbus_proxy = null;
			log_debug('Disconnected from GeoClue Location DBus proxy.')
		}
	}

	_update_location() {
		if ( this.geoclue_location_dbus_proxy ) {
			try {
				log_debug('Updating location...');
				const latitude = this.geoclue_location_dbus_proxy.Latitude;
				const longitude = this.geoclue_location_dbus_proxy.Longitude;

				this.location = new Map([
					['latitude', latitude],
					['longitude', longitude]
				]);
				log_debug(`Current location: (${latitude};${longitude})`);
			}
			catch(e) {
				const message = _('Unable to get current location.');
				throw new Error(message);
			}
		}
	}

	_update_location_suntimes() {
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

		this.settings.set_double('time-sunrise', sunrise);
		this.settings.set_double('time-sunset', sunset);
		log_debug(`New sun times: (sunrise: ${sunrise}; sunset: ${sunset})`);
	}

	_regularly_update_location_suntimes() {
		this.regularly_update_suntimes_timer = MainLoop.timeout_add_seconds(3600, () => {
			this._update_location_suntimes();
			return true; // Repeat the loop
		});
	}

	_stop_regularly_updating_location_suntimes() {
		if ( this.regularly_update_suntimes_timer ) {
			MainLoop.source_remove(this.regularly_update_suntimes_timer);
			this.regularly_update_suntimes_timer = null;
		}
	}

	_is_location_daytime() {
		const time = GLib.DateTime.new_now_local();
		const hour = time.get_hour() + time.get_minute() / 60 + time.get_second() / 3600;
		return ( hour >= this.settings.get_double('time-sunrise') && hour <= this.settings.get_double('time-sunset') );
	}

	_watch_for_location_time_change() {
		this.location_time_change_timer = MainLoop.timeout_add_seconds(1, () => {
			const previous_time = this.location_daytime;
			if ( previous_time !== this._is_location_daytime() ) {
				log_debug('Time of the day has changed.');
				this.location_daytime = this._is_location_daytime();
				this.emit();
			}
			return true; // Repeat the loop
		}, null);
	}

	_stop_watching_for_location_time_change() {
		if ( this.location_time_change_timer ) {
			MainLoop.source_remove(this.location_time_change_timer);
			this.location_time_change_timer = null;
		}
	}

}
