import React, { ReactElement, useEffect, useRef, useState } from 'react';
import Loader from 'react-spinners/PulseLoader';
import { Modal, ModalHeader, ModalBody } from '../../modal';
import styles from './tags.module.scss';
import {
  ariaTextRoles,
  getTagPosition,
  getValidTagsFromPage,
  onScrollStopListener,
  updateTags,
} from '../../utils';
import { ValidTag } from './types';

export interface TagsProps {
  isTagsModalOpen: boolean;
  showTags: boolean;
  renderTags: boolean;
  setShowTags: (value: boolean) => void;
  linkIndex: number | null;
  resetLinkIndex: () => void;
  dictation: string | null;
  resetDictation: () => void;
  submit: boolean;
  resetSubmit: () => void;
}

export function Tags({
  isTagsModalOpen,
  showTags,
  renderTags,
  setShowTags,
  linkIndex,
  resetLinkIndex,
  dictation,
  resetDictation,
  submit,
  resetSubmit,
}: TagsProps): React.ReactElement<TagsProps> {
  // states
  const [tagElements, setTagElements] = useState<ReactElement[] | null>(null);
  const [validTags, setValidTags] = useState<ValidTag[] | null>(null);
  const [focusedTextInput, setFocusedTextInput] =
    useState<HTMLInputElement | null>();
  // Refs
  const modalBodyRef = useRef<HTMLDivElement | null>(null);

  function createTags(): [ValidTag[], ReactElement[]] | [] {
    const currValidTags = getValidTagsFromPage();
    if (currValidTags.length > 0) {
      const newTagElements: ReactElement[] = currValidTags.map(
        ({ id, node, index }) => {
          const [left, top] = getTagPosition(node);
          return (
            <span style={{ left, top }} className={styles.tag} key={id}>
              {index}
            </span>
          );
        }
      );

      return [currValidTags, newTagElements];
    }

    return [];
  }

  useEffect(() => {
    if (dictation && focusedTextInput) {
      focusedTextInput.value = dictation;
      resetDictation();
    }
  }, [dictation, focusedTextInput]);

  useEffect(() => {
    if (submit && focusedTextInput) {
      let parent = focusedTextInput.parentElement;

      while (parent) {
        if (parent.tagName === 'FORM') {
          (parent as HTMLFormElement).submit();
          resetSubmit();
          break;
        }

        parent = parent.parentElement;
      }
    }
  }, [submit, focusedTextInput]);

  useEffect(() => {
    if (linkIndex && validTags) {
      const tag = Object.values(validTags).find(
        ({ index }) => linkIndex === index
      );

      if (tag) {
        const { node } = tag;
        const role = node.getAttribute('role');
        if (
          (node.tagName.toLowerCase() === 'input' &&
            node.getAttribute('type') === 'text') ||
          (role && ariaTextRoles.includes(role))
        ) {
          (tag.node as HTMLInputElement).focus();
          setFocusedTextInput(tag.node as HTMLInputElement);
        } else {
          (tag.node as HTMLElement).click();
        }
        resetLinkIndex();
      }
    }
  }, [linkIndex]);

  useEffect(() => {
    if (isTagsModalOpen) {
      setValidTags(getValidTagsFromPage());
    }
  }, [isTagsModalOpen]);

  useEffect(() => {
    let mutationObservers: MutationObserver[] = [];
    if (showTags) {
      Array.from(document.body.children).forEach((child) => {
        if (!child.getAttribute('data-ava')) {
          const currMutationObserver = new MutationObserver(() => {
            if (showTags) {
              const [currValidTags, newTagElements] = createTags();

              if (currValidTags && newTagElements) {
                updateTags(() => {
                  setTagElements([...newTagElements]);
                  setValidTags([...currValidTags]);
                });
              }
            }
          });

          // Watch DOM for changes to update tags
          currMutationObserver.observe(child, {
            subtree: true,
            childList: true,
          });

          mutationObservers.push(currMutationObserver);
        }
      });
    }

    const removeOnScrollStopListener = onScrollStopListener(window, () => {
      setShowTags(true);
    });

    if (showTags) {
      const [currValidTags, newTagElements] = createTags();

      if (currValidTags && newTagElements) {
        setTagElements(newTagElements);
        setValidTags(currValidTags);
      }
    } else {
      setTagElements(null);
      setValidTags(null);
    }

    return () => {
      removeOnScrollStopListener();

      if (mutationObservers.length > 0) {
        mutationObservers.forEach((observer) => observer.disconnect());
        mutationObservers = [];
      }
    };
  }, [showTags]);

  return (
    <div>
      {showTags && renderTags && tagElements}
      <Modal isOpen={isTagsModalOpen}>
        <ModalHeader>Tags</ModalHeader>
        <ModalBody ref={modalBodyRef}>
          {validTags ? (
            validTags.map(({ id, index, displayText }) => (
              <div key={id} id={id} className={styles['link-container']}>
                <p>
                  {`${index}.`} {displayText}
                </p>
              </div>
            ))
          ) : (
            <Loader />
          )}
        </ModalBody>
      </Modal>
    </div>
  );
}

export default Tags;
