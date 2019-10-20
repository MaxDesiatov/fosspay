import React from 'react';
import { rhythm } from '../Helpers/typography';

interface Props {
  className?: string;
  children: JSX.Element[];
}

export default ({ className, children }: Props) => (
  <div {...{ className }} style={{ marginTop: rhythm(1), marginBottom: 0 }}>
    {children}
  </div>
);
