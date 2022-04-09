import React from 'react';
import ReactDOM from 'react-dom';
import { SpeechProvider } from '@speechly/react-client';
import Ava from './ava';
import styles from './content_script.scss';

function App(): React.ReactElement {
  return (
    <SpeechProvider appId="5a17225f-f487-454f-9e3e-87e18e4994e7" debug>
      <Ava />
    </SpeechProvider>
  );
}

const container = document.createElement('div');

container.style.zIndex = '100000000000000';
container.id = styles['ava-wrapper'];
container.toggleAttribute('data-ava');
container.setAttribute('data-ava', 'ava');

document.body.appendChild(container);

ReactDOM.render(<App />, container);
