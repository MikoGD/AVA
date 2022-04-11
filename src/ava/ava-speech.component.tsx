import React from 'react';
import classnames from 'classnames';
import Loader from 'react-spinners/PulseLoader';
import { Line, SPEAKER } from './types';
import styles from './ava.module.scss';

interface AvaTextComponentProps {
  dialogue: Line[];
}

export default function AvaTextComponent({
  dialogue,
}: AvaTextComponentProps): React.ReactElement<AvaTextComponentProps> {
  return dialogue.length > 0 ? (
    <div className={styles['dialogue-box']}>
      {dialogue.map(({ text, id, speaker }) => {
        if (speaker === SPEAKER.USER) {
          return (
            <p key={id} className={styles.dialogue}>
              {text}
            </p>
          );
        }

        return (
          <p key={id} className={classnames(styles.ava, styles.dialogue)}>
            {text}
          </p>
        );
      })}
    </div>
  ) : (
    <Loader size={10} />
  );
}
