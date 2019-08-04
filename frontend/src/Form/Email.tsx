import React from 'react';
import { ActionType, StateProps } from './State';

export const validEmail = (email: string) =>
  email.match(/^.+@\w+(\.\w+)+$/) !== null;

export const Email = ({ dispatch, state }: StateProps) => (
  <>
    <div className='email-explainer'>
      Your email is required for monthly sponsorship so that you can cancel your
      subscription later if you'd like to:
    </div>
    <div
      className={`email${
        state.get('validationMessages').contains('email') ? ' invalid' : ''
      }`}
    >
      <input
        type='email'
        required
        value={state.get('email')}
        onChange={(e) => {
          dispatch({
            type: ActionType.setEmail,
            payload: e.currentTarget.value,
          });
          if (validEmail(e.currentTarget.value)) {
            dispatch({
              type: ActionType.removeValidationMessage,
              payload: 'email',
            });
          }
        }}
        onBlur={(e) => {
          dispatch({
            type: e.currentTarget.value
              ? ActionType.removeValidationMessage
              : ActionType.addValidationMessage,
            payload: 'email',
          });
        }}
        placeholder='Email'
      />
    </div>
  </>
);
