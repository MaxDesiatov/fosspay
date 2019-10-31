import React, { Dispatch } from 'react';
import { IAction } from '../Helpers/IAction';

interface CheckboxProps<T> {
  action: T;
  dispatch: Dispatch<IAction<T>>;
  className?: string;
  updateValidation?: (value: boolean) => void;
  children: JSX.Element;
}

export function Checkbox<T>({
  action,
  dispatch,
  children,
  className,
  updateValidation,
}: CheckboxProps<T>) {
  return (
    <label className={`checkbox-label${className ? className : ''}`}>
      <div>
        <input
          type='checkbox'
          onChange={(e) => {
            if (updateValidation) {
              updateValidation(e.currentTarget.checked);
            }
            dispatch({
              type: action,
              payload: e.currentTarget.checked,
            });
          }}
        />
      </div>
      {children}
    </label>
  );
}
