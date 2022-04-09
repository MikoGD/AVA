import React from 'react';
import ReactDOM from 'react-dom';
import styles from './options.module.scss';

function Options() {
  return (
    <div className={styles['options-container']}>
      <h1>Ava Voice Assisant</h1>
      <h2>The best way to control your browser</h2>
    </div>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <Options />
  </React.StrictMode>,
  document.getElementById('root')
);
