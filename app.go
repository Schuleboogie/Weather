package main

import (
	"net/http"
	"io/ioutil"
	"errors"
	"log"
	"encoding/json"
)

type WeatherInfo struct {
	Error string
	StationName string
	Time string
	WindSpeed string
	WindDirection string
	TopWindSpeed string
	TopWindGust string
	Temperature string
	Description string
	Visibility string
	CloudCover string
	AirPressure string
	Humidity string
	Precipitation string
}
var StationNumbers = map[string]string {
	"Reykjavík": "1",
	"Akureyri": "422",
	"Keflavíkurflugvöllur": "990",
	"Bláfjöll": "1486",
	"Akrafjall": "31572",
	"Reykjavíkurflugvöllur": "1477",
	"Siglufjörður": "3752",
	"Skaftafell": "6499",
	"Flatey á Skjálfanda": "3779",
	"Grímsey": "3976",
	"Hellisheiði": "31392",
	"Höfn í Hornafirði": "705",
	"Súðavík": "2646",
	"Egilsstaðaflugvöllur": "571",
}
var restUrl = "http://apis.is/weather/observations/is"

// Get the latest weather information
func getWeather(Station string) (*WeatherInfo, error) {
	// Make request
	req, err := http.NewRequest("GET", restUrl, nil)
	q := req.URL.Query()
	q.Add("stations", StationNumbers[Station]) // Station Reykjavík
	q.Add("time", "3h") // Fetch data from stations updated every three hours
	q.Add("anytime", "0") // Fetch last available data
	req.URL.RawQuery = q.Encode()

	// Send request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, errors.New("Error sending request to APIS.is")
	}
	defer resp.Body.Close()

	// Read from request
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, errors.New("Error reading request from APIS.is")
	}

	// Decode JSON
	var bodyJson map[string]interface{}
	if err = json.Unmarshal(body, &bodyJson); err != nil {
		return nil, errors.New("Error decoding response from APIS.is")
	}
	results := bodyJson["results"].([]interface{})
	weatherList := results[0].(map[string]interface{})
	weather := &WeatherInfo{
		Error: weatherList["err"].(string),
		StationName: weatherList["name"].(string),
		Time: weatherList["time"].(string),
		WindSpeed: weatherList["F"].(string),
		WindDirection: weatherList["D"].(string),
		TopWindSpeed: weatherList["FX"].(string),
		TopWindGust: weatherList["FG"].(string),
		Temperature: weatherList["T"].(string),
		Description: weatherList["W"].(string),
		Visibility: weatherList["V"].(string),
		CloudCover: weatherList["N"].(string),
		AirPressure: weatherList["P"].(string),
		Humidity: weatherList["RH"].(string),
		Precipitation: weatherList["R"].(string),
	}

	return weather, nil
}

// Returns a list of supported stations
func stationListHandler(w http.ResponseWriter, r *http.Request) {
	stations := make([]string, 0)
	for key, _ := range StationNumbers {
		stations = append(stations, key)
	}
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(stations); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

// Returns the weather as JSON
func weatherHandler(w http.ResponseWriter, r *http.Request) {
	params := r.URL.Query();
	Station := params.Get("station")
	if Station != "" {
		weather, err := getWeather(Station)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		} else {
			w.Header().Set("Content-Type", "application/json; charset=UTF-8")
			w.WriteHeader(http.StatusOK)
			if err := json.NewEncoder(w).Encode(weather); err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
			}
		}
	} else {
		http.Error(w, "Missing station name", http.StatusBadRequest)
	}
}

func indexHandler(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "index.html")
}

func main() {
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("public"))))
	http.HandleFunc("/stations", stationListHandler)
	http.HandleFunc("/rest", weatherHandler)
	http.HandleFunc("/", indexHandler)

	log.Println("Server running...")
	http.ListenAndServe(":8080", nil)
}
