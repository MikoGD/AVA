import React from 'react';
import ReactDOM from 'react-dom';
import Ava from './ava';

function App(): React.ReactElement {
  return <Ava />;
}

const container = document.createElement('div');

container.setAttribute('id', 'app-wrapper');
container.style.position = 'absolute';
container.style.top = '50%';
container.style.left = '50%';
container.style.zIndex = '100000000000000';
container.style.width = '100%';
container.style.height = '100%';
// hello

document.body.appendChild(container);

ReactDOM.render(<App />, container);
