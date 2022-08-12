export const setPlaceholderText = () => {
    const inp = document.getElementById("searchLocation");
    window.innerWidth<400 ? (inp.placeholder = "City, State, Country") : (inp.placeholder="city, State, Country, or Zip Code")
}

export const addSpinner = (elem) => {
    animateButton(elem);
    setTimeout(animateButton, 1000, elem);
}

const animateButton = (elem) => {
    elem.classList.toggle("none"); //toggles CSS classnames of an element
    elem.nextElementSibling.classList.toggle("block");
    elem.nextElementSibling.classList.toggle("none");
}


export const displayError = (headerMsg, errorMsg ) => {
    updateWeatherLocationHeader(headerMsg);
    updateScreenReader(errorMsg);
}

export const displayApiError = (status) => {
    const msg = toProperCase(status.message);
    updateWeatherLocationHeader(msg);
    updateScreenReader(`${msg}. Please try again!`);
};

const toProperCase = (text) => {
    const words = text.split(" ");
    const properWords = words.map(elem => {
        return elem.charAt(0).toUpperCase() + elem.slice(1);
    })
    return properWords.join(" ");
}

const updateWeatherLocationHeader = (msg) => {
    const location = document.getElementById("curr_location");
    if (msg.indexOf("lat:") !== -1 && msg.indexOf("lon:") !== -1) {
        const msgArray = msg.split(" ");
        const arr = msgArray.map(elem => {
            return elem.replace(":", ": ")
        })
        const lat = arr[0].indexOf("-") === -1 ? arr[0].slice(0, 10) : arr[0].slice(0, 11);
        const lon =
          arr[1].indexOf("-") === -1
            ? arr[1].slice(0, 10)
                : arr[1].slice(0, 11);
        location.textContent= `${lat} * ${lon}`
    } else {
        location.textContent = msg;
    }
    
}

export const updateScreenReader = (msg) => {
    document.getElementById("confirm").textContent = msg;
}

export const updateAndDisplay = (data, loc) => {
    fadeDisplay();
    clearDisplay();
    const weatherClass = getWeatherClass(data.current.weather[0].icon);
    setBgImage(weatherClass);
    const screenReader = buildScreenReader(data, loc);
    updateScreenReader(screenReader);
    updateWeatherLocationHeader(loc.getName());
    //current conditions
    const curr = createCurrConditionDivs(data, loc.getUnit());
    displayCurrConditions(curr);
    //six day forecast
    displaySixDayForecast(data);
    setFocusOnSearch();
    fadeDisplay();
}

const fadeDisplay = () => {
    const curr = document.getElementById("currentForecast");
    curr.classList.toggle("zero-vis");
    curr.classList.toggle("fade-in");
    const daily = document.getElementById("dailyForecast");
    daily.classList.toggle("zero-vis");
    daily.classList.toggle("fade-in");
}

const clearDisplay = () => {
    const curr = document.querySelector(".currForecast_content");
    deleteContent(curr);
    const daily = document.querySelector(".dailyForecast_content");
    deleteContent(daily);
}

const deleteContent = (parentElem) => {
    let child = parentElem.lastElementChild;
    while (child) {
        parentElem.removeChild(child);
        child = parentElem.lastElementChild;
    }
}

const getWeatherClass = (icon) => {
    const firstTwoChars = icon.slice(0, 2);
    const lastChar = icon.slice(2);
    const weatherLookup = {
        "09": "snow",
        "10": "rain",
        "11": "rain",
         "13": 'snow',
         "50" : "fog"
    }
    let weatherClass;
    if (weatherLookup[firstTwoChars]) {
        weatherClass = weatherLookup[firstTwoChars];
    }
    else if (lastChar === "d") {
        weatherClass = "clouds";
    }
    else {
        weatherClass = "night";
    }
    return weatherClass;
}

const setBgImage = (weatherClass) => {
    document.documentElement.classList.add(weatherClass);
    document.documentElement.classList.forEach((img) => {
        if (img !== weatherClass) {
            document.documentElement.classList.remove(img);
        }
    })
}

const buildScreenReader = (data, loc) => {
    const location = loc.getName();
    const unit = loc.getUnit();
    const tempUnit = unit === "imperial" ? "F" : "C";
    return `${data.current.weather[0].description} and ${data.current.temp}°${tempUnit} in ${location}`;
}


const setFocusOnSearch = () => {
    document.getElementById("searchLocation").focus(); 
}

