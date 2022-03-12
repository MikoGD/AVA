import React from 'react';
import Loader from 'react-spinners/PulseLoader';

interface AvaTextComponentProps {
  text: string;
}

export default function AvaTextComponent({
  text,
}: AvaTextComponentProps): React.ReactElement<AvaTextComponentProps> {
  return text !== '' ? <p>{text}</p> : <Loader size={10} />;
}
