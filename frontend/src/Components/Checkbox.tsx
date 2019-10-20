import React, { Dispatch } from 'react';
import { IAction } from '../Helpers/IAction';

interface CheckboxProps<T> {
  action: T;
  dispatch: Dispatch<IAction<T>>;
  children: JSX.Element;
}

export function Checkbox<T>({ action, dispatch, children }: CheckboxProps<T>) {
  return (
    <label className='checkbox-label'>
      <div>
        <input
          type='checkbox'
          onChange={(e) =>
            dispatch({
              type: action,
              payload: e.currentTarget.checked,
            })
          }
        />
      </div>
      {children}
    </label>
  );
}
