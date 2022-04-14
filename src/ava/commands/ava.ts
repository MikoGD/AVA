import { SpeechSegment } from '@speechly/react-client';
import {
  AvaOptions,
  avaPositions,
  AVA_POSITION,
  modals,
  MODAL_TYPES,
  nouns,
  verbs,
} from '../types';
import { Command, constructCommand } from './commands';

function executeTags(command: Command, options: AvaOptions) {
  if (command.nouns?.find(({ noun: { type } }) => nouns.tag.includes(type))) {
    if (command.verb === verbs.open) {
      options.setShowTag(true);
      options.setRenderTag(true);
      return true;
    }

    if (command.verb === verbs.close) {
      options.setShowTag(false);
      options.setRenderTag(false);
      return true;
    }

    options.setShowTag(true);
    options.setRenderTag(true);
    return true;
  }

  return false;
}

function executeAvaMove(command: Command, options: AvaOptions) {
  if (command.verb === verbs.move) {
    if (command.nouns) {
      const corner = command.nouns.find(
        ({ noun: { type } }) => type === nouns.corner
      );

      if (corner) {
        switch (corner.noun.value) {
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
            return false;
        }

        return true;
      }
    }

    const index = Math.round(Math.random() * 3);
    options.setAvaPosition(avaPositions[index]);
    return true;
  }

  return false;
}

function executeModal(command: Command, options: AvaOptions) {
  if (command.nouns) {
    const modal = command.nouns.find(
      ({ noun: { type } }) => type === nouns.modal
    );

    if (command.verb === verbs.open && modal) {
      if (MODAL_TYPES.REMINDER.includes(modal.noun.value)) {
        options.modalOptions.setIsReminderOpen(true);
        return true;
      }

      if (MODAL_TYPES.TAGS.includes(modal.noun.value)) {
        options.modalOptions.openTagModal();
        return true;
      }
    }

    if (command.verb === verbs.close && modal) {
      if (MODAL_TYPES.REMINDER.includes(modal.noun.value)) {
        options.modalOptions.setIsReminderOpen(false);
        return true;
      }

      if (MODAL_TYPES.TAGS.includes(modal.noun.value)) {
        options.modalOptions.closeTagModal();
        return true;
      }
    }
  }

  return false;
}

const commandExecutions = [executeTags, executeAvaMove, executeModal];

export function handleAvaIntent(segment: SpeechSegment, options: AvaOptions) {
  const { entities } = segment;

  if (entities.length <= 0) {
    throw new Error("I'm sorry could you repeat that?");
  }

  const command = constructCommand(segment);

  if (commandExecutions.find((execution) => execution(command, options))) {
    return;
  }

  throw new Error("I'm sorry could you repeat that?");
}
