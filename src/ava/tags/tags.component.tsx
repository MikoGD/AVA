import React, { ReactElement, useEffect, useRef, useState } from 'react';
import Loader from 'react-spinners/PulseLoader';
import { Modal, ModalHeader, ModalBody } from '../../modal';
import styles from './tags.module.scss';
import { onScrollStopListener } from '../../utils';

interface ValidTag {
  index: number;
  displayText: string;
  node: Element;
}

interface ValidTags {
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
  const [removeListener, setRemoveListener] = useState<(() => void) | null>(
    null
  );
  // Refs
  const modalBodyRef = useRef<HTMLDivElement | null>(null);

  function getValidTagsFromPage() {
    const newValidTags: ValidTags = {};
    let index = 0;

    Array.from(document.getElementsByTagName('a')).forEach((tag) => {
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
        const validTag: ValidTag = {
          index,
          displayText,
          node: tag,
        };

        newValidTags[id] = validTag;
        index += 1;
      }
    });

    return newValidTags;
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

      if (Object.keys(currValidTags).length > 0) {
        const newTagElements: ReactElement[] = Object.entries(
          currValidTags
        ).map(([id, { node, index }]) => {
          const [left, top] = getTagPosition(node);
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
    }
  }, [showTags]);

  useEffect(() => {
    const removeOnScrollListener = onScrollStopListener(window, () => {
      setShowTags(true);
    });

    return () => {
      removeOnScrollListener();
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
