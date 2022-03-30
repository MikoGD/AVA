import { ReactNode } from 'react';

export interface ModalOptions {
  [key: string]: () => void;
  openTagModal: () => void;
  closeTagModal: () => void;
}

export interface AvaOptions {
  modalOptions: ModalOptions;
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
