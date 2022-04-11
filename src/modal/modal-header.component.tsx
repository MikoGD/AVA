import React from 'react';
import classnames from 'classnames';
import styles from './modal.module.scss';

interface ModalHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export default function ModalHeader({
  children,
  className,
}: ModalHeaderProps): React.ReactElement<ModalHeaderProps> {
  return (
    <div className={classnames(styles['modal-header'], className)}>
      {typeof children === 'string' ? <h2>{children}</h2> : children}
    </div>
  );
}
