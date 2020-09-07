import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Modal } from './Modal';
import './WeatherAlert.scss';

export const WeatherAlert = ({ data }) => {
  const [alertData, setAlertData] = useState(null);

  useEffect(() => {
    if (data.alerts && data.alerts.length) {
      setAlertData(data.alerts[0]);
    }

    // return () => {};
  }, [data]);

  const weatherAlertHandler = () => {
    const overlayContainer = document.getElementById('weather-alerts-modal');
    const overlay = overlayContainer.querySelector('.overlay');
    const modal = overlayContainer.querySelector('.modal');
    const elementsToHide = [overlayContainer, overlay, modal];

    overlayContainer.classList.add('fixed');
    elementsToHide.forEach(elem => elem.classList.remove('hidden'));
  };

  return alertData && alertData.length ? (
    <div className="weather-alert-container">
      <button type="button" onClick={weatherAlertHandler} className="weather-alert-button">
        <FontAwesomeIcon icon={['far', 'exclamation-circle']} />
        &nbsp;
        {alertData.title}
      </button>
      <Modal id="weather-alerts-modal" weatherAlert={true} weatherAlertData={alertData} content="" heading="" />
    </div>
  ) : '';
};

WeatherAlert.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default WeatherAlert;
