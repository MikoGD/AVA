import React, { ReactElement, useEffect, useRef, useState } from 'react';
import Loader from 'react-spinners/PulseLoader';
import { Modal, ModalHeader, ModalBody } from '../../modal';
import styles from './tags.module.scss';
import {
  getTagPosition,
  getValidAnchorTags,
  getValidDivElements,
  getValidInputElements,
  getValidTagsFromPage,
  onScrollStopListener,
  validateAnchorTag,
} from '../../utils';

export interface ValidTag {
  id: string;
  index: number;
  displayText: string;
  node: Element;
}

interface TagsProps {
  isTagsModalOpen: boolean;
  showTags: boolean;
  renderTags: boolean;
  setShowTags: (value: boolean) => void;
  linkIndex: number | null;
  resetLinkIndex: () => void;
}

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

export function Tags({
  isTagsModalOpen,
  showTags,
  renderTags,
  setShowTags,
  linkIndex,
  resetLinkIndex,
}: TagsProps): React.ReactElement<TagsProps> {
  // states
  const [tagElements, setTagElements] = useState<ReactElement[] | null>(null);
  const [validTags, setValidTags] = useState<ValidTag[] | null>(null);
  // Refs
  const modalBodyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (linkIndex && validTags) {
      const tag = Object.values(validTags).find(
        ({ index }) => linkIndex === index
      );

      if (tag) {
        (tag.node as HTMLElement).click();
      }
    }
  }, [linkIndex]);

  useEffect(() => {
    const mutationObserver = new MutationObserver(() => {
      if (showTags) {
        const [currValidTags, newTagElements] = createTags();

        if (currValidTags && newTagElements) {
          setTagElements([...newTagElements]);
          setValidTags([...currValidTags]);
        }
      }
    });

    mutationObserver.observe(document.documentElement, {
      subtree: true,
      childList: true,
    });

    return () => {
      mutationObserver.disconnect();
    };
  }, [showTags]);

  useEffect(() => {
    if (isTagsModalOpen) {
      setValidTags(getValidTagsFromPage());
    }
  }, [isTagsModalOpen]);

  useEffect(() => {
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
            validTags.map(({ id, index, displayText }) => {
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
