import { SpeechSegment } from '@speechly/react-client';
import { sendMessageToBackground } from '../../utils';
import { adjectives, AvaOptions, INTENTS, nouns, verbs } from '../types';
import { constructCommand } from './commands';

export function handlePageIntent(segment: SpeechSegment, options: AvaOptions) {
  const { entities } = segment;

  if (entities.length <= 0) {
    throw new Error("I'm sorry could you repeat that?");
  }

  const command = constructCommand(segment);

  if (command.verb === verbs.open) {
    if (
      !command.nouns ||
      command.nouns.find(({ noun: { type } }) => type === nouns.page)
    ) {
      sendMessageToBackground({ intent: INTENTS.NAVIGATION, command });
    }
  }

  if (command.nouns) {
    if (
      command.nouns.find(
        ({ noun, adjective }) =>
          noun.type === nouns.page &&
          adjective &&
          adjective.type === adjectives.previous
      )
    ) {
      sendMessageToBackground({ intent: INTENTS.NAVIGATION, command });
    }
  }
}
