import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import {
  MapContainer, Marker, TileLayer, WMSTileLayer, LayersControl, ScaleControl, ZoomControl,
} from 'react-leaflet';
import { getRadarTs } from '../modules/helpers';
import { getData } from '../modules/local-storage';
import './WeatherMapFull.scss';

// {/* <TileLayer
// url="https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/nexrad-n0q-900913/{z}/{x}/{y}.png"
// layers="nexrad-n0q-900913"
// transparent="true"
// /> */}

export const WeatherMapFull = ({ OPENWEATHERMAP_API_KEY }) => {
  const [mapView, setMapView] = useState('radar');
  const coordinates = getData('coordinates') || null;

  useEffect(() => {
    if (!coordinates) {
      window.location.replace('/');
    }

    // return () => {};
  }, [coordinates]);

  const changeHandler = (event) => {
    // console.log(event.target.value);
    setMapView(event.target.value);
  };

  return (
    <div className="contents">
      <div className="header">
        <div className="section-name">
          <select onChange={changeHandler}>
            <option value="radar">Radar</option>
            <option value="precipitation_new">Precipitation</option>
            <option value="clouds_new">Clouds</option>
            <option value="temp_new">Temperature</option>
            <option value="wind_new">Wind Speed</option>
            <option value="pressure_new">Sea Level Pressure</option>
          </select>
        </div>
      </div>
      <div className="h-full min-h-screen contents v-full">
        <div className="relative min-h-screen map-container">
          <MapContainer
            animate={true}
            boxZoom={true}
            center={[coordinates.lat, coordinates.lng]}
            doubleClickZoom={true}
            dragging={true}
            id="weather-map-full"
            keyboard={false}
            scrollWheelZoom={false}
            tap={true}
            touchZoom={true}
            zoom={9}
            zoomControl={false}
          >
            <Marker position={[coordinates.lat, coordinates.lng]} opacity={0.9} />
            <ScaleControl position="topleft" />
            <ZoomControl position="topleft" />
            <LayersControl>
              <LayersControl.BaseLayer name="Dark" checked>
                <TileLayer
                  url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png"
                  opacity={1}
                  zIndex={1}
                  attribution={'&copy; <a href="https://carto.com/" rel="noopener noreferrer" target="_blank">CARTO</a>'}
                />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer name="Light">
                <TileLayer
                  url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png"
                  opacity={1}
                  zIndex={1}
                  attribution={'&copy; <a href="https://carto.com/" rel="noopener noreferrer" target="_blank">CARTO</a>'}
                />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer name="Street">
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  opacity={0.8}
                  zIndex={1}
                  attribution={'&copy; <a href="https://osm.org/copyright" rel="noopener noreferrer" target="_blank">OpenStreetMap</a> contributors'}
                />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer name="Street (Gray)">
                <TileLayer
                  url="https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png"
                  opacity={0.8}
                  zIndex={1}
                  attribution={'&copy; <a href="https://osm.org/copyright" rel="noopener noreferrer" target="_blank">OpenStreetMap</a> contributors'}
                />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer name="Black/White">
                <TileLayer
                  url="https://stamen-tiles.a.ssl.fastly.net/toner/{z}/{x}/{y}@2x.png"
                  opacity={0.9}
                  zIndex={1}
                  attribution={'&copy; <a href="https://stamen.com" rel="noopener noreferrer" target="_blank">Stamen Design</a>'}
                />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer name="Black/White/Gray">
                <TileLayer
                  url="https://stamen-tiles.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}@2x.png"
                  opacity={0.9}
                  zIndex={1}
                  attribution={'&copy; <a href="https://stamen.com" rel="noopener noreferrer" target="_blank">Stamen Design</a>'}
                />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer name="Watercolor">
                <TileLayer
                  url="https://stamen-tiles.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg"
                  opacity={0.9}
                  zIndex={1}
                  attribution={'&copy; <a href="https://stamen.com" rel="noopener noreferrer" target="_blank">Stamen Design</a>'}
                />
              </LayersControl.BaseLayer>
              <LayersControl.Overlay name="Conditions" checked>
                {mapView === 'radar' ? (
                  <TileLayer
                    url={`https://tilecache.rainviewer.com/v2/radar/${getRadarTs()}/512/{z}/{x}/{y}/8/1_1.png`}
                    opacity={0.75}
                    attribution={'&copy; <a href="https://rainviewer.com/" rel="noopener noreferrer" target="_blank">RainViewer</a>'}
                  />
                ) : (
                  <WMSTileLayer
                    url={`https://tile.openweathermap.org/map/${mapView}/{z}/{x}/{y}.png?appid=${OPENWEATHERMAP_API_KEY}`}
                    attribution={'&copy; <a href="https://openweathermap.org/" rel="noopener noreferrer" target="_blank">OpenWeatherMap</a>'}
                  />
                )}
              </LayersControl.Overlay>
            </LayersControl>
          </MapContainer>
          <div className={(mapView === 'radar' || mapView === 'temp_new') ? 'radar-key' : 'hidden'}>
            <img src={`/images/${mapView === 'radar' ? 'radar' : 'temp'}-key.png`} alt={`${mapView === 'radar' ? 'Radar' : 'Temperature'} Map Key`} />
          </div>
        </div>
      </div>
    </div>
  );
};

WeatherMapFull.propTypes = {
  OPENWEATHERMAP_API_KEY: PropTypes.string.isRequired,
};

export default WeatherMapFull;
