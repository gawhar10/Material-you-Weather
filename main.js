import { getCities, getWeather, formatISODate, formatDate, dayDuration, setWeatherString } from "./modules.js";

/* Display welcome. */
const displayWelcome = () => {
  const welcomeDiv = document.createElement("div");
  const h1 = document.createElement("h1");
  const p = document.createElement("p");
  h1.innerHTML = `How is the weather like, `;
  p.innerHTML = `Search your favorite city and get weather data related to it. in a most concise way`;
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
  document.querySelector("main").lastChild.remove();
  const allContainers = document.querySelectorAll(".container");
  allContainers.forEach((item) => {
    item.style.display = "grid";
  });
  document.querySelector(".selected_city").style.display = "flex";
  document.querySelector(".current_temp_div").style.display = "flex";
  document.querySelector(".second_section").style.display = "block";
};

/* Update current weather. */
const currentWeatherView = async (weatherData) => {
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

/* Update daily weather. */
const dailyWeatherView = (weatherData) => {
  const listContainer = document.querySelector("#listContainer");
  // Remove previously created ul.
  if (listContainer.children) {
    listContainer.innerHTML = "";
  }
  const ul = document.createElement("ul");
  for (let i = 0; i < weatherData.daily.time.length; i++) {
    const dailyTime = formatDate(weatherData.daily.time[i]);
    const li = document.createElement("li");
    const day = document.createElement("p");
    const minTemp = document.createElement("p");
    const maxTemp = document.createElement("p");
    const rainSum = document.createElement("p");
    day.innerHTML = dailyTime;
    minTemp.innerHTML = weatherData.daily.temperature_2m_min[i];
    maxTemp.innerHTML = weatherData.daily.temperature_2m_max[i];
    rainSum.innerHTML = weatherData.daily.rain_sum[i];
    li.appendChild(day);
    li.appendChild(minTemp);
    li.appendChild(maxTemp);
    li.appendChild(rainSum);
    ul.appendChild(li);
    listContainer.appendChild(ul);
  }
};

/* Saving city name, latitude and longitude to the Localstorage. */
const cityLocalStorage = async (city) => {
  const selectedCity = {
    name: `${city.name}`,
    country: `${city.country}`,
    latitude: `${city.latitude}`,
    longitude: `${city.longitude}`,
  };
  localStorage.setItem("selectedCity", JSON.stringify(selectedCity));
};

/* Main function. */
const main = function (cities) {
  const generatedCityList = document.querySelector("#generatedCityList");
  const ul = document.createElement("ul");

  cities.results.forEach((city) => {
    const li = document.createElement("li");
    li.innerHTML = `${city.name}, ${city.admin1}, ${city.country}`;
    li.addEventListener("click", async () => {
      const weatherData = await getWeather(city.latitude, city.longitude);
      document.querySelector("#selectedCity").innerHTML = `${city.name}, ${city.country}`;
      currentWeatherView(weatherData);
      dailyWeatherView(weatherData);
      cityLocalStorage(city);
      generatedCityList.removeChild(ul);
      cityInput.value = "";
      // remove welcome div if it is there.
      if (document.querySelector(".welcome_div")) {
        removeWelcome();
      }
    });
    ul.appendChild(li);
  });
  // Removing previously generated city list.
  if (generatedCityList.hasChildNodes()) generatedCityList.innerHTML = "";
  generatedCityList.appendChild(ul);
};

/* Search button event.*/
document.querySelector("#searchBtn").addEventListener("click", async (e) => {
  e.preventDefault();
  const cityInput = document.querySelector("#cityInput");
  try {
    const cities = await getCities(cityInput.value);
    main(cities);
  }
  catch (error) {
    console.log('Please enter valid city name.');
  }
});

/* Refresh button event. */
document.querySelector("#refreshBtn").addEventListener("click", async () => {
  const savedCity = JSON.parse(localStorage.getItem("selectedCity"));
  const weatherData = await getWeather(savedCity.latitude, savedCity.longitude);
  document.querySelector("#selectedCity").innerHTML = `${savedCity.name}, ${savedCity.country}`;
  currentWeatherView(weatherData);
  dailyWeatherView(weatherData);
});

// Run when webpage loads.
const checkLocalStorage = async () => {
  if (localStorage.getItem("selectedCity")) {
    const savedCity = JSON.parse(localStorage.getItem("selectedCity"));
    const weatherData = await getWeather(savedCity.latitude, savedCity.longitude);
    document.querySelector("#selectedCity").innerHTML = `${savedCity.name}, ${savedCity.country}`;
    currentWeatherView(weatherData);
    dailyWeatherView(weatherData);
  } else {
    displayWelcome();
  }
};

checkLocalStorage();
