import { SpeechSegment, Entity } from '@speechly/react-client';
import React from 'react';
import { getMaxChildScrollHeight } from '../utils';
import { AvaOptions, ModalOptions } from './ava-types';

function handlePositionScroll(position: string, options: AvaOptions) {
  options.setShowTag(false);

  const body = document.getElementsByTagName('body')[0];
  let maxHeight = body.scrollHeight;

  if (maxHeight === 0) {
    const [height] = getMaxChildScrollHeight(body);
    maxHeight = height;
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

function handleDirectionScroll(direction: string, options: AvaOptions) {
  options.setShowTag(false);

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

function handleScrollIntent(segment: SpeechSegment, options: AvaOptions) {
  const { entities } = segment;

  if (entities.length === 0) {
    console.error('invalid entity');
    return;
  }

  switch (entities[0].type) {
    case 'position':
      handlePositionScroll(entities[0].value.toLowerCase(), options);
      break;
    case 'direction':
      handleDirectionScroll(entities[0].value.toLowerCase(), options);
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
  options: AvaOptions
): React.ReactElement[] | void {
  if (entities.length > 0) {
    if (entities.some(({ type }) => type === 'hide_tags')) {
      options.setRenderTag(false);
      options.setShowTag(false);
      return;
    }

    handleModalOptions(entities, options.modalOptions);
    return;
  }

  options.setRenderTag(true);
  options.setShowTag(true);
}

export function processSegment(segment: SpeechSegment, options: AvaOptions) {
  switch (segment.intent.intent) {
    case 'open_website':
      console.log('[open_website] - entities', segment.entities);
      window.location.href = `https://${segment.entities[0].value}`;
      break;
    case 'scroll':
      handleScrollIntent(segment, options);
      break;
    case 'tags':
      handleTagsIntent(segment.entities, options);
      break;
    case 'index':
      console.log('[processSegment] - index intent', segment.entities[0]);
      options.setContextIndex(Number(segment.entities[0].value));
      break;
    default:
      console.error('unhandled intent: ', segment.intent.intent);
  }
}
