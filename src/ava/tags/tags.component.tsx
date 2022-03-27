import React, { ReactElement, useEffect, useRef, useState } from 'react';
import Loader from 'react-spinners/PulseLoader';
import { useSelector } from 'react-redux';
import { TagsState } from '../../store/store';
import { Modal, ModalHeader, ModalBody } from '../../modal';
import { Badge } from '../ava-types';
import styles from './tags.module.scss';

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
  const badges = useSelector<TagsState, Badge[]>((state) => state.badges);
  const [badgesElement, setBadgesElement] = useState<ReactElement[] | null>(
    null
  );
  const [tags, setTags] = useState<JSX.Element[] | null>(null);
  const [originalTags, setOriginalTags] = useState<OriginalTags | null>();
  // Refs
  const modalBodyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    console.log('[badges] - useEffect, badges: ', badges);
    if (badges.length > 0) {
      const badgesElementTemp: ReactElement[] = badges.map((badge) => {
        console.log(badge);
        return (
          <span
            {...badge}
            className={styles.tagBadge}
            key={`${badge.children}`}
          />
        );
      });

      setBadgesElement(badgesElementTemp);
    } else {
      setBadgesElement(null);
    }
  }, [badges]);

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

  return (
    <>
      {badgesElement}
      {isTagsOpen && (
        <Modal>
          <ModalHeader>Tags</ModalHeader>
          <ModalBody ref={modalBodyRef}>
            {tags !== null ? tags : <Loader />}
          </ModalBody>
        </Modal>
      )}
    </>
  );
}

export default Tags;
