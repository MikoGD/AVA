import { ReactNode } from 'react';

export interface ModalOptions {
  [key: string]: () => void;
  openTagModal: () => void;
  closeTagModal: () => void;
}

export interface Badge {
  children: ReactNode;
  className: string;
  style: {
    top: number;
    left: number;
  };
}
