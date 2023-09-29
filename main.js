
// global DOM Elements
const searchInput = document.querySelector('.searchInput');
const searchButton = document.querySelector('.searchButton');
const temperatureUnitSelectors = document.querySelectorAll('.temperature-unit-selector input');
const errorMessage = document.querySelector('.error-message');
const temperatureUnit = document.querySelector('.temperature-unit'); // Added for temperature unit display
const temperatureNumber = document.querySelector('.temperature-number');
const minTempValue = document.querySelector(".mintemp-value");
const maxTempValue = document.querySelector(".maxtemp-value");

// ⭕⭕ utilities ⭕⭕ 

// Static temperature unit selection
let selectedUnit = 'celsius'; // Default to Celsius

// OpenWeather API Key 
const apiKey = '79cfb10c32f50a6acf6643f256c614ac';

function celsiusToFahrenheit(celsius) {
  const fahrenheit = (celsius * 9 / 5) + 32;
  return fahrenheit.toFixed(2); // Round to two decimal places
}

function fahrenheitToCelsius(fahrenheit) {
  const celsius = (fahrenheit - 32) * 5 / 9;
  return celsius.toFixed(2); // Round to two decimal places
}

const formatDate = async (unixTimestamp, type) => {
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const monthsOfYear = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const daysOfWeekShortened = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthsOfYearShortened = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const date = new Date(unixTimestamp * 1000);
  const dayOfMonth = date.getDate();
  const monthIndex = date.getMonth();
  const dayOfWeekIndex = date.getDay();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  const formattedDate = `${dayOfMonth} ${monthsOfYear[monthIndex]} ${daysOfWeek[dayOfWeekIndex]}`;
  const formattedDateShortened = `${dayOfMonth} ${monthsOfYearShortened[monthIndex]} ${daysOfWeekShortened[dayOfWeekIndex]}`;

  if (type === "day") {
    return daysOfWeek[dayOfWeekIndex];
  } else if (type === "hour") {
    return `${hours}:${minutes}`;
  } else if (type === "short") {
    return formattedDateShortened;
  } else {
    return formattedDate;
  }
};

const mpsToKmh = async (mps) => {
  return `${Math.round(mps * 3.6)} km/h`;
};
const metersToKm = async (meters) => {
  return `${meters / 1000} km`;
};

 //  ⭕⭕ end utilities ⭕⭕ 

// Event listener for temperature unit selector change
temperatureUnitSelectors.forEach(selector => {
  selector.addEventListener('change', function (event) {

    selectedUnit = event.target.value;

    // Display the selected unit 
    temperatureUnit.textContent = selectedUnit === 'celsius' ? 'C' : 'F';

    // Convert temperatureNumber
    if (selectedUnit === 'fahrenheit') {
      const celsius = parseFloat(temperatureNumber.textContent);
      temperatureNumber.textContent = celsiusToFahrenheit(celsius);
    } else {
      const fahrenheit = parseFloat(temperatureNumber.textContent);
      temperatureNumber.textContent = fahrenheitToCelsius(fahrenheit);
    }

    // Convert minTempValue
    if (selectedUnit === 'fahrenheit') {
      const celsiusMin = parseFloat(minTempValue.textContent);
      const fahrenheitMin = celsiusToFahrenheit(celsiusMin);
      minTempValue.textContent = `${fahrenheitMin}°F`;
    } else {
      const fahrenheitMin = parseFloat(minTempValue.textContent);
      const celsiusMin = fahrenheitToCelsius(fahrenheitMin);
      minTempValue.textContent = `${celsiusMin}°C`;
    }

    // Convert maxTempValue
    if (selectedUnit === 'fahrenheit') {
      const celsiusMax = parseFloat(maxTempValue.textContent);
      const fahrenheitMax = celsiusToFahrenheit(celsiusMax);
      maxTempValue.textContent = `${fahrenheitMax}°F`;
    } else {
      const fahrenheitMax = parseFloat(maxTempValue.textContent);
      const celsiusMax = fahrenheitToCelsius(fahrenheitMax);
      maxTempValue.textContent = `${celsiusMax}°C`;
    }
   
  });
});


// Event listener for the form submission
searchInput.addEventListener('keydown', function (event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    const cityName = searchInput.value;

    // Clear previous error message
    errorMessage.textContent = '';

    // Create a new XMLHttpRequest object
    const xhr = new XMLHttpRequest();

    // Define the request method, URL, and set it to asynchronous
    xhr.open('GET', `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${apiKey}`, true);

    // Set up an event listener for when the request is complete
    xhr.onload = function () {
      if (xhr.status === 200) {
        // Request was successful, process the data
        const data = JSON.parse(xhr.responseText);
        if (data.cod === 404) {
          // Handle city not found error
          errorMessage.textContent = 'City not found. Please try again.';
          errorMessage.style.display = 'block'; // Display the error message

          // Set a timer to hide the error message after 5 seconds (5000 milliseconds)
          setTimeout(() => {
            errorMessage.style.display = 'none';
          }, 5000);

          // Clear the text field
          searchInput.value = '';
        } else {
          // Update the HTML with the fetched data
          updateWeatherData(data);
        }
      } else {
        // Request encountered an error
        console.error('Error:', xhr.statusText);
        errorMessage.textContent = 'An error occurred. Please try again later.';
        errorMessage.style.display = 'block'; // Display the error message

        // Set a timer to hide the error message after 5 seconds (5000 milliseconds)
        setTimeout(() => {
          errorMessage.style.display = 'none';
        }, 5000);
      }
    };

    // Send the request
    xhr.send();
  }
});


// Function to update the HTML with weather data
async function updateWeatherData(data) {

  // -- weather info DOM element
  const weatherIcon = document.querySelector('.current-weather-icon');
  const currentTemperatureStatus = document.querySelector('.current-temperature-status');
  const date = document.querySelector('.date');
  const time = document.querySelector('.time');
  const dayStatus = document.querySelector('.day-status');
  const cityNameElement = document.querySelector('.city-name span');

  // -- weather report DOM element
  const windSpeedValue = document.querySelector(".wind-speed-value");
  const humidityValue = document.querySelector(".humidity-value");
  const visibilityValue = document.querySelector(".visibility-value");
  const pressureValue = document.querySelector(".pressure-value");
  const weatherValue = document.querySelector(".weather-value");
  const sunriseValue = document.querySelector(".sunrise-value");
  const sunsetValue = document.querySelector(".sunset-value");


  // -- weather info
  weatherIcon.src = `./assets/animated/${data.weather[0].icon}.svg`;
  temperatureNumber.textContent = data.main.temp;
  currentTemperatureStatus.textContent = data.weather[0].description;
  date.textContent = await formatDate(data.dt);
  time.textContent = new Date(data.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  dayStatus.textContent = data.dt > data.sys.sunrise && data.dt < data.sys.sunset ? 'Day' : 'Night';
  cityNameElement.textContent = data.name;

  // -- weather report
  windSpeedValue.innerHTML = await mpsToKmh(data.wind.speed);
  humidityValue.innerHTML = `${data.main.humidity}%`;
  visibilityValue.innerHTML = await metersToKm(data.visibility);
  pressureValue.innerHTML = `${data.main.pressure} hPa`;
  weatherValue.innerHTML = data.weather[0].description;
  minTempValue.innerHTML = data.main.temp_min;
  maxTempValue.innerHTML = data.main.temp_max;
  sunriseValue.innerHTML = await formatDate(data.sys.sunrise, "hour")
  sunsetValue.innerHTML = await formatDate(data.sys.sunset, "hour")
}
