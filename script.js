const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const weatherCard = document.getElementById('weather-card');
const errorMessage = document.getElementById('error-message');
const loading = document.getElementById('loading');
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const themeText = document.getElementById('theme-text');

const cityName = document.getElementById('city-name');
const temperature = document.getElementById('temperature');
const weatherDescription = document.getElementById('weather-description');
const weatherIcon = document.getElementById('weather-icon');
const feelsLike = document.getElementById('feels-like');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');
const pressure = document.getElementById('pressure');

const API_KEY='a5a8ac4a42a50521ca5a33d31e7babc4';

function initApp() {

    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
        document.body.classList.add("dark-theme");
        themeIcon.textContent = "☀️";
        themeText.textContent = "Светлая тема";
    }

    setupEventListeners();

    const lastCity = localStorage.getItem("lastCity");
    if (lastCity) {
        getWeatherByCity(lastCity);
    } else {
        getWeatherByLocation();
    }
}

function setupEventListeners() {
    searchBtn.addEventListener("click", handleSearch);
    cityInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") handleSearch();
    });
    locationBtn.addEventListener("click", getWeatherByLocation);
    themeToggle.addEventListener("click", toggleTheme);
}

function handleSearch() {
    const city = cityInput.value.trim();
    if (city) {
        getWeatherByCity(city);
        localStorage.setItem("lastCity", city); // сохраняем последний город
    } else {
        showError("Введите название города");
    }
}

async function fetchWeather(url, customError = "Ошибка получения данных") {
    showLoading();
    hideError();
    hideWeatherCard();
    try {
        const response = await fetch(url);
        if (!response.ok) {
            if (response.status === 404) throw new Error("Город не найден");
            throw new Error(customError);
        }
        const data = await response.json();
        displayWeather(data);

        // сохраняем название города из API (точное, с учётом страны и языка)
        if (data.name) {
            localStorage.setItem("lastCity", data.name);
        }
    } catch (err) {
        showError(err.message || customError);
    } finally {
        hideLoading();
    }
}

function getWeatherByCity(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=ru`;
    fetchWeather(url);
}

function getWeatherByLocation() {
    if (!navigator.geolocation) {
        showError("Ваш браузер не поддерживает геолокацию");
        return;
    }
    showLoading();
    hideError();
    hideWeatherCard();
    navigator.geolocation.getCurrentPosition(
        (pos) => {
            const { latitude, longitude } = pos.coords;
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=ru`;
            fetchWeather(url, "Ошибка соединения");
        },
        (err) => {
            hideLoading();
            switch (err.code) {
                case err.PERMISSION_DENIED:
                    showError("Доступ к геолокации запрещён");
                    break;
                case err.POSITION_UNAVAILABLE:
                    showError("Информация о местоположении недоступна");
                    break;
                case err.TIMEOUT:
                    showError("Время ожидания геолокации истекло");
                    break;
                default:
                    showError("Ошибка геолокации");
            }
        }
    );
}

function displayWeather(data) {
    cityName.textContent = `${data.name}, ${data.sys.country}`;
    temperature.textContent = `${Math.round(data.main.temp)}°C`;
    weatherDescription.textContent = data.weather[0].description;
    weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    feelsLike.textContent = `${Math.round(data.main.feels_like)}°C`;
    humidity.textContent = `${data.main.humidity}%`;
    windSpeed.textContent = `${data.wind.speed} м/с`;
    pressure.textContent = `${data.main.pressure} гПа`;
    showWeatherCard();
}

function toggleTheme() {
    document.body.classList.toggle("dark-theme");
    if (document.body.classList.contains("dark-theme")) {
        localStorage.setItem("theme", "dark");
        themeIcon.textContent = "☀️";
        themeText.textContent = "Светлая тема";
    } else {
        localStorage.setItem("theme", "light");
        themeIcon.textContent = "🌙";
        themeText.textContent = "Тёмная тема";
    }
}

function showLoading() { loading.classList.add("active"); }
function hideLoading() { loading.classList.remove("active"); }
function showWeatherCard() { weatherCard.classList.add("active"); }
function hideWeatherCard() { weatherCard.classList.remove("active"); }
function showError(msg) {
    errorMessage.textContent = msg;
    errorMessage.classList.add("active");
}
function hideError() { errorMessage.classList.remove("active"); }

document.addEventListener("DOMContentLoaded", initApp);



