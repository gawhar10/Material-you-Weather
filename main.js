import { getCities, getWeather, formatISODate, formatDate, dayDuration, setWeatherString } from "./modules.js";

/* Update city name on UI. */
const updateCity = (city) => {
  document.querySelector(
    "#selectedCity"
  ).innerHTML = `${city.name}, ${city.country}`;
};

/* Display welcome. */
const displayWelcome = () => {
  const welcomeDiv = document.createElement("div");
  const h1 = document.createElement("h1");
  const p = document.createElement("p");
  h1.innerHTML = `How is the weather like, `;
  p.innerHTML = `This is a weather app. Search your city and get weather data related to your city.`;
  welcomeDiv.appendChild(h1);
  welcomeDiv.appendChild(p);
  welcomeDiv.classList.add("welcome_div");
  const mainTag = document.querySelector("main");
  const allContainers = document.querySelectorAll(".container");
  allContainers.forEach((item) => {
    item.style.display = "none";
  });
  document.querySelector(".current_temp_div").style.display = "none";
  document.querySelector(".selected_city").style.display = "none";
  document.querySelector(".second_section").style.display = "none";
  mainTag.append(welcomeDiv);
};

/* Remove welcome. */
const removeWelcome = () => {
  // document.querySelector(".welcome_div").remove();
  document.querySelector("main").lastChild.remove();
  const allContainers = document.querySelectorAll(".container");
  allContainers.forEach((item) => {
    item.style.display = "grid";
  });
  document.querySelector(".selected_city").style.display = "flex";
  document.querySelector(".current_temp_div").style.display = "flex";
  document.querySelector(".second_section").style.display = "block";
};

/* Update current weather for selected city. */
const updateCurrentWeather = async (weatherData) => {
  document.querySelector(
    ".feels_like"
  ).innerHTML = `${weatherData.current.apparent_temperature}&deg;`;
  document.querySelector(
    ".humidity"
  ).innerHTML = `${weatherData.current.relative_humidity_2m}&percnt;`;
  document.querySelector(
    ".wind_speed"
  ).innerHTML = `${weatherData.current.wind_speed_10m}Km/H`;
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
  document.querySelector("#dayTimeHour").innerHTML = `${dayTime.hour}h`;
  document.querySelector("#dayTimeMinutes").innerHTML = `${dayTime.minutes}m`;
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
      // remove welcome div if it is there.
      if (document.querySelector(".welcome_div")) {
        removeWelcome();
      }
    });
    ul.appendChild(li);
  });
  // remove previous ul.
  if (generatedCityList.hasChildNodes()) {
    generatedCityList.innerHTML = "";
  }
  generatedCityList.appendChild(ul);
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
  try {
    const cities = await getCities(cityInput.value);
    updateWeather(cities);
  }
  catch (error) {
    console.log('Please enter valid city name.');
  }
});

/* Refresh functionality event. */
document.querySelector("#refreshBtn").addEventListener("click", () => {
  const savedCity = JSON.parse(localStorage.getItem("selectedCity"));
  // console.log(savedCity);
  refreshWeather(savedCity);
});

// Run when webpage loads.
const checkLocalStorage = () => {
  // console.log(localStorage.getItem("selectedCity"));
  if (localStorage.getItem("selectedCity")) {
    const savedCity = JSON.parse(localStorage.getItem("selectedCity"));
    console.log(savedCity);
    updateCity(savedCity);
    refreshWeather(savedCity);
  } else {
    displayWelcome();
  }
};

checkLocalStorage();
