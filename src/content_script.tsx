import { Client, Segment, ClientState } from '@speechly/browser-client';
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
/* eslint-disable */
// @ts-ignore
import styles from './app.module.scss';
/* eslint-enable */

async function startListening(client: Client, connectionState: ClientState) {
  if (client) {
    try {
      if (connectionState === ClientState.Disconnected) {
        await client.initialize();
      }

      console.log('Listening: ', client.printStats());
      await client.startContext();
    } catch (e) {
      console.log('failed to start listening');
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
      console.log('failed to stop listening');
      console.error(e);
    }
  }
}

function App(): React.ReactElement {
  const [isActive, setIsActive] = useState(false);
  const [speech, setSpeech] = useState('');
  const [connectionState, setConnectionState] = useState(
    ClientState.Disconnected
  );
  const [error, setError] = useState<string | null>(null);
  const client = useRef<Client | null>(null);

  function processSegment(segment: Segment) {
    switch (segment.intent.intent) {
      case 'open_website':
        window.location.href = `https://${segment.entities[0].value.toLowerCase()}.com`;
        break;
      default:
        console.error('unhandled intent: ', segment.intent.intent);
    }
  }

  async function onInitialized() {
    if (client.current) {
      setConnectionState(ClientState.Connected);
      client.current.onStateChange((state) => {
        setConnectionState(state);
      });

      client.current.onSegmentChange((segment: Segment) => {
        console.log('Received new segment from the API:');

        console.log('intent: ', segment.intent);
        console.log('entities: ', segment.entities);
        console.log('words: ', segment.words);
        console.log('isFinal: ', segment.isFinal);

        const dictation = segment.words.reduce(
          (currSpeech, currWord) => `${currSpeech} ${currWord.value}`,
          ''
        );

        console.log(dictation);

        setSpeech(dictation);
        processSegment(segment);
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
        startListening(client.current, connectionState);
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
      debug: true,
      logSegments: true,
    });

    client.current.initialize().then(
      () => {
        onInitialized();
      },
      () => {
        console.error('failed to initialize AVA');
      }
    );
  }, []);

  async function initializeAva() {
    client.current = new Client({
      appId: '5a17225f-f487-454f-9e3e-87e18e4994e7',
      debug: true,
      logSegments: true,
    });

    try {
      await client.current.initialize();
      onInitialized();
    } catch (e) {
      setError('failed to initialize');
    }
  }

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
