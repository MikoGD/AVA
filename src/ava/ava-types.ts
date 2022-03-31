import { ReactNode } from 'react';

export enum INTENTS {
  OPEN_WEBSITE = 'OPEN_WEBSITE',
  SCROLL = 'SCROLL',
  TAGS = 'TAGS',
  REFRESH = 'REFRESH',
  TAB = 'TABS',
  INDEX = 'INDEX',
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
}

export interface Tag {
  children: ReactNode;
  style: {
    top: number;
    left: number;
  };
}
