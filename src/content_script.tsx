import React from 'react';
import ReactDOM from 'react-dom';
import Ava from './ava';
/* eslint-disable */
// @ts-ignore
import styles from './content_script.scss';
/* eslint-enable */

function App(): React.ReactElement {
  return <Ava />;
}

const container = document.createElement('div');

container.setAttribute('id', 'ava-wrapper');
container.style.zIndex = '100000000000000';
container.id = styles.avaWrapper;

document.body.appendChild(container);

ReactDOM.render(<App />, container);
