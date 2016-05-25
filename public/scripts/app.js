(function() {
	// Setup for icons and background
	const icons = {
		"Heiðskírt": ["wi-day-sunny", "wi-night-clear"],
		"Léttskýjað": ["wi-day-sunny-overcast", "wi-night-partly-cloudy"],
		"Skýjað": ["wi-day-cloudy", "wi-night-cloudy"],
		"Alskýjað": ["wi-cloudy"],
		"Lítils háttar rigning": ["wi-showers"],
		"Rigning": ["wi-rain", "wi-rain"],
		"Lítils háttar slydda": ["wi-rain-mix"],
		"Slydda": ["wi-rain-mix"],
		"Lítils háttar snjókoma": ["wi-snow"],
		"Snjókoma": ["wi-snow-wind"],
		"Skúrir": ["wi-day-showers", "wi-night-showers"],
		"Slydduél": ["wi-day-rain-mix", "wi-night-rain-mix"],
		"Snjóél": ["wi-day-snow", "wi-night-snow"],
		"Skýstrókar": ["wi-tornado"],
		"Hagl": ["wi-hail"],
		"Þoka": ["wi-fog"],
		"Lítils háttar súld": ["wi-sleet"],
		"Súld": ["wi-sleet"]
	};
	const directions = {
		"N": "wi-towards-n",
		"A": "wi-towards-e",
		"S": "wi-towards-s",
		"V": "wi-towards-w",
		"NNA": "wi-towards-nne",
		"ASA": "wi-towards-ese",
		"SSV": "wi-towards-ssw",
		"VNV": "wi-towards-wnw",
		"NA": "wi-towards-ne",
		"SA": "wi-towards-se",
		"SV": "wi-towards-sw",
		"NV": "wi-towards-nw",
		"ANA": "wi-towards-ene",
		"SSA": "wi-towards-sse",
		"VSV": "wi-towards-wsw",
		"NNV": "wi-towards-nnw"
	};
	const moonPhases = {
		"New Moon": "wi-moon-new",
		"Waxing Crescent": "wi-moon-waxing-crescent-5",
		"First Quarter": "wi-moon-first-quarter",
		"Waxing Gibbous": "wi-moon-waxing-gibbous-5",
		"Full Moon": "wi-moon-full",
		"Waning Gibbous": "wi-moon-waning-gibbous-5",
		"Last Quarter": "wi-moon-third-quarter",
		"Waning Crescent": "wi-moon-waning-crescent-1"
	};
	var iconizer = angular.module('iconizer', []);
	iconizer.value('icon', {
		weather: function(description, time) {
			if (!description || !icons[description]) return false;
			if (icons[description].length < 2) {
				return icons[description][0];
			}
			var dusk = false;
			var times = SunCalc.getTimes(time, lat, long);
			if (time >= times.dusk) {
				return icons[description][1];
			}
			else return icons[description][0];
		},
		wind: function(direction) {
			if(!direction || !directions[direction]) return false;
			else return "wi-wind " + directions[direction];
		},
		moon: function(time) {
			var times = SunCalc.getTimes(time, lat, long);
			if (time > times.dusk || isNaN(times.dusk.getTime())) {
				return false;
			}
			var moonIllum = SunCalc.getMoonIllumination(time);
			if (moonIllum.phase === 0.0) return moonPhases["New Moon"];
			else if (moonIllum.phase < 0.25) return moonPhases["Waxing Crescent"];
			else if (moonIllum.phase === 0.25) return moonPhases["First Quarter"];
			else if (moonIllum.phase < 0.5) return moonPhases["Waxing Gibbous"];
			else if (moonIllum.phase === 0.5) return moonPhases["Full Moon"];
			else if (moonIllum.phase < 0.75) return moonPhases["Waning Gibbous"];
			else if (moonIllum.phase === 0.75) return moonPhases["Last Quarter"];
			else if (moonIllum.phase <= 1.0) return moonPhases["Waning Crescent"];
		}
	});
	const backgrounds = {
		"Heiðskírt": "radial-gradient(circle farthest-side at 50% 25%, #FFFFFF, #6AC6F9 70%)",
		"Léttskýjað": "radial-gradient(circle farthest-side at 50% 25%, #E1F3FD, #6AC6F9)",
		"Skýjað": "#87D1FA",
		"Alskýjað": "#C0BFBA",
		"Lítils háttar rigning": "linear-gradient(0deg, #6AC6F9, #C0BFBA)",
		"Rigning": "linear-gradient(0deg, #A5DCFB, #549EC7)",
		"Lítils háttar slydda": "linear-gradient(0deg, #C3E8FC, #549EC7)",
		"Slydda": "linear-gradient(0deg, #C3E8FC, #549EC7)",
		"Lítils háttar snjókoma": "linear-gradient(0deg, #87D1FA, #FFFFFF)",
		"Snjókoma": "linear-gradient(0deg, #549EC7 5%, #FFFFFF)",
		"Skúrir": "linear-gradient(0deg, #6AC6F9, #C0BFBA)",
		"Slydduél": "linear-gradient(0deg, #87D1FA, #FFFFFF)",
		"Snjóél": "linear-gradient(0deg, #549EC7 5%, #6AC6F9 20%, #FFFFFF)",
		"Skýstrókar": "#B1B0A9",
		"Hagl": "linear-gradient(0deg, #549EC7 5%, #6AC6F9 20%, #FFFFFF)",
		"Þoka": "#C0BFBA",
		"Lítils háttar súld": "linear-gradient(0deg, #6AC6F9, #C0BFBA)",
		"Súld": "linear-gradient(0deg, #6AC6F9, #C0BFBA)",
		"Sky": "#6AC6F9"
	};
	var bgMaker = angular.module('bgMaker', []);
	bgMaker.value('background', {
		make: function(description) {
			if (!description || !backgrounds[description]) return backgrounds["Sky"];
			else return backgrounds[description];
		}
	});

	var weather = angular.module('weather', ['ngAnimate', 'LocalStorageModule', 'iconizer' , 'bgMaker']);
	weather.config(function (localStorageServiceProvider) {
		localStorageServiceProvider.setPrefix('weather');
	});
	const startingStation = "Reykjavík";
	const stationText = "Fleiri stöðvar";

	// Temperature
	const unitCelsius = "°C";
	const unitFahrenheit = "°F";

	// Position of Iceland for moon illumination calculations
	const lat = 65.0;
	const long = 18.0;

	// Controller for displaying weather info
	weather.controller('WeatherInfo', ["$scope", "$http", 'anchorman', 'stations', 'icon', 'background', function($scope, $http, anchorman, stations, icon, background) {
		moment.locale('is');
		$scope.celsius = true;
		$scope.unitCelsius = unitCelsius;
		$scope.unitFahrenheit = unitFahrenheit;
		$scope.unitC = $scope.unitCelsius;
		$scope.unitF = $scope.unitFahrenheit;

		stations(function(stations) {
			$scope.stations = stations;
		});
		$scope.currentStation = startingStation;
		$scope.moreButtonText = stationText;

		// Function to call to update the view when weather data has been fetched
		var callback = function(data) {
			$scope.weather = data;
			// Set icons and background
			$scope.weather.icon = icon.weather(data.Description, new Date());
			$scope.weather.wind = icon.wind(data.WindDirection);
			$scope.weather.moon = icon.moon(new Date());
			$scope.weather.background = {
				"background": background.make(data.Description)
			};
		};

		// Get the weather data for the starting station
		anchorman($scope.currentStation, callback);

		// Toggle station list
		$scope.toggleStations = function() {
			$scope.StationList=!$scope.StationList;
			if ($scope.StationList) $scope.moreButtonText = $scope.currentStation;
			else $scope.moreButtonText = stationText;
		};
		// Select station from list
		$scope.selectStation = function(station) {
			$scope.currentStation = station;
			$scope.StationList = !$scope.StationList;
			$scope.moreButtonText = stationText;
			anchorman(station, callback);
		};
		// Search filter
		$scope.search = function(station) {
			if (station === $scope.stationSearch || !$scope.stationSearch) return station;
			else return false;
		};
		// Filter the current station out of the list of stations
		$scope.current = function(input) {
			if (input === $scope.currentStation) return false;
			else return input;
		};
		// Remove focus from button after being clicked
		$scope.blurButton = function($event) {
			$event.currentTarget.blur();
		};
	}]);
	// Service for returning list of supported stations
	weather.factory('stations', ['$http', function($http) {
		return function(cb) {
			$http({
				method: 'GET',
				url: '/stations'
			}).then(function success(response) {
				var stations = response["data"];
				cb(stations);
			}, function error(response) {
				var stations = {};
				stations.Error = "Engar stöðvar í boði";
				cb(stations);
			});
		};
	}]);
	// Service for retrieving weather from server REST service
	weather.factory('anchorman', ['$http', 'localStorageService', function($http, localStorageService) {
		return function(station, cb) {
			var oldData = true;
			if (localStorageService.isSupported) {
				// Check if valid results are present, i.e. less than 3 hours old
				var results = localStorageService.get(station);
				if (results) {
					var currentTime = moment(new Date());
					currentTime.subtract(3, 'hours');
					if (currentTime.isBefore(moment(results.TimeDate))) {
						oldData = false;
						cb(results);
					}
				}
			}
			// Make HTTP call if data is not valid or local storage not supported
			if (oldData) {
				$http({
					method: 'GET',
					url: '/rest',
					params: {
						"station": station
					}
				}).then(function success(response) {
					var weather = response["data"];
					weather.TimeDate = weather.Time;
					weather.Time = moment(weather.Time).format('LLL');
					// Conversion to fahrenheit
					weather.TemperatureFahrenheit = (((weather.Temperature*9)/5)+32).toFixed(0);
					// Save in local storage
					if (localStorageService.isSupported && !weather.Error) {
						localStorageService.set(weather.StationName, weather);
					}
					cb(weather);
				}, function error(response) {
					var weather = {};
					weather.Error = "Engin gögn í boði";
					cb(weather);
				});
			}
		};
	}]);
})();
