import React from 'react';
import styles from './modal.module.scss';

interface ModalProps {
  children: React.ReactNode;
}

export default function Modal({
  children,
}: ModalProps): React.ReactElement<ModalProps> {
  return (
    <div className={styles.container}>
      <div className={styles.modal}>{children}</div>
    </div>
  );
}
