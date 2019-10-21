import React from 'react';

import 'whatwg-fetch';
import { useFormState } from './State';
import { OnboardingSubmit } from './Submit';
import { AmountProps, Amount } from './Amount';
import { Frequency } from './Frequency';
import { ProjectsProps, Projects } from './Projects';
import { Comments } from './Comments';
import { Checkboxes } from './Checkboxes';

export default (props: AmountProps & ProjectsProps) => {
  const [state, dispatch] = useFormState();

  const newProps = { dispatch, state, ...props };
  return (
    <div className='form'>
      <Amount {...newProps} />
      <Frequency {...newProps} />
      <Projects {...newProps} />
      <Comments {...newProps} />
      <Checkboxes {...newProps} />
      <OnboardingSubmit {...newProps} />
    </div>
  );
};
