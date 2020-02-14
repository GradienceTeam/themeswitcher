var Variants = class {

	static guess_from(name) {
		const variants = {};
		variants.original = name;

		if ( name.includes('HighContrast') ) {
			variants.day = 'HighContrast';
			variants.night = 'HighContrastInverse';
		}
		else if ( name.match(/(Canta|Materia).*-compact/g) ) {
			variants.day = name.replace(/-dark(?!er)/g, '');
			variants.night = variants.day.replace(/(-light)?-compact/g, '-dark-compact');
		}
		else if ( name.includes('Adapta') ) {
			variants.day = name.replace('-Nokto', '');
			variants.night = variants.day.replace('Adapta', 'Adapta-Nokto');
		}
		else if ( name.includes('Arc') ) {
			variants.day = name.replace(/-Dark(?!er)/g, '');
			variants.night = variants.day.replace(/Arc(-Darker)?/g, 'Arc-Dark');
		}
		else if ( name.includes('Flat-Remix-GTK') ) {
			const isSolid = name.includes('-Solid');
			const withoutBorder = name.includes('-NoBorder');
			const basename = name.split('-').slice(0, 4).join('-');
			variants.day = basename + (name.includes('-Darker') ? '-Darker' : '') + (isSolid ? '-Solid' : '');
			variants.night = basename + (name.includes('-Darkest') ? '-Darkest' : '-Dark') + (isSolid ? '-Solid' : '') + (withoutBorder ? '-NoBorder' : '');
		}
		else if ( name.includes('Layan') ) {
			variants.day = name.replace('-dark', '');
			variants.night = variants.day.replace(/Layan(-light)?/g, 'Layan-dark');
		}
		else if ( name.includes('Matcha') ) {
			variants.day = name.replace(/-dark-/g, '-');
			variants.night = variants.day.replace('Matcha-', 'Matcha-dark-');
		}
		else if ( name.includes('Mojave') ) {
			variants.day = name.replace('-dark', '-light');
			variants.night = variants.day.replace('-light', '-dark');
		}
		else if ( name.includes('vimix') ) {
			variants.day = name.replace('-dark', '');
			variants.night = variants.day.replace(/vimix(-light)?/g, 'vimix-dark');
		}
		else {
			variants.day = name.replace(/-dark(?!er)/g, '');
			variants.night = variants.day.replace(/(-light)?(-darker)?/g, '') + '-dark';
		}

		return variants;
	}

}
