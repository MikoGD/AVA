import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
/* eslint-disable */
// @ts-ignore
import styles from './options.module.scss';
/* eslint-enable */

function Options() {
  const [error, setError] = useState('');
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(
      () => console.log('Mic permissions received'),
      (reason) => {
        console.log(`failed to get permssions: ${reason}`);
        setError('failed to get mic permissions');
      }
    );
  }, []);

  return (
    <div className={styles.optionsContainer}>
      <h1>Ava Voice Assisant</h1>
      <h2>The best way to control your browser</h2>
      {error ? <h2>{error}</h2> : null}
    </div>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <Options />
  </React.StrictMode>,
  document.getElementById('root')
);
