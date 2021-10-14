let now;
let timer;

// _ = helper functions
function _parseMillisecondsIntoReadableTime(timestamp) {
	//Get hours from milliseconds
	const date = new Date(timestamp * 1000);
	// Hours part from the timestamp
	const hours = '0' + date.getHours();
	// Minutes part from the timestamp
	const minutes = '0' + date.getMinutes();
	// Seconds part from the timestamp (gebruiken we nu niet)
	// const seconds = '0' + date.getSeconds();

	// Will display time in 10:30(:23) format
	return hours.substr(-2) + ':' + minutes.substr(-2); //  + ':' + s
}

// 5 TODO: maak updateSun functie

// 4 Zet de zon op de juiste plaats en zorg ervoor dat dit iedere minuut gebeurt.
let placeSunAndStartMoving = (sunriseTimestamp, sunsetTimestamp) => {
	let now = new Date();
	// now.setMinutes(now.getMinutes() + 1);
	let sunset = new Date(sunsetTimestamp * 1000);
	let sunrise = new Date(sunriseTimestamp * 1000);

	let diff = new Date(sunset.getTime() - now.getTime());
	let diffMinutes = Math.round(diff / 60000);

	let totalTime = new Date(sunset.getTime() - sunrise.getTime());
	let totalMinutes = Math.round(totalTime / 60000);
	let percentagePassed = 100 - (diffMinutes / totalMinutes) * 100;
	// let y = -0.04 * Math.pow(percentagePassed, 2) + 4 * percentagePassed - 2e-13;
	let y = Math.sqrt(Math.pow(50, 2) - Math.pow(percentagePassed - 50, 2)) * 2;
	let x = percentagePassed;
	console.log(totalMinutes, diffMinutes, percentagePassed, y);

	let sun = document.querySelector('.js-sun');
	sun.setAttribute('data-time', _parseMillisecondsIntoReadableTime(now / 1000));

	sun.style.bottom = `${y}%`;
	sun.style.left = `${x}%`;

	if (percentagePassed < 0 || percentagePassed > 100) {
		document.documentElement.classList.remove('is-day');
		document.documentElement.classList.add('is-night');
		document.querySelector('.js-time-left').innerHTML = 0;
		if (percentagePassed > 100) {
			sun.style.opacity = '0';
			clearInterval(timer);
		}
	} else {
		document.documentElement.classList.add('is-day');
		document.documentElement.classList.remove('is-night');
		document.querySelector('.js-time-left').innerHTML = `${diffMinutes} minutes`;
	}
};

// 3 Met de data van de API kunnen we de app opvullen
let showResult = queryResponse => {
	console.log(queryResponse);
	document.querySelector('.js-location').innerHTML = `${queryResponse.city.name}, ${queryResponse.city.country}`;
	document.querySelector('.js-sunrise').innerHTML = _parseMillisecondsIntoReadableTime(queryResponse.city.sunrise);
	document.querySelector('.js-sunset').innerHTML = _parseMillisecondsIntoReadableTime(queryResponse.city.sunset);

	now = new Date(queryResponse.city.sunrise * 1000);
	placeSunAndStartMoving(queryResponse.city.sunrise, queryResponse.city.sunset);
	timer = setInterval(() => placeSunAndStartMoving(queryResponse.city.sunrise, queryResponse.city.sunset), 60000); //60 * 1000
	document.documentElement.classList.add('is-loaded');
};

// 2 Aan de hand van een longitude en latitude gaan we de yahoo wheater API ophalen.
let getAPI = (lat, lon) => {
	const appid = '58427ceadbfa90145c913f8e33534e82';
	const url = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${appid}&units=metric&lang=nl&cnt=1`;
	// Eerst bouwen we onze url op
	// Met de fetch API proberen we de data op te halen.
	// Als dat gelukt is, gaan we naar onze showResult functie.
	fetch(url)
		.then(req => {
			if (!req.ok) {
				console.error('Error with fetch');
			} else {
				return req.json();
			}
		})
		.then(json => {
			showResult(json);
		});
};

document.addEventListener('DOMContentLoaded', function() {
	// 1 We will query the API with longitude and latitude.
	getAPI(50.879957, 3.297856);
});
