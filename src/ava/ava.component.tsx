import React, { useCallback, useEffect, useState } from 'react';
import { useSpeechContext, ClientState } from '@speechly/react-client';
import classnames from 'classnames';
import Loader from 'react-spinners/SyncLoader';
import AvaTextComponent from './ava-speech.component';
import { wordsToSentence } from '../utils';
import styles from './ava.module.scss';
import processSegment from './commands';
import { AvaOptions, avaPositions, AVA_POSITION, Line, SPEAKER } from './types';
import Tags from './tags';
import Reminder from './reminder';

export default function App(): React.ReactElement {
  // states
  const [isTagsModalOpen, setIsTagsModalOpen] = useState(false);
  const [renderTags, setRenderTags] = useState(false);
  const [showTags, setShowTags] = useState(false);
  const [contextIndex, setContextIndex] = useState<number | null>(null);
  const [dictation, setDictation] = useState<string | null>(null);
  const [submit, setSubmit] = useState(false);
  const [dialogue, setDialogue] = useState<Line[]>([]);
  const [avaPosition, setAvaPosition] = useState(AVA_POSITION.BOTTOM_LEFT);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);

  const options: AvaOptions = {
    modalOptions: {
      openTagModal: () => setIsTagsModalOpen(true),
      closeTagModal: () => setIsTagsModalOpen(false),
      setIsReminderOpen: (isOpen: boolean) => setIsReminderModalOpen(isOpen),
    },
    setRenderTag: (value: boolean) => setRenderTags(value),
    setShowTag: (value: boolean) => setShowTags(value),
    setContextIndex: (index: number) => {
      setContextIndex(index);
    },
    setDictation: (newDictation: string) => setDictation(newDictation),
    setSubmit: () => setSubmit(true),
    setAvaPosition: (position: AVA_POSITION) => {
      if (position === avaPosition) {
        const index = avaPositions.findIndex(
          (currPosition) => currPosition === position
        );

        const newPosition = avaPositions[(index + 1) % 4];

        setAvaPosition(newPosition);

        return;
      }

      setAvaPosition(position);
    },
  };

  const { segment, clientState, startContext, stopContext, listening } =
    useSpeechContext();
  // const { segment, clientState, startContext, stopContext } =

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
      isFinal: !user,
    };

    setDialogue((prev) => [...prev, line]);
  }

  function updateLastLine(speech: string, isFinal = false) {
    let lastLine = dialogue[dialogue.length - 1];
    if (
      dialogue.length === 0 ||
      (lastLine && (lastLine.speaker === SPEAKER.AVA || lastLine.isFinal))
    ) {
      addLineToDialogue(speech);
    } else {
      setDialogue((prev) => {
        if (prev.length > 0) {
          // Ignore as array length is already checked if it is empty
          // eslint-disable-next-line
          lastLine = prev.pop()!;

          if (lastLine) {
            return [...prev, { ...lastLine, text: speech, isFinal }];
          }
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

      updateLastLine(sentence, isFinal);

      if (isFinal) {
        try {
          processSegment(segment, options);
        } catch (e) {
          if (e instanceof Error) {
            addLineToDialogue(e.message, false);
          }
        }
      }
    }
  }, [segment]);

  // const [listening, setListening] = useState(false);

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
          // setListening(true);
          setTimeout(() => {
            setDialogue((prev) => [
              ...prev,
              {
                id: 0,
                speaker: SPEAKER.USER,
                text: 'Tags',
                isFinal: true,
              },
            ]);
          }, 2000);
          setTimeout(() => {
            setDialogue((prev) => [
              ...prev,
              {
                id: 1,
                speaker: SPEAKER.AVA,
                text: "I'm sorry, could you repeat that again",
                isFinal: true,
              },
            ]);
          }, 4000);
        } else {
          // setListening(false);
          setDialogue([]);
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
      <Reminder isOpen={isReminderModalOpen} />
      <div
        className={classnames(styles.app, listening && styles.active, {
          [styles['top-left']]: avaPosition === AVA_POSITION.TOP_LEFT,
          [styles['top-right']]: avaPosition === AVA_POSITION.TOP_RIGHT,
          [styles['bottom-right']]: avaPosition === AVA_POSITION.BOTTOM_RIGHT,
          [styles['bottom-left']]: avaPosition === AVA_POSITION.BOTTOM_LEFT,
        })}
        ref={dialogueRef}
      >
        {listening ? (
          <AvaTextComponent dialogue={dialogue} />
        ) : clientState < ClientState.Preinitialized ? (
          <Loader size={10} />
        ) : (
          <div className={styles.logo}>
            <p>A</p>
          </div>
        )}
      </div>
    </>
  );
}
/* eslint-enable */
