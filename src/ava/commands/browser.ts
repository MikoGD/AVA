import { SpeechSegment } from '@speechly/react-client';
import { Command, constructCommand } from './commands';
import { sendMessageToBackground } from '../../utils';
import { INTENTS, nouns, verbs } from '../types';

function handleOpenWebsite(website: string) {
  window.location.href = `https://${website}`;
}

function handleRefresh() {
  chrome.runtime.sendMessage({ intent: INTENTS.REFRESH });
}

function handleTabCommand(command: Command) {
  sendMessageToBackground({ intent: INTENTS.TAB, command });
}

export function handleBrowserIntent(segment: SpeechSegment) {
  const { entities } = segment;

  if (entities.length <= 0) {
    throw new Error("I'm sorry could you repeat that?");
  }

  const command = constructCommand(segment);

  if (
    command.nouns &&
    command.nouns.find(
      ({ noun: { type, value } }) => type === nouns.browser && value === 'tab'
    )
  ) {
    handleTabCommand(command);
    return;
  }

  if (command.nouns) {
    // Only need the first noun
    const [currNoun] = command.nouns;

    if (command.verb === verbs.open && currNoun.noun.type === nouns.website) {
      handleOpenWebsite(command.nouns[0].noun.value);
      return;
    }
  }

  if (command.verb === verbs.refresh) {
    handleRefresh();
    return;
  }

  throw new Error("I'm sorry could you repeat that again?");
}
