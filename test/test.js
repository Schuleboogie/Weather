describe('Weather app', function() {
	beforeEach(function() {
		browser.get('http://localhost:8080');
	});

	it('should display weather information or error from station when selected from list', function() {
		element(by.css('button.stations-button')).click().then(function() {
			var stationList = element.all(by.repeater('station in stations'));
			var selectedStation = stationList.get(0);
				selectedStation.getText().then(function(text) {
				selectedStationName = text.toLowerCase();
				selectedStation.click().then(function() {
					var stationName = element(by.css('h1.station-name'));
					element(by.css('div.error')).getText().then(function(errorText) {
						var EC = protractor.ExpectedConditions;
						if (errorText) {
							expect(errorText).toEqual("Engin gögn í boði");
						}
						else {
							stationName.getText().then(function(stationNameText) {
								stationNameText = stationNameText.toLowerCase();
								expect(stationNameText).toEqual(selectedStationName);
							});
						}
					});
				});
			});
		});
	});

	it('should not', function() {
		expect(true).toBe(true);
	});
});
