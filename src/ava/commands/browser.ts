import { SpeechSegment } from '@speechly/react-client';
import { Command, constructCommand, Noun } from './commands';
import { sendMessageToBackground } from '../../utils';
import { AvaOptions, Disposition, INTENTS, nouns, verbs } from '../types';

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
  if (command.verb !== verbs.open && command.verb !== verbs.close) {
    return false;
  }

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

function executeSearch(command: Command) {
  let browserNoun: Noun | null = null;
  let disposition: Disposition = 'CURRENT_TAB';

  if (command.nouns) {
    // eslint-disable-next-line
    for (const noun of command.nouns) {
      if (
        noun.noun.type === 'browser' &&
        noun.adjective &&
        (noun.adjective.type === 'new' || noun.adjective.type === 'current')
      ) {
        browserNoun = noun;
      }
    }
  }

  if (
    browserNoun &&
    browserNoun.adjective &&
    browserNoun.adjective.type === 'new'
  ) {
    if (browserNoun.noun.value === 'tab') {
      disposition = 'NEW_TAB';
    } else if (browserNoun.noun.value === 'window') {
      disposition = 'NEW_WINDOW';
    }
  }

  const searchRegex =
    /(?<=(look up|find out|search up|search for) )(((.*)(?= in.*?(another | new | this | current)))|((.*?)$))/gi;
  const result = command.command.match(searchRegex);

  if (!result) {
    return false;
  }

  const query = result[0];

  sendMessageToBackground({
    intent: INTENTS.SEARCH,
    command,
    search: { query, disposition },
  });
  return true;
}

const commandExecutions = [
  executeTab,
  executeOpenWebsite,
  executeRefresh,
  executeSearch,
];

export function handleBrowserIntent(
  segment: SpeechSegment,
  options: AvaOptions
) {
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
