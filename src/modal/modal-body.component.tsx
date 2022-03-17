import React from 'react';
import classnames from 'classnames';
import styles from './modal.module.scss';

interface ModalBodyProps {
  children: React.ReactNode;
  classNames?: string;
}

const ModalBody = React.forwardRef<HTMLDivElement, ModalBodyProps>(
  ({ children, classNames }, ref) => (
    <div className={classnames(styles.modalBody, classNames)} ref={ref}>
      {children}
    </div>
  )
);

ModalBody.displayName = 'ModalBody';

export default ModalBody;
