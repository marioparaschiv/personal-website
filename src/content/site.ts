const site = {
	name: 'Mario Paraschiv',
	subtext: 'The details matter. I handle them.',
	location: 'London, United Kingdom',
	booking: {
		username: 'marioparaschiv',
		events: [
			{ slug: '15min', minutes: 15 },
			{ slug: '30min', minutes: 30 },
		],
		defaultMinutes: 30,
		location: 'Google Meet',
	},
	links: {
		email: {
			text: 'contact@marioparaschiv.com',
			href: 'mailto:contact@marioparaschiv.com',
		},
		github: {
			text: 'marioparaschiv',
			href: 'https://github.com/marioparaschiv',
		},
		twitter: {
			text: 'marioparaschiv',
			href: 'https://twitter.com/marioparaschiv',
		},
	},
};

export { site };
