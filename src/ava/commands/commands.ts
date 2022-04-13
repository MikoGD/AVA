import { Entity, SpeechSegment } from '@speechly/react-client';
import { getVerbTypeFromEntity } from '../../utils';
import { adjectives, AvaOptions, ENTITY_TYPES, INTENTS, nouns } from '../types';
import { handleBrowserIntent } from './browser';

interface Word {
  type: string;
  value: string;
}

export interface Noun {
  noun: Word;
  adjective?: Word;
}

export interface Command {
  verb?: string;
  nouns?: Noun[];
}

function checkIsNoun(entity: Entity) {
  const nounValues = Object.values(nouns);

  return nounValues.includes(entity.type);
}

function checkIsAdjective(entity: Entity) {
  return entity.type === ENTITY_TYPES.ADJECTIVE;
}

function checkIsVerb(entity: Entity) {
  return entity.type === ENTITY_TYPES.VERB;
}

function getAdjectiveFromEntity(entity: Entity) {
  const adjectiveType = Object.keys(adjectives).find((adjective) =>
    adjectives[adjective].includes(entity.value.toLowerCase())
  );

  if (!adjectiveType) {
    throw new Error("I'm sorry could you repeat that?");
  }

  return { type: adjectiveType, value: entity.value.toLowerCase() };
}

function getNounFromEntity(entity: Entity) {
  return { type: entity.type, value: entity.value.toLowerCase() };
}

export function constructCommand(segment: SpeechSegment) {
  const { entities } = segment;

  if (entities.length === 0) {
    throw new Error("I'm sorry could you repeat that?");
  }

  const command: Command = {};
  let verbFound = false;
  let hasAdjective = false;
  let currNoun: Partial<Noun> = {};

  // For of loop used as continue keyword is needed to optimize loop
  /* eslint-disable no-restricted-syntax, no-continue */
  for (const entity of entities) {
    if (!verbFound) {
      const isVerb = checkIsVerb(entity);
      if (isVerb) {
        command.verb = getVerbTypeFromEntity(entity);
        verbFound = true;
        continue;
      }
    }

    const isNoun = checkIsNoun(entity);
    const isAdjective = checkIsAdjective(entity);

    if (isAdjective && !hasAdjective) {
      hasAdjective = true;
      currNoun.adjective = getAdjectiveFromEntity(entity);
    }

    if (isNoun) {
      if (!command.nouns) {
        command.nouns = [];
      }

      currNoun.noun = getNounFromEntity(entity);
      command.nouns.push(currNoun as Noun);
      currNoun = {};

      hasAdjective = false;
    }
  }
  /* eslint-enable no-restricted-syntax, no-continue */

  return command;
}

export function processSegment(segment: SpeechSegment, options: AvaOptions) {
  const { intent } = segment.intent;

  switch (intent) {
    case INTENTS.BROWSER:
      handleBrowserIntent(segment);
      break;
    default:
      // DELETE:
      console.error('unhandled');
      throw new Error("I'm sorry, can you repeat that?");
  }
}
