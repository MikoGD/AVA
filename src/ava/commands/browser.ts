import { SpeechSegment } from '@speechly/react-client';
import { Command, constructCommand } from './commands';
import { sendMessageToBackground } from '../../utils';
import { AvaOptions, INTENTS, nouns, verbs } from '../types';

function handleOpenWebsite(website: string) {
  window.location.href = `https://${website}`;
}

function handleRefresh() {
  chrome.runtime.sendMessage({ intent: INTENTS.REFRESH });
}

function handleTabCommand(command: Command) {
  sendMessageToBackground({ intent: INTENTS.TAB, command });
}

function executeTab(command: Command) {
  if (
    command.nouns &&
    command.nouns.find(
      ({ noun: { type, value } }) => type === nouns.browser && value === 'tab'
    )
  ) {
    handleTabCommand(command);
    return true;
  }
  return false;
}

function executeOpenWebsite(command: Command) {
  if (command.nouns) {
    // Only need the first noun
    const [currNoun] = command.nouns;

    if (command.verb === verbs.open && currNoun.noun.type === nouns.website) {
      handleOpenWebsite(command.nouns[0].noun.value);
      return true;
    }
  }

  return false;
}

function executeRefresh(command: Command) {
  if (command.verb === verbs.refresh) {
    handleRefresh();
    return true;
  }

  return false;
}

const commandExecutions = [executeTab, executeOpenWebsite, executeRefresh];

export function handleBrowserIntent(segment: SpeechSegment) {
  const { entities } = segment;

  if (entities.length <= 0) {
    throw new Error("I'm sorry could you repeat that?");
  }

  const command = constructCommand(segment);

  if (commandExecutions.find((execution) => execution(command))) {
    return;
  }

  throw new Error("I'm sorry could you repeat that again?");
}
