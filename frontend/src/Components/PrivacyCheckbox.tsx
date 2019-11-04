import React, { Dispatch } from 'react';
import { EmailState } from '../Helpers/EmailState';
import { RecordOf } from 'immutable';
import { IAction } from '../Helpers/IAction';
import { Checkbox } from './Checkbox';

interface CheckboxProps<V, S extends EmailState<V>, T> {
  addValidation: T;
  removeValidation: T;
  setIsAccepted: T;
  dispatch: Dispatch<IAction<T>>;
  state: RecordOf<S>;
  children: string;
}

export function PrivacyCheckbox<V, S extends EmailState<V>, T>({
  setIsAccepted,
  addValidation,
  removeValidation,
  dispatch,
  state,
  children,
}: CheckboxProps<V, S, T>) {
  return (
    <Checkbox
      action={setIsAccepted}
      dispatch={dispatch}
      className={
        state.get('validationMessages').contains('privacy') ? ' invalid' : ''
      }
      updateValidation={(isEnabled) =>
        dispatch({
          type: isEnabled ? removeValidation : addValidation,
          payload: 'privacy',
        })
      }
    >
      <div>
        I accept that my data will be processed according to the{' '}
        <a href='/privacy'>Privacy Policy</a>: my email can be recorded and
        cookies can be used so that I can manage my {children} subscription. The
        subscription can be cancelled at any time.
        <br />
        <small>(required for {children} subscription)</small>
      </div>
    </Checkbox>
  );
}
