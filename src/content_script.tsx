import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { SpeechProvider } from '@speechly/react-client';
import Ava from './ava';
import Store from './store';
/* eslint-disable */
// @ts-ignore
import styles from './content_script.scss';
/* eslint-enable */

function App(): React.ReactElement {
  return (
    <SpeechProvider appId="5a17225f-f487-454f-9e3e-87e18e4994e7" debug>
      <Provider store={Store}>
        <Ava />
      </Provider>
    </SpeechProvider>
  );
}

const container = document.createElement('div');

container.style.zIndex = '100000000000000';
container.id = styles.avaWrapper;
container.toggleAttribute('data-ava');
container.setAttribute('data-ava', 'ava');

document.body.appendChild(container);

ReactDOM.render(<App />, container);
