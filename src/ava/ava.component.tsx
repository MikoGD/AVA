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
import { AvaOptions, Line, SPEAKER } from './types';
import Tags from './tags';
/* eslint-enable */

export default function App(): React.ReactElement {
  // useStates
  // const [speech, setSpeech] = useState('');
  const [isTagsModalOpen, setIsTagsModalOpen] = useState(false);
  const [renderTags, setRenderTags] = useState(false);
  const [showTags, setShowTags] = useState(false);
  const [contextIndex, setContextIndex] = useState<number | null>(null);
  const [dictation, setDictation] = useState<string | null>(null);
  const [submit, setSubmit] = useState(false);
  const [dialogue, setDialogue] = useState<Line[]>([]);

  const options: AvaOptions = {
    modalOptions: {
      openTagModal: () => setIsTagsModalOpen(true),
      closeTagModal: () => setIsTagsModalOpen(false),
    },
    setRenderTag: (value: boolean) => setRenderTags(value),
    setShowTag: (value: boolean) => setShowTags(value),
    setContextIndex: (index: number) => {
      setContextIndex(index);
    },
    setDictation: (newDictation: string) => setDictation(newDictation),
    setSubmit: () => setSubmit(true),
  };

  const { segment, clientState, startContext, stopContext, listening } =
    useSpeechContext();

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
      setDialogue([]);
    } catch (e) {
      console.error('failed to stop listening');
      console.error(e);
    }
  }

  function addLineToDialogue(speech: string, user = true) {
    if (dialogue.length >= 10) {
      setDialogue((prev) => {
        prev.shift();
        return [...prev];
      });
    }

    const line = {
      id: dialogue.length,
      speaker: user ? SPEAKER.USER : SPEAKER.AVA,
      text: speech,
    };

    setDialogue((prev) => [...prev, line]);
  }

  function updateLastLine(speech: string) {
    if (dialogue.length === 0) {
      addLineToDialogue(speech);
    } else {
      setDialogue((prev) => {
        const lastLine = prev.pop();

        if (lastLine) {
          lastLine.text = speech;
          return [...prev, lastLine];
        }

        return prev;
      });
    }
  }

  useEffect(() => {
    const port = chrome.runtime.connect();
    port.onMessage.addListener((isActiveTab) => {
      if (!isActiveTab) {
        stopListening();
        setShowTags(false);
      }
    });

    return () => {
      port.disconnect();
    };
  }, []);

  useEffect(() => {
    if (segment) {
      const { words, isFinal } = segment;

      const sentence = wordsToSentence(words);

      updateLastLine(sentence);

      if (isFinal) {
        try {
          processSegment(segment, options);
        } catch (e) {
          addLineToDialogue(e as string, false);
        }
      }
    }
  }, [segment]);

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
      <Tags
        isTagsModalOpen={isTagsModalOpen}
        showTags={showTags}
        renderTags={renderTags}
        setShowTags={(value: boolean) => setShowTags(value)}
        linkIndex={contextIndex}
        resetLinkIndex={() => setContextIndex(null)}
        dictation={dictation}
        resetDictation={() => setDictation(null)}
        submit={submit}
        resetSubmit={() => setSubmit(false)}
      />
      <div className={classnames(styles.app, listening && styles.active)}>
        {listening ? (
          <AvaTextComponent dialogue={dialogue} />
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
}
/* eslint-enable */
