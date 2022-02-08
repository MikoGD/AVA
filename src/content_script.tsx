import { Client, Segment } from '@speechly/browser-client';
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
/* eslint-disable */
// @ts-ignore
import styles from './app.module.scss';
/* eslint-enable */

async function startListening(client: Client) {
  if (client) {
    try {
      console.log('Listening');
      await client.startContext();
    } catch (e) {
      console.error(e);
    }
  }
}

async function stopListening(client: Client) {
  if (client) {
    try {
      console.log('Stopping');
      await client.stopContext();
    } catch (e) {
      console.error(e);
    }
  }
}

function App(): React.ReactElement {
  const [isActive, setIsActive] = useState(false);
  const [speech, setSpeech] = useState('');
  const client = useRef<Client | null>(null);

  function onInitialized() {
    if (client.current) {
      client.current.onSegmentChange((segment: Segment) => {
        console.log(
          'Received new segment from the API:',
          segment.intent,
          segment.entities,
          segment.words,
          segment.isFinal
        );

        const dictation = segment.words.reduce(
          (currSpeech, currWord) => `${currSpeech} ${currWord.value}`,
          ''
        );

        console.log(dictation);

        setSpeech(dictation);
      });
    }
  }

  function handleKeyDown(event: KeyboardEvent) {
    const { key, repeat, ctrlKey, altKey } = event;

    // eslint-disable-next-line no-useless-return
    if (repeat) return;

    if (ctrlKey && altKey && (key === 'z' || key === 'Z') && client.current) {
      console.log(`isActive? ${isActive ? 'yes' : 'no'}`);
      if (!isActive) {
        setIsActive(true);
        startListening(client.current);
      } else {
        setIsActive(false);
        stopListening(client.current);
      }
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown, true);

    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isActive, client.current]);

  useEffect(() => {
    client.current = new Client({
      appId: '5a17225f-f487-454f-9e3e-87e18e4994e7',
    });
    client.current.initialize().then(
      () => {
        console.log('Speechly initialized value: ');
        onInitialized();
      },
      (reason) => {
        console.error('Speechly failed to initialized: ', reason);
      }
    );
  }, []);

  return (
    <div className={isActive ? styles.app : styles.hidden}>
      <p>{speech}</p>
    </div>
  );
}

const container = document.createElement('div');
container.setAttribute('id', 'app-wrapper');
container.style.position = 'absolute';
container.style.top = '50%';
container.style.left = '50%';
container.style.zIndex = '100000000000000';
container.style.width = '100%';
container.style.height = '100%';
document.body.appendChild(container);

ReactDOM.render(<App />, container);
