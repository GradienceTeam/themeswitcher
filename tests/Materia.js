const test = require('ava');
const { Variants } = require('./_variants');


['', '-compact'].forEach(size => {
	test(`Materia${size}`, t => {
		const variants = Variants.guess_from(`Materia${size}`);
		t.is(variants.day, `Materia${size}`);
		t.is(variants.night, `Materia-dark${size}`);
	});

	test(`Materia-dark${size}`, t => {
		const variants = Variants.guess_from(`Materia-dark${size}`);
		t.is(variants.day, `Materia${size}`);
		t.is(variants.night, `Materia-dark${size}`);
	});

	test(`Materia-light${size}`, t => {
		const variants = Variants.guess_from(`Materia-light${size}`);
		t.is(variants.day, `Materia-light${size}`);
		t.is(variants.night, `Materia-dark${size}`);
	});
})
