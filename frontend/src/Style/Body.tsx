import React from 'react';
import { rhythm } from './typography';

interface Props {
  children: string;
}

export default ({ children }: Props) => (
  <p style={{ marginTop: rhythm(1), marginBottom: 0 }}>{children}</p>
);
