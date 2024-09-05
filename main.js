/* Get cities from geocoding-api.open-meteo.com. */
const getCities = async function (cityName) {
  try {
    url = `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=10&language=en&format=json`;
    let cities = await fetch(url);
    return cities.json();
  } catch (error) {
    console.log(error);
  }
};

/* Get weather based on city latitude and longitude. */
const getWeather = async function (latitude, longitude) {
  try {
    url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,rain_sum&timezone=auto`;
    let weatherData = await fetch(url);
    return weatherData.json();
  } catch (error) {
    console.log(error);
  }
};

/* Format ISO date to more readable form. */
const formatISODate = (isoDate) => {
  const date = new Date(isoDate);
  const time = `${date.getHours()}:${date.getMinutes()}`;
  const day = `${date.getDate()}/${date.getMonth() + 1}`;
  console.log({ time: time, day: day });
  return { time: time, day: day };
};

/* Format common date. */
const formatDate = (date) => {
  //   date = "2024-09-01";
  date = date.split("-");
  const [year, month, day] = date;
  const monthNames = [
    "jan",
    "feb",
    "mar",
    "apr",
    "may",
    "jun",
    "jul",
    "aug",
    "sept",
    "oct",
    "nov",
    "dec",
  ];
  return `${monthNames[Number(month) - 1]}, ${day}`;
};

/* Calculate day time in hours and minutes. */
const dayDuration = (sunrise, sunset) => {
  sunrise = sunrise.split(":");
  console.log(sunrise);
  sunset = sunset.split(":");
  console.log(sunset);
  const hour = Number(sunset[0]) - Number(sunrise[0]);
  const minutes = Number(sunset[1]) - Number(sunrise[1]);
  if (Number(sunset[1]) > Number(sunrise[1])) {
    return { hour: `${hour}`, minutes: `${minutes}` };
  } else {
    return { hour: `${hour - 1}`, minutes: `${60 + minutes}` };
  }
};

/* Update weather code */
const setWeatherString = (weatherCode) => {
  const weatherCodes = {
    "Clear sky": 0,
    "Mainly clear": 1,
    "Partly cloudy": 2,
    Overcast: 3,
    Fog: 45,
    "Depositing fime fog": 48,
    "Light drizzle": 51,
    "Moderate drizzle": 53,
    "Dense drizzle": 55,
    "Light freezing drizzle": 56,
    "Moderate or dense freezing drizzle": 57,
    "Light rain": 61,
    "Moderate rain": 63,
    "Heavy rain": 65,
    "Light freezing rain": 66,
    "Moderate or heavy freezing rain": 67,
    "Slight snowfall": 71,
    "Moderate snowfall": 73,
    "Heavy snowfall": 75,
    "Snow grains": 77,
    "Slight rain showers": 80,
    "Moderate rain showers": 81,
    "Heavy rain showers": 82,
    "Slight snow showers": 85,
    "Heavy snow showers": 86,
    "Thunderstorm slight or moderate": 95,
    "Thunderstorm strong": 96,
    "Thunderstorm heavy": 99,
  };
  Object.entries(weatherCodes).forEach(([key, val]) => {
    if (val === weatherCode) {
      document.querySelector("#weatherType").innerHTML = `${key}`;
    }
  });
};

/* Update city name on UI. */
const updateCity = (city) => {
  document.querySelector(
    "#selectedCity"
  ).innerHTML = `${city.name}, ${city.country}`;
};

/* Update current weather for selected city. */
const updateCurrentWeather = async (weatherData) => {
  document.querySelector(
    ".feels_like"
  ).innerHTML = `${weatherData.current.apparent_temperature}`;
  document.querySelector(
    ".humidity"
  ).innerHTML = `${weatherData.current.relative_humidity_2m}`;
  document.querySelector(
    ".wind_speed"
  ).innerHTML = `${weatherData.current.wind_speed_10m}`;
  document.querySelector(
    "#currentTemp"
  ).innerHTML = `${weatherData.current.temperature_2m}&deg`;

  const sunriseTime = formatISODate(weatherData.daily.sunrise[0]);
  const sunsetTime = formatISODate(weatherData.daily.sunset[0]);
  const lastUpdated = formatISODate(weatherData.current.time);
  const dayTime = dayDuration(sunriseTime.time, sunsetTime.time);
  document.querySelector("#sunriseTime").innerHTML = `${sunriseTime.time}AM`;
  document.querySelector("#sunsetTime").innerHTML = `${sunsetTime.time}PM`;
  document.querySelector(
    "#lastUpdated"
  ).innerHTML = `${lastUpdated.time}, ${lastUpdated.day}`;
  const weatherCode = weatherData.current.weather_code;
  setWeatherString(weatherCode);
  document.querySelector("#dayTimeHour").innerHTML = `Hours ${dayTime.hour}`;
  document.querySelector(
    "#dayTimeMinutes"
  ).innerHTML = `Minutes ${dayTime.minutes}`;
};

/* Update daily weather for selected city. */
const updateDailyWeather = (days, minTemp, maxTemp, rainSum) => {
  const listContainer = document.querySelector("#listContainer");
  // to remove previously created ul.
  if (listContainer.children) {
    listContainer.innerHTML = "";
  }

  const ul = document.createElement("ul");
  for (let i = 0; i < minTemp.length; i++) {
    const day = formatDate(days[i]);
    console.log(day);
    const li = document.createElement("li");
    const dayP = document.createElement("p");
    const minP = document.createElement("p");
    const maxP = document.createElement("p");
    const rainSumP = document.createElement("p");
    dayP.innerHTML = day;
    minP.innerHTML = minTemp[i];
    maxP.innerHTML = maxTemp[i];
    rainSumP.innerHTML = rainSum[i];
    li.appendChild(dayP);
    li.appendChild(minP);
    li.appendChild(maxP);
    li.appendChild(rainSumP);
    ul.appendChild(li);
    listContainer.appendChild(ul);
  }
};

/* Main function for updating weather for The selected city. */
const updateWeather = function (cities) {
  const generatedCityList = document.querySelector("#generatedCityList");
  const ul = document.createElement("ul");
  cities = cities.results;

  cities.forEach((city) => {
    const li = document.createElement("li");
    li.innerHTML = `${city.name}, ${city.admin1}, ${city.country}`;
    li.addEventListener("click", async () => {
      const weatherData = await getWeather(city.latitude, city.longitude);
      const minTemp = weatherData.daily.temperature_2m_min;
      const maxTemp = weatherData.daily.temperature_2m_max;
      const rainSum = weatherData.daily.rain_sum;
      const days = weatherData.daily.time;
      //   save city name and latitude and longitude to local storage.
      const selectedCity = {
        name: `${city.name}`,
        country: `${city.country}`,
        latitude: `${city.latitude}`,
        longitude: `${city.longitude}`,
      };
      localStorage.setItem("selectedCity", JSON.stringify(selectedCity));
      updateCity(city);
      updateCurrentWeather(weatherData);
      updateDailyWeather(days, minTemp, maxTemp, rainSum);
      generatedCityList.removeChild(ul);
      // to empty input value.
      cityInput.value = "";
    });
    ul.appendChild(li);
    generatedCityList.appendChild(ul);
  });
};

const refreshWeather = async (savedCity) => {
  const weatherData = await getWeather(savedCity.latitude, savedCity.longitude);
  const minTemp = weatherData.daily.temperature_2m_min;
  const maxTemp = weatherData.daily.temperature_2m_max;
  const rainSum = weatherData.daily.rain_sum;
  const days = weatherData.daily.time;
  updateCurrentWeather(weatherData);
  updateDailyWeather(days, minTemp, maxTemp, rainSum);
};

/* Search button event.*/
document.querySelector("#searchBtn").addEventListener("click", async (e) => {
  e.preventDefault();
  const cityInput = document.querySelector("#cityInput");
  const cities = await getCities(cityInput.value);
  updateWeather(cities);
});

/* Refresh functionality event. */
document.querySelector("#refreshBtn").addEventListener("click", () => {
  const savedCity = JSON.parse(localStorage.getItem("selectedCity"));
  // console.log(savedCity);
  refreshWeather(savedCity);
});

// Run when webpage loads.
const loadFromLocalStorage = () => {
  // console.log(localStorage.getItem("selectedCity"));
  if (localStorage.getItem("selectedCity")) {
    const savedCity = JSON.parse(localStorage.getItem("selectedCity"));
    console.log(savedCity);
    updateCity(savedCity);
    refreshWeather(savedCity);
  }
};

loadFromLocalStorage();
