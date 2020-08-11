import axios from 'axios';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import dompurify from 'dompurify';
import he from 'he';
import { nanoid } from 'nanoid';
import React, { Fragment, useEffect, useState } from 'react';
import { hot } from 'react-hot-loader/root';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import { Map, Marker, TileLayer, WMSTileLayer } from "react-leaflet";
import { getWeatherIcon, initIcons } from '../modules/helpers';
import { clearData } from '../modules/local-storage';
import { useLocalStorage } from '../hooks/useLocalStorage';
import './App.scss';
import { SunriseSunset } from '../components/SunriseSunset';

dayjs.extend(relativeTime)
initIcons();

const App = (props) => {
  const [locationName, setLocationName] = useState('Determining location');
  const [coordinates, setCoordinates] = useLocalStorage('coordinates', null);
  useEffect(() => {
    async function getPosition(position) {
      setCoordinates({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      })
    }
    async function geolocationError(error) {
      console.error(error);
    }
    async function doGeolocation() {
      const geolocationOptions = {
        enableHighAccuracy: true,
        maximumAge: 3600000 // 1 hour (number of seconds * 1000 milliseconds)
      };
      await navigator.geolocation.getCurrentPosition(getPosition, geolocationError, geolocationOptions);
    }
    if (coordinates && weatherData && weatherData.lastUpdated) {
      const nextUpdateTime = dayjs(weatherData.lastUpdated).add(20, 'minute');
      if (dayjs().isAfter(nextUpdateTime)) {
        clearData('coordinates');
        doGeolocation();
      }
    } else {
      doGeolocation();
    }

    // return () => {};
  }, []);

  const [isLoading, setIsLoading] = useState(false);
  const [hourlyConditionToShow, setHourlyConditionToShow] = useState('temperature');
  const [weatherData, setWeatherData] = useLocalStorage('weatherData', null);
  useEffect(() => {
    setIsLoading(true);
    if (coordinates) {
      const { lat, lng } = coordinates;
      const getWeatherData = async (lat, lng) => {
        setLocationName('Loading weather data')
        const weatherApiurl = `https://cleanst.art/.netlify/functions/location-and-weather/?lat=${lat}&lng=${lng}`;
        const weatherApiData =  await axios
          .get(weatherApiurl)
          .then(response => response.data);
        setWeatherData({
          lastUpdated: dayjs().toString(),
          data: weatherApiData,
        });
        setIsLoading(false);
        setLocationName(weatherApiData.location.locationName);
      };
      if (weatherData && weatherData.lastUpdated) {
        const nextUpdateTime = dayjs(weatherData.lastUpdated).add(20, 'minute');
        if (dayjs().isAfter(nextUpdateTime)) {
          getWeatherData(lat, lng);
        }
      } else {
        getWeatherData(lat, lng);
      }
      weatherData && weatherData.data && setLocationName(weatherData.data.location.locationName);
    }

    // return () => {};
  }, [coordinates]);

  const getConditionBarClass = (data) => {
    const cloudCover = Math.round(data.cloudCover * 100);
    const currentIcon = data.icon;
    const isCloudy = currentIcon.includes('cloudy') || cloudCover >= 40;
    const isRaining = (currentIcon.includes('rain') || currentIcon.includes('thunderstorm'));
    const isSnowing = (currentIcon.includes('snow') || currentIcon.includes('sleet'));

    let returnClass = 'bg-white';

    if (isSnowing) {
      returnClass = 'bg-gray-100';
    }
    if (isRaining) {
      returnClass = 'bg-blue-400';
    }
    if (isCloudy) {
      returnClass = cloudCover >= 60 || currentIcon.includes('mostly') ? 'bg-gray-600' : 'bg-gray-400';
    }

    return returnClass;
  };


  const formatCondition = (value, condition) => {
    switch (condition) {
      case 'temperature':
      case 'apparentTemperature':
      case 'dewPoint':
        return formatTemp(value);
        break;
      case 'precipProbability':
      case 'humidity':
      case 'cloudCover':
        return formatPercent(value);
        break;
      case 'precipIntensity':
        return `${Math.round(value)} IN/HR`;
      case 'pressure':
        return `${Math.round(value)} MB`;
      case 'windSpeed':
      case 'windGust':
        return `${Math.round(value)} MPH`
      default:
        return value;
        break;
    }
  };

  const formatTemp = temp => `${Math.round(temp)}${String.fromCharCode(176)}`;
  const formatPercent = num => `${Math.round(num * 100)}%`;

  const formatSummary = (currentHourData, allHourlyData, index) => {
    if (index === 0) {
      return currentHourData.summary;
    }
    return currentHourData.summary === allHourlyData[index - 2].summary ? '' : currentHourData.summary;
  };

  const changeHandler = (event) => {
    // console.log(event.target.value);
    setHourlyConditionToShow(event.target.value);
  };

  return (
    <Fragment>
      <div className="header">
        <div className="location-name">
          <h1>
            <FontAwesomeIcon icon="location-arrow" fixedWidth /> {locationName}
          </h1>
        </div>
      </div>
      <div className="content">
        <div className="current-conditions">
          {weatherData && weatherData.data ? (
            <div className="icon">
              <FontAwesomeIcon
                icon={['fad', getWeatherIcon(weatherData.data.weather.currently.icon)]}
                fixedWidth
                size="4x"
              />
            </div>
          ) : ''}
          <div className="temperature">
            <h2 className="actual-temp">{weatherData && weatherData.data ? formatTemp(weatherData.data.weather.currently.temperature) : ''}</h2>
            <h3 className="feels-like-temp">{weatherData && weatherData.data ? 'Feels ' + formatTemp(weatherData.data.weather.currently.apparentTemperature) : ''}</h3>
          </div>
        </div>
        <div className="map">
        {coordinates && coordinates.lat ? (
          <Map
            center={[coordinates.lat, coordinates.lng]}
            zoom={4}
            doubleClickZoom={false}
            dragging={false}
            keyboard={false}
            scrollWheelZoom={false}
            touchZoom={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution=""
              opacity={.85}
            />
            <WMSTileLayer
              layer="precipitation_new"
              url={`https://tile.openweathermap.org/map/{layer}/{z}/{x}/{y}.png?appid=${props.OPENWEATHERMAP_API_KEY}`}
            />
            <Marker position={[coordinates.lat, coordinates.lng]} opacity={.85} />
          </Map>
          ) : ''}
        </div>
        <div className="hourly-container">
          <ul className="hourly">
          {weatherData && weatherData.data.weather && weatherData.data.weather.hourly.data.map((hourData, index) => {
            return index <= 20 && index % 2 === 0 ? (
              <li key={nanoid(7)} className="hour">
                <div className={`condition-bar ${index === 20 ? 'rounded-b-md' : ''} ${index === 0 ? 'rounded-t-md' : ''} ${getConditionBarClass(hourData)}`}></div>
                <div className="time">{dayjs.unix(hourData.time).format('h a').toUpperCase()}</div>
                <div className="summary">{formatSummary(hourData, weatherData.data.weather.hourly.data, index)}</div>
                <div className="spacer">&nbsp;</div>
                <div className="condition">
                  <span className="pill">{formatCondition(hourData[hourlyConditionToShow], hourlyConditionToShow)}</span>
                </div>
              </li>
            ) : '';
          })}
          </ul>
          <div className={weatherData && weatherData.data ? 'condition-select-container' : 'condition-select-container hidden'}>
            <select className="select" onChange={changeHandler}>
              <option value="temperature">Temp (&deg;F)</option>
              <option value="apparentTemperature">Feels-Like (&deg;F)</option>
              <option value="precipProbability">Precip Prob (%)</option>
              <option value="precipIntensity">Precip Rate (IN/HR)</option>
              <option value="windSpeed">Wind (MPH)</option>
              <option value="windGust">Wind Gust (MPH)</option>
              <option value="humidity">Humidity (%)</option>
              <option value="dewPoint">Dew Point (&deg;F)</option>
              <option value="uvIndex">UV Index</option>
              <option value="cloudCover">Cloud Cover (%)</option>
              <option value="pressure">Pressure (MB)</option>
            </select>
          </div>
        </div>

        {weatherData && weatherData.data ? <SunriseSunset data={weatherData.data.weather.daily.data} /> : ''}

        <div className="daily-container">
        <ul className="daily">
          {weatherData && weatherData.data && weatherData.data.weather.daily.data.map((dayData, index) => {
            return index <= 7 ? (
              <li key={nanoid(7)} className="day">
                <div className="name">
                  <strong>{index === 0 ? 'TODAY' : dayjs.unix(dayData.time).format('ddd').toUpperCase()}</strong>
                  <br />
                  <span className="precip">
                    <FontAwesomeIcon icon={['fad', 'tint']} /> {Math.round(dayData.precipProbability * 100)}%
                  </span>
                </div>
                <div className="icon">
                  <FontAwesomeIcon icon={['fad', getWeatherIcon(dayData.icon)]} size="2x" />
                </div>
                <div className="temps">
                  {formatTemp(dayData.temperatureLow)} <span className="temps-spacer">&nbsp;</span> {formatTemp(dayData.temperatureHigh)}
                </div>
              </li>
            ) : '';
          })}
          </ul>
        </div>
      </div>
    </Fragment>
  );
}

export default hot(App);
