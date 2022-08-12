import { setLocation, getHomeLocation , getWeatherDatafromCoOrds, cleanText, getCoordsFromApi} from "./Components/dataFunctions.js";
import CurrLocation from "./Components/CurrLocation.js";
import {setPlaceholderText, addSpinner, displayError, updateScreenReader, displayApiError , updateAndDisplay} from "./Components/domFunctions.js";



const currLoc = new CurrLocation();

const initApp = () => {
    //add listeners
    const geoBtn = document.getElementById("getLocation");
    geoBtn.addEventListener("click", getGeoWeather);
    const homeBtn = document.getElementById("home");
    homeBtn.addEventListener("click", loadWeather);
    const saveBtn = document.getElementById("saveLocation");
    saveBtn.addEventListener("click", saveLocation);
    const unitBtn = document.getElementById("unit");
    unitBtn.addEventListener("click", setUnitPref);
    const refreshBtn = document.getElementById("refresh");
    refreshBtn.addEventListener("click", refreshWeather);
    const locEntry = document.querySelector(".search_form");
    locEntry.addEventListener("submit", submitNewLoc);
    //set up
    setPlaceholderText();
    //load weather
    loadWeather();
}

document.addEventListener("DOMContentLoaded", initApp);

const getGeoWeather = (e) => {
    if (e.type === "click") {
        const mapIcon = document.querySelector(".fa-map-marker-alt");
        addSpinner(mapIcon);
    }
    if (!navigator.geolocation) {
        geoError();
    }
    navigator.geolocation.getCurrentPosition(geoSuccess, geoError);
}

const geoError = (err) => {
    const errMsg = err ? err.message : "Geolocation not supported!";
    displayError(errMsg, errMsg);
}

const geoSuccess = (pos) => {
    const coOrds = {
        lat: pos.coords.latitude,
        lon: pos.coords.longitude,
        name: `lat:${pos.coords.latitude} lon:${pos.coords.longitude}`
    };
    //set location object
    setLocation(currLoc, coOrds);
    //update data and display
    updateDataAndDisplay(currLoc);
}

const loadWeather = (e) => {
   
    const savedLoc = getHomeLocation();
    if (!savedLoc && !e) {
        return getGeoWeather(event);
    }
    if (!savedLoc && e.type === "click") {
        displayError("No home location saved.","Please save your home location!")
    }
    else if (savedLoc && !e) {
        displayHomeWeather(savedLoc);
    }
    else {
        const homeIcon = document.querySelector(".fa-home");
        addSpinner(homeIcon);
        displayHomeWeather(savedLoc);
    }
}

const displayHomeWeather = home => {
    if (typeof (home) === "string") {
        const homeLoc = JSON.parse(home);
        const coOrds = {
          lat: homeLoc.lat,
          lon: homeLoc.lon,
            name: homeLoc.name,
          unit: homeLoc.unit
        };
        setLocation(currLoc, coOrds);
        updateDataAndDisplay(currLoc);
    }
}


const saveLocation = () => {
    if (currLoc.getLat() && currLoc.getLon()) {
        const saveIcon = document.querySelector(".fa-save");
        addSpinner(saveIcon);
        const location = {
            name: currLoc.getName(),
            lat: currLoc.getLat(),
            lon: currLoc.getLon(),
            unit: currLoc.getUnit()
        }
        localStorage.setItem("defaultWeatherLoc", JSON.stringify(location));
        updateScreenReader(`Saved ${currLoc.getName()} as home location.`)
    }
}

const setUnitPref = () => {
    const unitIcon = document.querySelector(".fa-chart-bar");
    addSpinner(unitIcon);
    currLoc.toggleUnit();
    updateDataAndDisplay(currLoc);
}

const refreshWeather = () => {
    const refIcon = document.querySelector(".fa-sync-alt");
    addSpinner(refIcon);
    updateDataAndDisplay(currLoc);
}

const submitNewLoc = async (e) => {
    e.preventDefault();
    const newLoc = document.getElementById("searchLocation").value;
    const cleanLoc = cleanText(newLoc);
    if (!cleanLoc.length) {
        return;
    }
    const locIcon = document.querySelector(".fa-search");
    addSpinner(locIcon);
    const weatherData = await getCoordsFromApi(cleanLoc, currLoc.getUnit());
    if (weatherData) {
         if (weatherData.cod === 200) {
             const coOrds = {
                 lat: weatherData.coord.lat,
                 lon: weatherData.coord.lon,
                 name: weatherData.sys.country ? `${weatherData.name}, ${weatherData.sys.country}` : `${weatherData.name}`
           };
           setLocation(currLoc, coOrds);
           updateDataAndDisplay(currLoc);
         } else {
           displayApiError(weatherData);
         }
    }
    else {
        displayError('Connection Error', 'Connection Error');
    }
}

const updateDataAndDisplay = async (loc) => {
    console.log(loc);
    const weatherData = await getWeatherDatafromCoOrds(loc);
    console.log(weatherData);
    if (weatherData) {
        updateAndDisplay(weatherData, loc)
    }
}