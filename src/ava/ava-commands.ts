import { SpeechSegment, Entity } from '@speechly/react-client';
import React from 'react';
import { getMaxChildScrollHeight, wordsToSentence } from '../utils';
import { AvaOptions, INTENTS, ModalOptions, Disposition, noop } from './types';

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

function handleTabIntent(segment: SpeechSegment) {
  let isCloseAction = false;
  let indexEntityValue = -1;
  let website = '';

  segment.entities.forEach((entity) => {
    const { type, value } = entity;

    if (type === 'action') {
      if (value.toLowerCase() === 'close') {
        isCloseAction = true;
      }
    }

    if (type === 'index') {
      indexEntityValue = Number(entity.value);
    }

    if (type === 'website') {
      website = entity.value;
    }
  });

  if (isCloseAction) {
    if (indexEntityValue) {
      chrome.runtime.sendMessage({
        intent: INTENTS.TAB,
        action: 'close',
        tabPosition: indexEntityValue,
      });
      return;
    }

    chrome.runtime.sendMessage({ intent: INTENTS.TAB, action: 'close' });
    return;
  }

  if (indexEntityValue > 0) {
    chrome.runtime.sendMessage({
      intent: INTENTS.TAB,
      action: 'open',
      tabPosition: indexEntityValue,
    });
  } else {
    chrome.runtime.sendMessage({ intent: INTENTS.TAB, action: 'new', website });
  }
}

function handleRefreshIntent() {
  chrome.runtime.sendMessage({ intent: INTENTS.REFRESH });
}

function handleNavigationIntent(segment: SpeechSegment) {
  if (segment.entities.length > 0) {
    const { value } = segment.entities[0];

    if (value) {
      chrome.runtime.sendMessage({
        intent: INTENTS.NAVIGATION,
        action: value.toLowerCase(),
      });
    }
  }
}

function handleDictationIntent(segment: SpeechSegment, options: AvaOptions) {
  const { entities } = segment;
  if (entities.length > 0) {
    /* eslint-disable */
    debugger;
    /* eslint-enable */

    const dictateIndex = segment.words.findIndex(({ value }) =>
      'dictate dictation'.includes(value.toLowerCase())
    );

    if (dictateIndex > -1) {
      const dictation = segment.words
        .slice(dictateIndex + 1)
        .reduce(
          (currDictation, word) =>
            `${currDictation} ${word.value.toLowerCase()}`,
          ''
        );

      if (dictation) {
        options.setDictation(dictation);
      }
    }
  }
}

function handleSubmitIntent(options: AvaOptions) {
  options.setSubmit();
}

function handleSearchIntent(segment: SpeechSegment) {
  const { entities } = segment;
  if (entities.length > 0) {
    let whereIndex = -1;
    let whereValue = '';
    let browserLocationValue = '';
    let actionIndex = -1;
    let actionValue = '';

    const sentence = wordsToSentence(segment.words).trim().toLowerCase();

    entities.forEach((entity) => {
      if (entity.type === 'where') {
        whereIndex = sentence.indexOf(entity.value.toLowerCase());
        whereValue = entity.value.toLowerCase();
      }

      if (entity.type === 'browser_location') {
        browserLocationValue = entity.value.toLowerCase();
      }

      if (entity.type === 'action') {
        actionIndex = sentence.indexOf(entity.value.toLowerCase());
        actionValue = entity.value.toLowerCase();
      }
    });

    if (actionIndex > -1 && actionValue) {
      if (whereIndex > -1 && whereValue && browserLocationValue) {
        const query = Array.from(sentence)
          .slice(actionIndex + actionValue.length, whereIndex - 3)
          .join('');

        const locations: { [key: string]: Disposition } = {
          window: 'NEW_WINDOW',
          tab: 'NEW_TAB',
        };

        chrome.runtime.sendMessage(
          {
            intent: INTENTS.SEARCH,
            search: {
              query,
              disposition: locations[browserLocationValue] ?? 'CURRENT_TAB',
            },
          },
          noop
        );
      } else {
        const query = Array.from(sentence)
          .splice(actionIndex + actionValue.length)
          .join('');

        chrome.runtime.sendMessage(
          {
            intent: INTENTS.SEARCH,
            search: {
              query,
              disposition: 'CURRENT_TAB',
            },
          },
          noop
        );
      }
    }
  }
}

export function processSegment(segment: SpeechSegment, options: AvaOptions) {
  if (
    segment.words.find(({ value }) =>
      'dictate dictation'.includes(value.toLowerCase())
    )
  ) {
    segment.intent.intent = 'dictation';
  }

  switch (segment.intent.intent) {
    case INTENTS.OPEN_WEBSITE:
      window.location.href = `https://${segment.entities[0].value}`;
      break;
    case INTENTS.SCROLL:
      handleScrollIntent(segment, options);
      break;
    case INTENTS.TAGS:
      handleTagsIntent(segment.entities, options);
      break;
    case INTENTS.INDEX:
      options.setContextIndex(Number(segment.entities[0].value));
      break;
    case INTENTS.TAB:
      handleTabIntent(segment);
      break;
    case INTENTS.REFRESH:
      handleRefreshIntent();
      break;
    case INTENTS.NAVIGATION:
      handleNavigationIntent(segment);
      break;
    case INTENTS.DICTATION:
      handleDictationIntent(segment, options);
      break;
    case INTENTS.SUBMIT:
      handleSubmitIntent(options);
      break;
    case INTENTS.SEARCH:
      handleSearchIntent(segment);
      break;
    default:
      console.error('unhandled intent: ', segment.intent.intent);
  }
}
