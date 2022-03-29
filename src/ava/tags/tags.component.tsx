import React, { ReactElement, useEffect, useRef, useState } from 'react';
import Loader from 'react-spinners/PulseLoader';
import { useSelector } from 'react-redux';
import { TagsState, setTags } from '../../store/store';
import { Modal, ModalHeader, ModalBody } from '../../modal';
import { Tag } from '../ava-types';
import styles from './tags.module.scss';
import { createTags, onScrollStopListener } from '../../utils';
import Store from '../../store';

interface OriginalTags {
  [id: string]: Node;
}

// REVIEW:
interface TagsProps {
  isTagsOpen: boolean;
}

const textElements = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'];

export function Tags({ isTagsOpen }: TagsProps): React.ReactElement<TagsProps> {
  // states
  const { tags, showTags } = useSelector<
    TagsState,
    { tags: Tag[]; showTags: boolean }
  >((state) => state);
  const [tagElements, setTagElements] = useState<ReactElement[] | null>(null);
  const [links, setLinks] = useState<JSX.Element[] | null>(null);
  const [originalLinks, setOriginalLinks] = useState<OriginalTags | null>();
  // Refs
  const modalBodyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (tags.length > 0) {
      const newTagElements: ReactElement[] = tags.map((tag) => (
        <span {...tag} className={styles.tag} key={`${tag.children}`} />
      ));

      setTagElements(newTagElements);
    } else {
      setTagElements(null);
    }
  }, [tags]);

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
            <div id={id} className={styles.linkContainer}>
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

      setLinks(validTags);
      setOriginalLinks(ogTags);
    }
  }, [isTagsOpen]);

  useEffect(() => {
    if (originalLinks) {
      Object.entries(originalLinks).forEach(([id, anchorElement]) => {
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
  }, [originalLinks]);

  useEffect(() => {
    const removeOnScrollListener = onScrollStopListener(window, () => {
      if (showTags) {
        const newTags = createTags();

        Store.dispatch(setTags(newTags));
      }
    });

    return () => {
      removeOnScrollListener();
    };
  }, [showTags]);

  return (
    <div>
      {showTags && tagElements}
      {isTagsOpen && (
        <Modal>
          <ModalHeader>Tags</ModalHeader>
          <ModalBody ref={modalBodyRef}>
            {links !== null ? links : <Loader />}
          </ModalBody>
        </Modal>
      )}
    </div>
  );
}

export default Tags;
