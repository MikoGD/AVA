import React, { useCallback, useEffect, useState } from 'react';
import { useSpeechContext, ClientState } from '@speechly/react-client';
import classnames from 'classnames';
import Loader from 'react-spinners/SyncLoader';
import AvaTextComponent from './ava-speech.component';
import { wordsToSentence } from '../utils';
/* eslint-disable */
// @ts-ignore
import styles from './ava.module.scss';
import { processSegment } from './ava-commands';
import { ModalOptions } from './ava-types';
import Tags from './tags';
/* eslint-enable */

export default function App(): React.ReactElement {
  // useStates
  const [speech, setSpeech] = useState('');
  const [isTagsOpen, setIsTagsOpen] = useState(false);

  const modalOptions: ModalOptions = {
    openTagModal: () => setIsTagsOpen(true),
    closeTagModal: () => setIsTagsOpen(false),
  };

  const { segment, clientState, startContext, stopContext, listening } =
    useSpeechContext();

  useEffect(() => {
    if (segment) {
      const { intent, entities, words, isFinal } = segment;
      console.log('Received new segment from the API:');
      console.log('intent: ', intent);
      console.log('entities: ', entities);
      console.log('words: ', words);
      console.log('isFinal: ', isFinal);

      const dictation = wordsToSentence(words);

      setSpeech(dictation);

      if (isFinal) {
        processSegment(segment, modalOptions);
      }
    }
  }, [segment]);

  async function startListening() {
    try {
      await startContext();
    } catch (e) {
      console.error('failed to start listening');
      console.error(e);
    }
  }

  async function stopListening() {
    try {
      await stopContext();
      setSpeech('');
    } catch (e) {
      console.error('failed to stop listening');
      console.error(e);
    }
  }

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const { key, repeat, ctrlKey, altKey } = event;

      // eslint-disable-next-line no-useless-return
      if (repeat) return;

      if (ctrlKey && altKey && (key === 'z' || key === 'Z')) {
        if (!listening) {
          startListening();
        } else {
          stopListening();
        }
      } else if (ctrlKey && altKey && (key === 'c' || key === 'C')) {
        if (!listening) {
          setSpeech('Go to youtube');
        } else {
          setSpeech('');
        }
      }
    },
    [listening]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown, true);

    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [listening, handleKeyDown]);

  /* eslint-disable */
  return (
    <>
      <Tags isTagsOpen={isTagsOpen} />
      <div className={classnames(styles.app, listening && styles.active)}>
        {listening ? (
          <AvaTextComponent text={speech} />
        ) : clientState < ClientState.Preinitialized ? (
          <Loader size={10} />
        ) : (
          <div>
            <p>A</p>
          </div>
        )}
      </div>
    </>
  );
  /* eslint-enable */
}
