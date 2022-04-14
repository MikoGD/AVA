import { SpeechSegment } from '@speechly/react-client';
import {
  getActionTypeFromEntity,
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
  avaPositions,
} from './types';

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

        // sendMessageToBackground({
        //   intent: INTENTS.SEARCH,
        //   search: {
        //     query,
        //     disposition: locations[browserLocationValue] ?? 'CURRENT_TAB',
        //   },
        // });
      } else {
        const query = Array.from(sentence)
          .splice(actionIndex + actionValue.length)
          .join('');

        // sendMessageToBackground({
        //   intent: INTENTS.SEARCH,
        //   search: {
        //     query,
        //     disposition: 'CURRENT_TAB',
        //   },
        // });
      }
    }
  }
}

function handleAvaMoveIntent(segment: SpeechSegment, options: AvaOptions) {
  const { entities } = segment;

  if (entities.length < 2) {
    const index = Math.round(Math.random() * 3);
    options.setAvaPosition(avaPositions[index]);

    return;
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
