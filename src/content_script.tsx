import React from 'react';
import ReactDOM from 'react-dom';
import Ava from './ava';

function App(): React.ReactElement {
  return <Ava />;
}

const container = document.createElement('div');

container.setAttribute('id', 'app-wrapper');
container.style.zIndex = '100000000000000';

document.body.appendChild(container);

ReactDOM.render(<App />, container);
