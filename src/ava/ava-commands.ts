import { Segment, Entity } from '@speechly/browser-client';
import React from 'react';
import { getMaxChildScrollHeight } from '../utils';
import { Badge, ModalOptions } from './ava-types';
import Store, { clearBadges, setBadges } from '../store';
import styles from './ava.module.scss';

function handlePositionScroll(position: string) {
  const body = document.getElementsByTagName('body')[0];
  let maxHeight = body.scrollHeight;

  if (maxHeight === 0) {
    maxHeight = getMaxChildScrollHeight(body);
  }

  let scrollOptions: ScrollToOptions = {
    behavior: 'smooth',
  };

  switch (position) {
    case 'top':
      scrollOptions = { ...scrollOptions, top: 0 };
      break;
    case 'bottom':
      scrollOptions = { ...scrollOptions, top: maxHeight };
      break;
    default:
      console.error('unhandled scroll position');
  }

  window.scrollTo(scrollOptions);
}

function handleDirectionScroll(direction: string) {
  const verticalIncrement = window.visualViewport.height / 2;
  const horizontalIncrement = window.visualViewport.width / 2;

  let scrollOptions: ScrollToOptions = {
    top: 0,
    left: 0,
    behavior: 'smooth',
  };

  switch (direction) {
    case 'up':
      scrollOptions = { ...scrollOptions, top: -verticalIncrement };
      break;
    case 'down':
      scrollOptions = { ...scrollOptions, top: verticalIncrement };
      break;
    case 'left':
      scrollOptions = { ...scrollOptions, left: -horizontalIncrement };
      break;
    case 'right':
      scrollOptions = { ...scrollOptions, left: horizontalIncrement };
      break;
    default:
      console.error('unhandled scroll direction: ', direction);
  }

  window.scrollBy(scrollOptions);
}

function handleScrollIntent(segment: Segment) {
  const { entities } = segment;
  console.log('[scroll] - entities', entities);
  switch (entities[0].type) {
    case 'position':
      handlePositionScroll(entities[0].value.toLowerCase());
      break;
    case 'direction':
      handleDirectionScroll(entities[0].value.toLowerCase());
      break;
    default:
      console.error('unhandled scroll entities: ', entities);
  }
}

function handleModalOptions(entities: Entity[], modalOptions: ModalOptions) {
  let modalOption = '';
  let modalType = '';
  const tagAliases = 'TAG TAGS LINK LINKS LIST';
  const modalOptionTypes = { open: 'OPEN LIST', close: 'CLOSE' };

  entities.forEach((entity) => {
    if (entity.type === 'modal_options') {
      if (modalOptionTypes.open.includes(entity.value)) {
        modalOption = modalOptionTypes.open;
      } else {
        modalOption = modalOptionTypes.close;
      }
    }

    if (entity.type === 'modal_type') {
      if (tagAliases.includes(entity.value)) {
        modalType = tagAliases;
      }
    }
  });

  const modalCommand = `${modalOption} ${modalType}`;

  if (!modalOption || !modalType) {
    console.error('invalid modal entities', entities);
    console.log('modal command: ', modalCommand);
    return;
  }

  switch (modalCommand) {
    case `${modalOptionTypes.open} ${tagAliases}`:
      modalOptions.openTagModal();
      break;
    case `${modalOptionTypes.close} ${tagAliases}`:
      modalOptions.closeTagModal();
      break;
    default:
      console.error('unhandled modal command', modalCommand);
  }
}

function handleTagsIntent(
  entities: Entity[],
  modalOptions: ModalOptions
): React.ReactElement[] | void {
  if (entities.length > 0) {
    if (entities.some(({ type }) => type === 'hide_tags')) {
      Store.dispatch(clearBadges());
      return;
    }

    handleModalOptions(entities, modalOptions);
    return;
  }

  const badges: Badge[] = [];

  Array.from(document.getElementsByTagName('a')).forEach(
    (anchorElement: HTMLAnchorElement, index) => {
      const { left, top, width, height } =
        anchorElement.getBoundingClientRect();

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

      badges.push({
        style: { left: x, top: y },
        children: `${index}`,
      });
    }
  );

  Store.dispatch(setBadges(badges));
}

export function processSegment(segment: Segment, modalOptions: ModalOptions) {
  switch (segment.intent.intent) {
    case 'open_website':
      window.location.href = `https://${segment.entities[0].value.toLowerCase()}.com`;
      break;
    case 'scroll':
      handleScrollIntent(segment);
      break;
    case 'tags':
      handleTagsIntent(segment.entities, modalOptions);
      break;
    default:
      console.error('unhandled intent: ', segment.intent.intent);
  }
}
