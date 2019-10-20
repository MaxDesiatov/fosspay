import React from 'react';
import { rhythm } from '../typography';

interface Props {
  children: JSX.Element[];
}

export default ({ children }: Props) => (
  <p style={{ marginTop: rhythm(1), marginBottom: 0 }}>{children}</p>
);
