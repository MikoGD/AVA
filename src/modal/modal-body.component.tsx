import React from 'react';
import classnames from 'classnames';
import styles from './modal.module.scss';

interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
}

const ModalBody = React.forwardRef<HTMLDivElement, ModalBodyProps>(
  ({ children, className }, ref) => (
    <div className={classnames(styles['modal-body'], className)} ref={ref}>
      {children}
    </div>
  )
);

ModalBody.displayName = 'ModalBody';

export default ModalBody;
