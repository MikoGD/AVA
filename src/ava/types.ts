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
}
export interface ModalOptions {
  [key: string]: () => void;
  openTagModal: () => void;
  closeTagModal: () => void;
}

export interface AvaOptions {
  modalOptions: ModalOptions;
  setRenderTag: (value: boolean) => void;
  setShowTag: (value: boolean) => void;
  setContextIndex: (index: number) => void;
  setDictation: (dictation: string) => void;
  setSubmit: () => void;
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
