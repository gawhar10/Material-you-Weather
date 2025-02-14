/* Get cities from geocoding-api.open-meteo.com. */
export const getCities = async function (cityName) {
    try {
        const url = `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=10&language=en&format=json`;
        let cities = await fetch(url);
        return cities.json();
    } catch (error) {
        console.log(error);
    }
};

/* Get weather based on city latitude and longitude. */
export const getWeather = async function (latitude, longitude) {
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,rain_sum&timezone=auto`;
        let weatherData = await fetch(url);
        return weatherData.json();
    } catch (error) {
        console.log(error);
    }
};

/* Format ISO date to more readable form. */
export const formatISODate = (isoDate) => {
    const date = new Date(isoDate);
    const time = `${date.getHours()}:${date.getMinutes()}`;
    const day = `${date.getDate()}/${date.getMonth() + 1}`;
    console.log({ time: time, day: day });
    return { time: time, day: day };
};

/* Format common date. */
export const formatDate = (date) => {
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
export const dayDuration = (sunrise, sunset) => {
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
export const setWeatherString = (weatherCode) => {
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
