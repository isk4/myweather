const d = document;

d.addEventListener("DOMContentLoaded", () => {

    // GET AND MOUNT NEW CITIES LIST
    fetch(`http://dataservice.accuweather.com/locations/v1/topcities/150?apikey=${gon.key}`)
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            return Promise.reject(response);
        }
    }).then(data => {
        let newCitySelector = d.querySelector("#new-cities");

        data.forEach(city => {
        let option = d.createElement("option");
        option.value = city.Key;
        option.textContent = city.EnglishName;
        newCitySelector.appendChild(option);
        })    
    }).catch(error => {
        console.log(error.message);
    });


    // GET AND MOUNT OWN CITIES

    function mountOwnCities() {
        fetch("/cities",
        {
            headers: {'Content-Type': 'application/json'}
        }
        ).then(response => {
            return response.json();
        }).then(data => {
            let myCities = d.querySelector("#my-cities");
            myCities.innerHTML = "";

            let def = d.createElement("option");
            def.value = "";
            def.disabled = true;
            def.selected = true;
            def.text = "Select a city"
            myCities.appendChild(def);
    
            data.forEach(city => {
                let option = d.createElement("option");
                option.value = city.key;
                option.textContent = city.name;
                myCities.appendChild(option);
            });
        });
    }

    mountOwnCities();

    // ADD NEW CITY

    let addForm = d.querySelector("#add-city");
    addForm.addEventListener("submit", e => {
        e.preventDefault();

        let select = d.querySelector("#new-cities");
        let cityName = select.options[select.selectedIndex].text;
        let key = select.value;
        let csrfToken = d.querySelector("meta[name='csrf-token']").content;

        let requestBody = {
            city : {
                name: cityName,
                key: key
            }
        };

        fetch("/cities",
            {
                method: "POST",
                body: JSON.stringify(requestBody),
                headers: {
                    'Content-Type': 'application/json',
                    'X-Transaction': 'POST',
                    'X-CSRF-Token': csrfToken
                }
            }
        ).then(response => {
            if (response.ok) {
                mountOwnCities();
            } else {
                alert("You've already saved that city.");
            }
        }).catch(error => {
            console.log(error)
        });
        
        addForm.reset();
    });
    
    
    // CREATE CHART

    Chart.defaults.global.defaultFontStyle = "bold";

    const sunny = ["sunny", "mostly sunny", "partly sunny", "intermittent clouds", "hazy sunshine"];
    const cloudy = ["mostly cloudy", "cloudy", "dreary", "fog"];
    const rainy = [
        "showers",
        "mostly cloudy w/ showers", 
        "partly sunny w/ showers", 
        "t-storms",
        "thunderstorms", 
        "mostly cloudy w/ t-storms", 
        "partly sunny w/ t-storms",
        "rain"
    ];
    const snowy = [
        "flurries",
        "partly sunny w/ flurries",
        "snow",
        "mostly cloudy w/ snow",
        "ice",
        "sleet",
        "freezing rain",
        "rain and snow"
    ]

    function getColor (weather) {
        if (sunny.includes(weather)) {
            return "#ff643d";
        } else if (cloudy.includes(weather)) {
            return "#bebebe";
        } else if (rainy.includes(weather)) {
            return "#316087";
        } else if (snowy.includes(weather)) {
            return "#8ec9d2";
        } else {
            return "#000000";
        }
    }
    
    function createChart(forecast) {
        let dataLabels = [];
        let temperaturesData = [];
        let colors = [];

        forecast.DailyForecasts.forEach(day => {
            dataLabels.push(day.Date.slice(0, 10));
            temperaturesData.push(Math.round(day.Temperature.Maximum.Value));
            colors.push(getColor(day.Day.IconPhrase.toLowerCase()));
        });

        let canvasDiv = d.querySelector("#canvas-div");
        canvasDiv.innerHTML = "";

        let canvas = d.createElement("canvas");
        canvasDiv.appendChild(canvas);

        let chart = new Chart(canvas, {
            type: "bar",
            data: {
                labels: dataLabels,
                datasets: [{
                    label: "°C",
                    data: temperaturesData,
                    backgroundColor: colors,
                    borderColor: "#bfcdc4",
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        });

        chart = null;
    }


    // SET WIND

    function setWind(direction, speed) {
        let directionDiv = d.querySelector("#direction-icon");
        let speedText = d.querySelector("#wind-speed");

        if (direction == "N") {
            directionDiv.className = "north";
        } else if (direction == "E") {
            directionDiv.className = "east";
        } else if (direction == "S") {
            directionDiv.className = "south";
        } else {
            directionDiv.className = "west";            
        }

        speedText.textContent = speed + " km/h";
    }


    // SHOW FORECAST
    
    let forecastForm = d.querySelector("#show-city");
    let myCitySelector = d.querySelector("#my-cities");
    
    
    forecastForm.addEventListener("submit", e => {
        e.preventDefault();
        
        let cityKey = myCitySelector.value;
        let url = `https://dataservice.accuweather.com/forecasts/v1/daily/5day/${cityKey}?apikey=${gon.key}&metric=true`
    
        fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                return Promise.reject(response);
            }
        }).then(data => {
            createChart(data);
        }).catch(error => {
            console.log(error.message);
        })


        fetch(`http://dataservice.accuweather.com/currentconditions/v1/${cityKey}?apikey=${gon.key}&details=true`)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                return Promise.reject(response);
            }
        }).then(data => {
            let windDirection = data[0].Wind.Direction.English;
            let windSpeed = data[0].Wind.Speed.Metric.Value;

            setWind(windDirection, windSpeed);
        }).catch(error => {
            console.log(error.message);
        })

    });

});