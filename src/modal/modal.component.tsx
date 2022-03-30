import React from 'react';
import styles from './modal.module.scss';

interface ModalProps {
  isOpen: boolean;
  children: React.ReactNode;
}

export default function Modal({
  isOpen,
  children,
}: ModalProps): React.ReactElement<ModalProps> {
  return (
    <div>
      {isOpen ? (
        <div className={styles.container}>
          <div className={styles.modal}>{children}</div>
        </div>
      ) : null}
    </div>
  );
}
