import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

function Popup(): React.ReactElement {
  return (
    <div>
      <h1>Ava Voice Assisant</h1>
      <h2>The best way to control your browser</h2>
    </div>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>,
  document.getElementById('root')
);
