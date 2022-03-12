import React, { useEffect, useRef, useState } from 'react';
import { Client, ClientState, Segment } from '@speechly/browser-client';
import classnames from 'classnames';
/* eslint-disable */
// @ts-ignore
import styles from './ava.module.scss';
/* eslint-enable */

export default function App(): React.ReactElement {
  const [isActive, setIsActive] = useState(false);
  const [connectionState, setConnectionState] = useState(
    ClientState.Disconnected
  );
  const [speech, setSpeech] = useState('');
  const client = useRef<Client | null>(null);

  async function startListening() {
    if (client.current) {
      try {
        if (connectionState === ClientState.Disconnected) {
          await client.current.initialize();
        }

        console.log('Listening: ', client.current.printStats());
        await client.current.startContext();
      } catch (e) {
        console.log('failed to start listening');
        console.error(e);
      }
    }
  }

  async function stopListening() {
    if (client.current) {
      try {
        console.log('Stopping');
        await client.current.stopContext();
      } catch (e) {
        console.log('failed to stop listening');
        console.error(e);
      }
    }
  }

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
        const { intent, entities, words, isFinal } = segment;
        console.log('Received new segment from the API:');
        console.log('intent: ', intent);
        console.log('entities: ', entities);
        console.log('words: ', words);
        console.log('isFinal: ', isFinal);

        const dictation = segment.words.reduce(
          (currSpeech, currWord) =>
            `${currSpeech} ${currWord.value}${isFinal ? '.' : ''}`,
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
      if (!isActive) {
        setIsActive(true);
        startListening();
      } else {
        setIsActive(false);
        stopListening();
      }
    } else if (ctrlKey && altKey && (key === 'c' || key === 'C')) {
      if (isActive) {
        setIsActive(false);
      } else {
        setIsActive(true);
        setSpeech('Go to youtube');
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

  return (
    <div className={classnames(styles.app, isActive && styles.active)}>
      {isActive ? <p>{speech}</p> : <div className={styles.logo}>A</div>}
    </div>
  );
}
