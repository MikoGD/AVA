import { SpeechSegment, Entity } from '@speechly/react-client';
import React from 'react';
import { Message } from '../background';
import {
  getActionTypeFromEntity,
  getMaxChildScrollHeight,
  getModalTypeFromEntity,
  wordsToSentence,
} from '../utils';
import {
  AvaOptions,
  INTENTS,
  ModalOptions,
  Disposition,
  ENTITY_TYPES,
  AVA_POSITION,
  MODAL_TYPES,
  ACTION_TYPES,
} from './types';

function sendMessageToBackground(
  message: Message,
  responseCallback?: (response: string) => void
) {
  chrome.runtime.sendMessage(message, (response: string) => {
    if (responseCallback) {
      responseCallback(response);
    } else {
      throw new Error(response);
    }
  });
}

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
      throw new Error("I'm sorry could you repeat that");
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
      throw new Error('I could not understand, can you repeat that?');
  }

  window.scrollBy(scrollOptions);
}

function handleScrollIntent(segment: SpeechSegment, options: AvaOptions) {
  const { entities } = segment;

  if (entities.length === 0) {
    throw new Error('Could you repeat that?');
  }

  switch (entities[0].type) {
    case 'position':
      handlePositionScroll(entities[0].value.toLowerCase(), options);
      break;
    case 'direction':
      handleDirectionScroll(entities[0].value.toLowerCase(), options);
      break;
    default:
      throw new Error('Could you repeat that?');
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

    throw new Error("I'm sorry could you repeat that?");
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
      sendMessageToBackground({
        intent: INTENTS.TAB,
        action: 'close',
        tabPosition: indexEntityValue,
      });

      return;
    }

    sendMessageToBackground({ intent: INTENTS.TAB, action: 'close' });
    return;
  }

  if (indexEntityValue > 0) {
    sendMessageToBackground({
      intent: INTENTS.TAB,
      action: 'open',
      tabPosition: indexEntityValue,
    });
  } else {
    sendMessageToBackground({ intent: INTENTS.TAB, action: 'new', website });
  }
}

function handleRefreshIntent() {
  chrome.runtime.sendMessage({ intent: INTENTS.REFRESH });
}

function handleNavigationIntent(segment: SpeechSegment) {
  if (segment.entities.length > 0) {
    const { value } = segment.entities[0];

    if (value) {
      chrome.runtime.sendMessage(
        {
          intent: INTENTS.NAVIGATION,
          action: value.toLowerCase(),
        },
        (response: string) => {
          throw new Error(response);
        }
      );
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

        sendMessageToBackground({
          intent: INTENTS.SEARCH,
          search: {
            query,
            disposition: locations[browserLocationValue] ?? 'CURRENT_TAB',
          },
        });
      } else {
        const query = Array.from(sentence)
          .splice(actionIndex + actionValue.length)
          .join('');

        sendMessageToBackground({
          intent: INTENTS.SEARCH,
          search: {
            query,
            disposition: 'CURRENT_TAB',
          },
        });
      }
    }
  }
}

function handleAvaMoveIntent(segment: SpeechSegment, options: AvaOptions) {
  const { entities } = segment;

  if (entities.length < 1) {
    throw new Error("I'm sorry could you repeat that again");
  }
  const positionEntity = entities.find(
    ({ type }) => type === ENTITY_TYPES.POSITION
  );

  if (positionEntity) {
    const position = positionEntity.value.toLowerCase();

    switch (position) {
      case AVA_POSITION.TOP_LEFT:
        options.setAvaPosition(AVA_POSITION.TOP_LEFT);
        break;
      case AVA_POSITION.TOP_RIGHT:
        options.setAvaPosition(AVA_POSITION.TOP_RIGHT);
        break;
      case AVA_POSITION.BOTTOM_RIGHT:
        options.setAvaPosition(AVA_POSITION.BOTTOM_RIGHT);
        break;
      case AVA_POSITION.BOTTOM_LEFT:
        options.setAvaPosition(AVA_POSITION.BOTTOM_LEFT);
        break;
      default:
        throw new Error("I'm sorry could you repeat that?");
    }
  }

  throw new Error("I'm sorry could you repeat that ");
}

function handleModalAction(
  modalType: MODAL_TYPES,
  actionType: ACTION_TYPES.OPEN | ACTION_TYPES.CLOSE,
  modalOptions: ModalOptions
) {
  if (modalType === MODAL_TYPES.REMINDER) {
    if (actionType === ACTION_TYPES.OPEN) {
      modalOptions.setIsReminderOpen(true);
    } else {
      modalOptions.setIsReminderOpen(false);
    }

    return;
  }

  if (modalType === MODAL_TYPES.TAGS) {
    if (actionType === ACTION_TYPES.OPEN) {
      modalOptions.openTagModal();
    } else {
      modalOptions.closeTagModal();
    }
  }
}

function handleModalIntent(segment: SpeechSegment, options: AvaOptions) {
  const { entities } = segment;

  console.log(entities);

  if (entities.length < 1) {
    throw new Error("I'm sorry could you repeat that");
  }

  const modalEntity = entities.find(({ type }) => type === ENTITY_TYPES.MODAL);
  const actionEntity = entities.find(
    ({ type }) => type === ENTITY_TYPES.ACTION
  );

  if (!modalEntity || !actionEntity) {
    throw new Error("I'm sorry could you repeat that");
  }

  const modalType = getModalTypeFromEntity(modalEntity);
  const actionType = getActionTypeFromEntity(actionEntity);

  if (modalType === null || !actionType) {
    throw new Error("I'm sorry could you repeat that");
  }

  if (actionType !== ACTION_TYPES.OPEN && actionType !== ACTION_TYPES.CLOSE) {
    throw new Error("I'm sorry could you repeat that");
  }

  handleModalAction(modalType, actionType, options.modalOptions);
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
    case INTENTS.AVA_MOVE:
      handleAvaMoveIntent(segment, options);
      break;
    case INTENTS.MODAL:
      handleModalIntent(segment, options);
      break;
    default:
      throw new Error(`I'm sorry can you repeat that?`);
  }
}
