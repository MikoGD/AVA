import { SpeechSegment } from '@speechly/react-client';
import { AvaOptions, nouns, verbs } from '../types';
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

const commandExecutions = [executeTags];

export function handleAvaIntent(segment: SpeechSegment, options: AvaOptions) {
  const { entities } = segment;

  if (entities.length <= 0) {
    throw new Error("I'm sorry could you repeat that?");
  }

  const command = constructCommand(segment);

  commandExecutions.find((execution) => execution(command, options));
}
