import React, { ReactElement } from 'react';
import { Modal, ModalBody, ModalHeader } from '../../modal';
import styles from './reminder.module.scss';

interface ReminderModalProps {
  isOpen: boolean;
}

interface Reminder {
  id: string;
  dateCreated: Date;
  dateDue: Date;
  reminder: string;
}

const reminders: Reminder[] = [
  {
    id: 'note2',
    dateCreated: new Date(2022, 3, 8, 20, 0, 0),
    dateDue: new Date(2022, 3, 10, 16, 0, 0),
    reminder: 'Get eggs and milk',
  },
  {
    id: 'note1',
    dateCreated: new Date(2022, 3, 10, 20, 0, 0),
    dateDue: new Date(2022, 3, 15, 16, 0, 0),
    reminder: 'Pay taxes',
  },
];

export function ReminderModal({
  isOpen,
}: ReminderModalProps): ReactElement<ReminderModalProps> {
  return (
    <Modal isOpen={isOpen}>
      <ModalHeader>Reminder</ModalHeader>
      <ModalBody className={styles['modal-body']}>
        {reminders.map(({ reminder, dateDue, dateCreated, id }) => (
          <article className={styles.reminder} key={id}>
            <div className={styles['reminder-body']}>
              <h3>{reminder}</h3>
            </div>
            <div className={styles['reminder-dates']}>
              <h5 className={new Date(Date.now()) > dateDue && styles.due}>
                Due - {dateDue.toDateString()}{' '}
              </h5>
              <h5>Created - {dateCreated.toDateString()}</h5>
            </div>
          </article>
        ))}
      </ModalBody>
    </Modal>
  );
}
export default ReminderModal;
