import { SpeechSegment, Entity } from '@speechly/react-client';
import React from 'react';
import { createTags, getMaxChildScrollHeight } from '../utils';
import { Tag, ModalOptions } from './ava-types';
import Store, { clearTags, setTags } from '../store';

function handlePositionScroll(position: string) {
  Store.dispatch(clearTags(false));

  const body = document.getElementsByTagName('body')[0];
  let maxHeight = body.scrollHeight;
  let tallestChild: HTMLElement | null = null;

  if (maxHeight === 0) {
    const [height, child] = getMaxChildScrollHeight(body);
    maxHeight = height;
    tallestChild = child;
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
  Store.dispatch(clearTags(false));

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

function handleScrollIntent(segment: SpeechSegment) {
  const { entities } = segment;

  if (entities.length === 0) {
    console.error('invalid entity');
    return;
  }

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
      Store.dispatch(clearTags(true));
      return;
    }

    handleModalOptions(entities, modalOptions);
    return;
  }

  const tags = createTags();

  Store.dispatch(setTags(tags));
}

export function processSegment(
  segment: SpeechSegment,
  modalOptions: ModalOptions
) {
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
