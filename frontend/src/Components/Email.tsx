import React, { Dispatch } from 'react';
import { validEmail } from '../Helpers/validation';
import { IAction } from '../Helpers/IAction';
import { RecordOf } from 'immutable';
import { EmailState } from '../Helpers/EmailState';

interface EmailProps<V, S extends EmailState<V>, T> {
  setEmail: T;
  addValidation: T;
  removeValidation: T;
  dispatch: Dispatch<IAction<T>>;
  state: RecordOf<S>;
}

export function Email<V, S extends EmailState<V>, T>({
  dispatch,
  state,
  setEmail,
  addValidation,
  removeValidation,
}: EmailProps<V, S, T>) {
  return (
    <div
      className={`email${
        state.get('validationMessages').contains('email') ? ' invalid' : ''
      }`}
    >
      <input
        type='email'
        name='email'
        autoComplete='email'
        required
        value={state.get('email')}
        onChange={(e) => {
          dispatch({
            type: setEmail,
            payload: e.currentTarget.value,
          });
          if (validEmail(e.currentTarget.value)) {
            dispatch({
              type: removeValidation,
              payload: 'email',
            });
          }
        }}
        onBlur={(e) => {
          dispatch({
            type: e.currentTarget.value ? removeValidation : addValidation,
            payload: 'email',
          });
        }}
        placeholder='Email'
      />
    </div>
  );
}
