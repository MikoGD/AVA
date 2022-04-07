import React from 'react';
import Loader from 'react-spinners/PulseLoader';
import { Line } from './types';

interface AvaTextComponentProps {
  dialogue: Line[];
}

export default function AvaTextComponent({
  dialogue,
}: AvaTextComponentProps): React.ReactElement<AvaTextComponentProps> {
  return dialogue.length > 0 ? (
    <div>
      {dialogue.map(({ text, id }) => (
        <p key={id}>{text}</p>
      ))}
    </div>
  ) : (
    <Loader size={10} />
  );
}
