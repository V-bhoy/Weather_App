

export const setLocation = (loc_Obj, coord_obj) => {
    const { lat, lon, name, unit } = coord_obj;
    loc_Obj.setLat(lat);
    loc_Obj.setLon(lon);
    loc_Obj.setName(name);
    if (unit) {
         loc_Obj.setUnit(unit);
    }
}

export const getHomeLocation = () => {
    return localStorage.getItem("defaultWeatherLoc");
}

export const getWeatherDatafromCoOrds = async (loc) => {
    const lat = loc.getLat();
    const lon = loc.getLon();
    const units = loc.getUnit();
    const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&units=${units}&appid=${WEATHER_API_KEY}`;
    try {
        const data = await fetch(url);
        const dataJson = await data.json();
        console.log(dataJson);
        return dataJson;
    }
    catch (err) {
        console.error(err);
    }


}

export const getCoordsFromApi = async (searchTxt, units) => {
    const regex = /^\d+$/ //start and end with numbers
    const flag = regex.test(searchTxt) ? "zip" : "q";
    const url = `https://api.openweathermap.org/data/2.5/weather?${flag}=${searchTxt}&units=${units}&appid=${WEATHER_API_KEY}`;
    const encodedUrl = encodeURI(url);
    try {
        const data = await fetch(encodedUrl);
        const jsonData = await data.json();
        console.log(jsonData);
        return jsonData;
    }
    catch (err) {
        console.error(err.stack);
    }

}

export const cleanText = (text) => {
    const regex = / {2,}/g; //looking for 2 or more spaces in a row
    const cleanedText = text.replaceAll(regex, " ").trim();
    return cleanedText;
}
