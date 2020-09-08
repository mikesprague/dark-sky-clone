import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { formatCondition, getWeatherIcon } from '../modules/helpers';
import { Conditions } from './Conditions';
import './Currently.scss';

export const Currently = ({ data }) => {
  const [currentData, setCurrentData] = useState(null);

  useEffect(() => {
    if (data) {
      setCurrentData(data);
    }

    // return () => {};
  }, [data]);

  const clickHandler = () => {
    const overlayContainer = document.getElementById('conditions-modal');
    const overlay = overlayContainer.querySelector('.overlay');
    const modal = overlayContainer.querySelector('.modal');
    const elementsToHide = [overlayContainer, overlay, modal];

    overlayContainer.classList.add('fixed');
    elementsToHide.forEach(elem => elem.classList.remove('hidden'));
  };

  return currentData ? (
    <div className="current-conditions" onClick={clickHandler}>
      <div className="icon">
        <FontAwesomeIcon
          icon={['fad', getWeatherIcon(currentData.currently.icon).icon]}
          style={getWeatherIcon(currentData.currently.icon).iconStyles}
          fixedWidth
          size="4x"
        />
      </div>
      <div className="temperature">
        <h2 className="actual-temp">{formatCondition(currentData.currently.temperature, 'temperature')}</h2>
        <h3 className="feels-like-temp">{`Feels ${formatCondition(currentData.currently.apparentTemperature, 'apparentTemperature')}`}</h3>
      </div>
      <Conditions data={currentData} />
    </div>
  ) : '';
};

Currently.propTypes = {
  data: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.array, PropTypes.object])).isRequired,
};

export default Currently;