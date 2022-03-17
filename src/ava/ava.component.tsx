import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Client, ClientState, Segment } from '@speechly/browser-client';
import classnames from 'classnames';
import Loader from 'react-spinners/SyncLoader';
import AvaTextComponent from './ava-speech.component';
import { Modal, ModalHeader, ModalBody } from '../modal';
import { wordsToSentence } from '../utils';
/* eslint-disable */
// @ts-ignore
import styles from './ava.module.scss';
import { processSegment } from './ava-commands';
import { ModalOptions } from './ava-types';
/* eslint-enable */

interface OriginalTags {
  [id: string]: Node;
}

const textElements = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'];

export default function App(): React.ReactElement {
  // useStates
  const [isActive, setIsActive] = useState(false);
  const [connectionState, setConnectionState] = useState(
    ClientState.Disconnected
  );
  const [speech, setSpeech] = useState('');
  const [isTagsOpen, setIsTagsOpen] = useState(false);
  // useRefs
  const client = useRef<Client | null>(null);
  const modalBodyRef = useRef<HTMLDivElement | null>(null);

  const modalOptions: ModalOptions = {
    openTagModal: () => setIsTagsOpen(true),
    closeTagModal: () => setIsTagsOpen(false),
  };

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

        const dictation = wordsToSentence(words);

        setSpeech(dictation);

        if (isFinal) {
          processSegment(segment, modalOptions);
        }
      });
    }
  }

  async function startListening() {
    if (client.current) {
      try {
        if (connectionState === ClientState.Disconnected) {
          await client.current.initialize();
          onInitialized();
        }

        await client.current.startContext();
      } catch (e) {
        console.error('failed to start listening');
        console.error(e);
      }
    }
  }

  async function stopListening() {
    if (client.current) {
      try {
        await client.current.stopContext();
        setSpeech('');
      } catch (e) {
        console.error(e);
      }
    }
  }

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
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
          setSpeech('');
        } else {
          setIsActive(true);
          setSpeech('Go to youtube');
        }
      }
    },
    [connectionState, isActive]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown, true);

    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isActive, client.current, handleKeyDown]);

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

  const [tags, setTags] = useState<JSX.Element[] | null>(null);
  const [originalTags, setOriginalTags] = useState<OriginalTags | null>();

  useEffect(() => {
    if (isTagsOpen) {
      const rawTags = Array.from(document.getElementsByTagName('a'));
      const validTags: React.ReactElement[] = [];
      const ogTags: OriginalTags = {};
      let index = 1;

      rawTags.forEach((tag) => {
        const tagClone = tag.cloneNode(true);
        const ariaLabel = tag.getAttribute('aria-label')?.trim();
        const titleAttr = tag.getAttribute('title')?.trim();
        let displayText = '';

        if (ariaLabel) {
          displayText = ariaLabel;
        } else if (titleAttr) {
          displayText = titleAttr;
        } else {
          displayText = tag.text?.trim();

          Array.from(tag.children).forEach((child) => {
            if (textElements.includes(child.nodeName)) {
              if (child.textContent) {
                displayText = child.textContent;
              }
            }
          });
        }

        const id = `${index}${displayText}`;

        if (displayText) {
          /* eslint-disable react/self-closing-comp */
          validTags.push(
            <div id={id} className={styles.tag}>
              <p key={id}>
                {`${index}.`} {displayText}
              </p>

              <div className={styles.originalTagContainer}></div>
            </div>
          );
          /* eslint-enable react/self-closing-comp */

          ogTags[id] = tagClone;
          index += 1;
        }
      });

      setTags(validTags);
      setOriginalTags(ogTags);
    }
  }, [isTagsOpen]);

  useEffect(() => {
    if (originalTags) {
      Object.entries(originalTags).forEach(([id, anchorElement]) => {
        const tag = document.getElementById(id);
        if (tag) {
          const ogTagContainer = tag.getElementsByClassName(
            styles.originalTagContainer
          )[0];

          ogTagContainer.append(anchorElement.cloneNode(true));

          const cites = ogTagContainer.getElementsByTagName('cite');

          Array.from(cites).forEach((cite) => {
            cite.remove();
          });
        }
      });
    }
  }, [originalTags]);

  /* eslint-disable */
  return (
    <>
      {isTagsOpen && (
        <Modal>
          <ModalHeader>Tags</ModalHeader>
          <ModalBody ref={modalBodyRef}>{tags ? tags : <Loader />}</ModalBody>
        </Modal>
      )}
      <div className={classnames(styles.app, isActive && styles.active)}>
        {isActive ? (
          <AvaTextComponent text={speech} />
        ) : connectionState !== ClientState.Connected ? (
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
