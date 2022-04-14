import { ReactNode } from 'react';

export enum SPEAKER {
  AVA,
  USER,
}

export enum INTENTS {
  OPEN_WEBSITE = 'open_website',
  SCROLL = 'scroll',
  TAGS = 'tags',
  REFRESH = 'refresh',
  TAB = 'tabs',
  INDEX = 'index',
  NAVIGATION = 'navigation',
  SEARCH = 'search',
  DICTATION = 'dictation',
  SUBMIT = 'submit',
  AVA_MOVE = 'ava_move',
  MODAL = 'modal',
  BROWSER = 'browser',
  PAGE = 'page',
  AVA = 'ava',
}

export enum ENTITY_TYPES {
  ACTION = 'action',
  POSITION = 'position',
  MODAL = 'modal',
  DIRECTION = 'direction',
  INDEX = 'index',
  WEBSITE = 'website',
  AVA = 'ava',
  DATE = 'date',
  TIME = 'time',
  BROWSER = 'browser',
  PAGE = 'page',
  VERB = 'verb',
  ADJECTIVE = 'adjective',
  CORNER = 'corner',
  TAG = 'tag',
  FORM = 'form',
}

export const adjectives: Record<string, string> = {
  new: 'new another',
  current: 'current this',
  previous: 'previous',
};

export const positions = {
  direction: 'up down left right',
  sides: 'top bottom',
};

export const nouns = {
  modal: 'modal',
  index: 'index',
  website: 'website',
  ava: 'ava',
  date: 'date',
  time: 'time',
  browser: 'browser',
  page: 'page',
  corner: 'corner',
  tag: 'tag link tags links',
  form: 'form',
  direction: 'direction',
  position: 'position',
};

export enum MODAL_TYPES {
  REMINDER,
  TAGS,
}

export const modals: Record<string, MODAL_TYPES> = {
  'reminders reminder modal': MODAL_TYPES.REMINDER,
  'tag list tag modal links tags': MODAL_TYPES.TAGS,
};

export enum ACTION_TYPES {
  MOVE = 'move',
  MOVE_OUT = 'move out',
  OPEN = 'open show me',
  CLOSE = 'close hide',
}

export const verbs: Record<string, string> = {
  move: 'move out scroll',
  open: 'open show me go back to navigate',
  close: 'close hide remove',
  refresh: 'refresh reload',
};

export const actions: Record<string, ACTION_TYPES> = {
  move: ACTION_TYPES.MOVE,
  'move out': ACTION_TYPES.MOVE_OUT,
  'open show me list': ACTION_TYPES.OPEN,
  'close hide': ACTION_TYPES.CLOSE,
};

export enum AVA_POSITION {
  TOP_LEFT = 'top left',
  TOP_RIGHT = 'top right',
  BOTTOM_LEFT = 'bottom left',
  BOTTOM_RIGHT = 'bottom right',
}

export interface ModalOptions {
  [key: string]: (() => void) | ((isOpen: boolean) => void);
  openTagModal: () => void;
  closeTagModal: () => void;
  setIsReminderOpen: (isOpen: boolean) => void;
}

export interface AvaOptions {
  modalOptions: ModalOptions;
  setRenderTag: (value: boolean) => void;
  setShowTag: (value: boolean) => void;
  setContextIndex: (index: number) => void;
  setDictation: (dictation: string) => void;
  setSubmit: () => void;
  setAvaPosition: (position: AVA_POSITION) => void;
}

export interface Tag {
  children: ReactNode;
  style: {
    top: number;
    left: number;
  };
}

export type Disposition = 'NEW_WINDOW' | 'NEW_TAB' | 'CURRENT_TAB';

// No operation function
// eslint-disable-next-line @typescript-eslint/no-empty-function
export const noop = () => {};

export interface Line {
  id: number;
  speaker: SPEAKER;
  text: string;
  isFinal: boolean;
}

export const avaPositions = [
  AVA_POSITION.TOP_LEFT,
  AVA_POSITION.TOP_RIGHT,
  AVA_POSITION.BOTTOM_LEFT,
  AVA_POSITION.BOTTOM_RIGHT,
];
