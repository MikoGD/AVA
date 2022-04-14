import { SpeechSegment } from '@speechly/react-client';
import { getActionTypeFromEntity, getModalTypeFromEntity } from '../utils';
import {
  AvaOptions,
  INTENTS,
  ModalOptions,
  ENTITY_TYPES,
  MODAL_TYPES,
  ACTION_TYPES,
} from './types';

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
    case INTENTS.MODAL:
      handleModalIntent(segment, options);
      break;
    default:
      throw new Error(`I'm sorry can you repeat that?`);
  }
}