const createCurrConditionDivs = (data, unit) => {
    const tempUnit = unit === "imperial" ? "F" : "C";
    const windUnit = unit === "imperial" ? "mph" : "m/s";
    const icon = createMainImgDiv(data.current.weather[0].icon, data.current.weather[0].description);
    const temp = createElem(
      "div",
      "temp",
      `${data.current.temp}°${tempUnit}`
    );
    const desc = toProperCase(data.current.weather[0].description);
    const descDiv = createElem("div", "desc", desc);
    const feels = createElem(
      "div",
      "feels",
      `Feels like ${data.current.feels_like}°`
    );
    const maxTemp = createElem(
      "div",
      "maxTemp",
      `High ${data.daily[0].temp.max}°${tempUnit}`
    );
    const minTemp = createElem(
      "div",
      "minTemp",
      `Low ${data.daily[0].temp.min}°${tempUnit}`
    );
    const humidity = createElem("div", "humidity", `Humidity ${data.current.humidity}%`);
    const wind = createElem("div", "wind", `Wind ${data.current.wind_speed} ${windUnit}`);
    return [icon, temp, descDiv, feels, maxTemp, minTemp, humidity, wind]
}

const createMainImgDiv = (icon, altText) => {
    const iconDiv = createElem("div", "icon");
    iconDiv.id = "icon";
    const faIcon = translateIconToFA(icon);
    faIcon.ariaHidden = true;
    faIcon.title = altText;
    iconDiv.appendChild(faIcon);
    return iconDiv;
} 

const createElem = (type, className, text, unit) => {
    const div = document.createElement(type);
    div.className = className;
    if (text) {
        div.textContent = text;
    }
    if (className === "temp") {
        const unitDiv = document.createElement("div");
        unitDiv.classList.add("unit");
        unitDiv.textContent = unit;
        div.appendChild(unitDiv);
    }
    return div;
}

const translateIconToFA = (icon) => {
    const i = document.createElement("i");
    const firstTwoChars = icon.slice(0, 2);
    const lastChar = icon.slice(2);
    switch (firstTwoChars) {
      case "01":
        if (lastChar === "d") {
          i.classList.add("far", "fa-sun");
        } else {
          i.classList.add("far", "fa-moon");
        }
        break;
      case "02":
        if (lastChar === "d") {
          i.classList.add("fas", "fa-cloud-sun");
        } else {
          i.classList.add("fas", "fa-cloud-moon");
        }
        break;
      case "03":
        i.classList.add("fas", "fa-cloud");
        break;
      case "04":
        i.classList.add("fas", "fa-cloud-meatball");
        break;
      case "09":
        i.classList.add("fas", "fa-cloud-rain");
        break;
      case "10":
        if (lastChar === "d") {
          i.classList.add("fas", "fa-cloud-sun-rain");
        } else {
          i.classList.add("fas", "fa-cloud-moon-rain");
        }
        break;
      case "11":
        i.classList.add("fas", "fa-poo-storm");
        break;
      case "13":
        i.classList.add("far", "fa-snowflake");
        break;
      case "50":
        i.classList.add("fas", "fa-smog");
        break;
      default:
        i.classList.add("far", "fa-question-circle");
    }
    return i;
}

const displayCurrConditions = (currArray) => {
    const container = document.querySelector(".currForecast_content");
    currArray.forEach(elem => {
        container.appendChild(elem);
    });
}

const displaySixDayForecast = (data) => {
    for (let i = 1; i <= 6; i++){
        const dfArr = createDailyDivs(data.daily[i]);
        displayDailyForecast(dfArr);
    }
}


const createDailyDivs = (day) => {
    const dayText = getDay(day.dt);
    const dayAbbr = createElem("p", "dayAbbr", dayText);
    const dayIcon = createDayIcon(day.weather[0].icon, day.weather[0].description);
    const dayHigh = createElem(
      "p",
      "dayHigh",
      `${Math.round(Number(day.temp.max))}°`
    );
     const dayLow = createElem(
       "p",
       "dayLow",
       `${Math.round(Number(day.temp.min))}°`
     );
    return [dayAbbr, dayIcon, dayHigh, dayLow];
}

const getDay = (data) => {
    const date = new Date(data * 1000);
    const utc = date.toUTCString();
    return utc.slice(0, 3).toUpperCase();
}

const createDayIcon = (icon, text) => {
    const img = document.createElement("img");
    if (window.width < 768 || window.innerHeight < 1025) {
        img.src = `https://openweathermap.org/img/wn/${icon}.png`;
    }
    else {
       img.src = `https://openweathermap.org/img/wn/${icon}@2x.png`; 
    }
    img.alt = text;
    return img;
}

const displayDailyForecast = (dfArr) => {
    const dayDiv = createElem("div", "forecastDay");
    dfArr.forEach(elem => {
        dayDiv.appendChild(elem);
    })
    const container = document.querySelector(".dailyForecast_content");
    container.appendChild(dayDiv);
}