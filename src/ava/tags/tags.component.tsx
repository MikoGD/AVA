import React, { ReactElement, useEffect, useRef, useState } from 'react';
import Loader from 'react-spinners/PulseLoader';
import { Modal, ModalHeader, ModalBody } from '../../modal';
import styles from './tags.module.scss';
import {
  getValidAnchorTags,
  getValidDivElements,
  getValidInputElements,
  onScrollStopListener,
  validateAnchorTag,
} from '../../utils';

export interface ValidTag {
  index: number;
  displayText: string;
  node: Element;
}

export interface ValidTags {
  [id: string]: ValidTag;
}

interface TagsProps {
  isTagsModalOpen: boolean;
  showTags: boolean;
  renderTags: boolean;
  setShowTags: (value: boolean) => void;
  linkIndex: number | null;
}

const textElements = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'];

export function Tags({
  isTagsModalOpen,
  showTags,
  renderTags,
  setShowTags,
  linkIndex,
}: TagsProps): React.ReactElement<TagsProps> {
  // states
  const [tagElements, setTagElements] = useState<ReactElement[] | null>(null);
  const [validTags, setValidTags] = useState<ValidTags | null>(null);
  // Refs
  const modalBodyRef = useRef<HTMLDivElement | null>(null);

  function getValidTagsFromPage() {
    let allValidTags: ValidTags = {};
    let index = 0;
    const getValidTagFunctions = [
      getValidAnchorTags,
      getValidInputElements,
      getValidDivElements,
    ];

    getValidTagFunctions.forEach((fn) => {
      const [newValidTags, newIndex] = fn(index);
      index = newIndex;
      allValidTags = { ...allValidTags, ...newValidTags };
    });

    return allValidTags;
  }

  useEffect(() => {
    if (linkIndex && validTags) {
      const link = Object.values(validTags).find(
        ({ index }) => linkIndex === index
      );

      if (link) {
        (link.node as HTMLAnchorElement).click();
      }
    }
  }, [linkIndex]);

  useEffect(() => {
    if (isTagsModalOpen) {
      setValidTags(getValidTagsFromPage());
    }
  }, [isTagsModalOpen]);

  function getTagPosition(elementToTag: Element) {
    const { left, top, width, height } = elementToTag.getBoundingClientRect();

    let x = left;
    let y = top;

    if (width < 50) {
      let leftPosition = left - 12.5;

      if (width < 25) {
        leftPosition = left - 25;
      }

      x = leftPosition < 0 ? 0 : leftPosition;
    }

    if (height < 50) {
      let topPosition = top - 12.5;

      if (height < 25) {
        topPosition = top - 25;
      }

      y = topPosition < 0 ? 0 : topPosition;
    }

    return [x, y];
  }

  useEffect(() => {
    if (showTags) {
      const currValidTags = getValidTagsFromPage();
      // .sort((a: ValidTag, b: ValidTag) => {
      //   if (a.index < b.index) {
      //     return -1;
      //   } else if (a.index > b.index) {
      //     return 1;
      //   }

      //   return 0;
      // });

      if (Object.keys(currValidTags).length > 0) {
        const newTagElements: ReactElement[] = Object.entries(
          currValidTags
        ).map(([id, { node, index }]) => {
          const [left, top] = getTagPosition(node);
          // console.log(`[tag] ${index}: `, node);
          // console.log(`[tag] ${index}: `, window.getComputedStyle(node));
          return (
            <span style={{ left, top }} className={styles.tag} key={id}>
              {index}
            </span>
          );
        });
        setTagElements(newTagElements);
        setValidTags(currValidTags);
      }
    } else {
      setTagElements(null);
      setValidTags(null);
    }
  }, [showTags]);

  useEffect(() => {
    const removeOnScrollStopListener = onScrollStopListener(window, () => {
      setShowTags(true);
    });

    return () => {
      removeOnScrollStopListener();
    };
  }, [showTags]);

  return (
    <div>
      {showTags && renderTags && tagElements}
      <Modal isOpen={isTagsModalOpen}>
        <ModalHeader>Tags</ModalHeader>
        <ModalBody ref={modalBodyRef}>
          {validTags ? (
            Object.entries(validTags).map(([id, validTag]) => {
              const { index, displayText } = validTag;
              return (
                <div key={id} id={id} className={styles.linkContainer}>
                  <p>
                    {`${index}.`} {displayText}
                  </p>
                </div>
              );
            })
          ) : (
            <Loader />
          )}
        </ModalBody>
      </Modal>
    </div>
  );
}

export default Tags;
