let cityName = document.getElementById("city-name");
let enterCity = document.getElementById("enter-city");
let button = document.getElementById("search-button");
let temperature = document.getElementById("temperature");
let humidity = document.getElementById("humidity");
let windSpeed = document.getElementById("wind-speed");
let errorMessage = document.getElementById("error-message");
let forecastMessage = document.getElementById("forecast-message");
let rainChance = document.getElementById("rain-chance");
let weatherIcon = document.getElementById("weather-icon");
let weatherDescription = document.getElementById("weather-description");
let dailyForecast = document.getElementById("daily-forecast");
let loadingMessage = document.getElementById("loading-message");
    
async function getWeather(city) {
    try {
        let url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;

        loadingMessage.textContent = "Loading weather...";
        errorMessage.textContent = "";
        button.disabled = true;

        let response = await fetch(url);

        if (!response.ok) {
            throw new Error("City not found");
        }

        let data = await response.json();
        if (!data.results || data.results.length === 0) {
            throw new Error("City not found");
        }

        let location = data.results[0];

        let latitude = location.latitude;
        let longitude = location.longitude;

        console.log(latitude, longitude);
        
let weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&hourly=precipitation_probability,temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&forecast_days=3&timezone=auto`;

        let weatherResponse = await fetch(weatherUrl);

        if (!weatherResponse.ok) {
            throw new Error("Weather data not found");
        }

        console.log(weatherUrl);
        let weatherData = await weatherResponse.json();
       let daily = weatherData.daily;

dailyForecast.innerHTML = "";

for (let i = 0; i < daily.time.length; i++) {

    let date = new Date(daily.time[i] + "T12:00:00");

    let dayName = date.toLocaleDateString("en-US", {
        weekday: "short"
    });

    let condition = getWeatherCondition(daily.weather_code[i]);

    let card = document.createElement("div");

    card.classList.add("day-card");

    card.innerHTML = `
        <p>${i === 0 ? "Today" : dayName}</p>
        <div class="day-icon">${condition.icon}</div>
        <h4>${Math.round(daily.temperature_2m_max[i])}°</h4>
        <p class="min-temp">${Math.round(daily.temperature_2m_min[i])}° min</p>
        <p class="rain-probability">
            ${daily.precipitation_probability_max[i] ?? "--"}% rain
        </p>
    `;

    dailyForecast.appendChild(card);
}
    
        let weatherCode = weatherData.current.weather_code;
        
        let condition = getWeatherCondition(weatherCode);

        weatherIcon.textContent = condition.icon;
        weatherDescription.textContent = condition.description;

        cityName.textContent = data.results[0].name;

        temperature.textContent =
            `${weatherData.current.temperature_2m} °C`;

        humidity.textContent =
            `${weatherData.current.relative_humidity_2m} %`;

        windSpeed.textContent =
            `${weatherData.current.wind_speed_10m} Km/h`;

        errorMessage.textContent = "";

        let times = weatherData.hourly.time;
        let rainProbabilities = weatherData.hourly.precipitation_probability;
        let currentTime = weatherData.current.time;
        let currentHour = Number(currentTime.slice(11,13));
        let today = currentTime.slice(0,10);
        
        let tonightProbabilites = rainProbabilities.filter((probability, index) => {
    let forecastTime = times[index];
    let forecastDate = forecastTime.slice(0,10);
    let forecastHour = Number(forecastTime.slice(11,13));

    return forecastDate === today &&
        forecastHour >= Math.max(18, currentHour);
});

        

        if (tonightProbabilites.length > 0) {
            let highestRainChance = Math.max(...tonightProbabilites);

            rainChance.textContent = `Rain probability: ${highestRainChance}%`;

            if (highestRainChance >= 60) {
                forecastMessage.textContent = "Rain is likely tonight.";
            } else if (highestRainChance >= 30) {
                forecastMessage.textContent = "There is a Chance of Rain tonight.";
            } else {
                forecastMessage.textContent = "Rain is unlikely tonight. Enjoy your evening!";
            }
        } else {
            forecastMessage.textContent = "Tonight's forecast is unavailable.";
            rainChance.textContent ="Rain probability: --%"
        }
        


        } catch (error) {
        console.error(error);

        errorMessage.textContent = "Something went wrong. Please try again.";

        dailyForecast.innerHTML = "";

    } finally {
        loadingMessage.textContent = "";
        button.disabled = false;
    }
}

function getWeatherCondition(code) {
if (code === 0) {
return { description: "Clear sky", icon: "☀️" };
} else if (code === 1) {
return { description: "Mainly clear", icon: "🌤️" };
} else if (code === 2) {
return { description: "Partly cloudy", icon: "⛅" };
} else if (code === 3) {
return { description: "Overcast", icon: "☁️" };
} else if ([45, 48].includes(code)) {
return { description: "Foggy", icon: "🌫️" };
} else if ([51, 53, 55, 56, 57].includes(code)) {
return { description: "Drizzle", icon: "🌦️" };
} else if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
return { description: "Rainy", icon: "🌧️" };
} else if ([71, 73, 75, 77, 85, 86].includes(code)) {
return { description: "Snowy", icon: "❄️" };
} else if ([95, 96, 99].includes(code)) {
return { description: "Thunderstorm", icon: "⛈️" };
} else {
return { description: "Unknown conditions", icon: "🌡️" };
}

}

button.addEventListener("click", function() {
    getWeather(enterCity.value);
});

enterCity.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        getWeather(enterCity.value);
    }
});