import { SpeechSegment } from '@speechly/react-client';
import { getMaxChildScrollHeight, sendMessageToBackground } from '../../utils';
import { adjectives, AvaOptions, INTENTS, nouns, verbs } from '../types';
import { Command, constructCommand } from './commands';

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

function executeNavigation(command: Command, _: AvaOptions) {
  if (command.verb === verbs.open) {
    if (
      !command.nouns ||
      command.nouns.find(({ noun: { type } }) => type === nouns.page)
    ) {
      sendMessageToBackground({ intent: INTENTS.NAVIGATION, command });
      return true;
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
      return true;
    }
  }

  return false;
}

function executeScroll(command: Command, options: AvaOptions) {
  if (
    command.verb === verbs.move &&
    command.nouns &&
    command.nouns.length > 0
  ) {
    const directionWord = command.nouns.find(
      ({ noun: { type } }) => type === nouns.direction
    );

    if (directionWord) {
      handleDirectionScroll(directionWord.noun.value, options);
      return true;
    }

    const positionWord = command.nouns.find(
      ({ noun: { type } }) => type === nouns.position
    );

    if (positionWord) {
      handlePositionScroll(positionWord.noun.value, options);
      return true;
    }
  }

  return false;
}

function executeIndex(command: Command, options: AvaOptions) {
  if (command.nouns) {
    const [noun] = command.nouns;

    if (noun.noun.type === nouns.index) {
      options.setContextIndex(Number(noun.noun.value));
      return true;
    }
  }

  return false;
}

const commandExecutions = [executeNavigation, executeScroll, executeIndex];

export function handlePageIntent(segment: SpeechSegment, options: AvaOptions) {
  const { entities } = segment;

  if (entities.length <= 0) {
    throw new Error("I'm sorry could you repeat that?");
  }

  const command = constructCommand(segment);

  if (commandExecutions.find((execution) => execution(command, options))) {
    return;
  }

  commandExecutions.find((execution) => execution(command, options));
}
