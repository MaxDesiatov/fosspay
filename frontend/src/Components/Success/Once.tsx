import React, { useReducer, Dispatch } from 'react';
import Body from '../Body';
import { Record, RecordOf, Set } from 'immutable';
import { IAction } from '../../Helpers/IAction';
import { EmailState } from '../../Helpers/EmailState';
import { Email } from '../Email';
import { Submit } from '../Submit';
import { PrivacyCheckbox } from '../PrivacyCheckbox';

interface State extends EmailState<'privacy'> {
  isComplete: boolean;
}

const StateFactory = Record<State>({
  email: '',
  isComplete: false,
  isPrivacyPolicyAccepted: false,
  validationMessages: Set(),
});

enum ActionType {
  setEmail = 'setEmail',
  setIsComplete = 'setIsComplete',
  setIsPrivacyPolicyAccepted = 'setIsPrivacyPolicyAccepted',
  addValidation = 'addValidation',
  removeValidation = 'removeValidation',
}

function reducer(
  state: RecordOf<State>,
  action: IAction<ActionType>,
): RecordOf<State> {
  switch (action.type) {
    case ActionType.setEmail:
      return state.set('email', action.payload);
    case ActionType.setIsPrivacyPolicyAccepted:
      return state.set('isPrivacyPolicyAccepted', action.payload);
    case ActionType.addValidation: {
      const messages = state.get('validationMessages');
      return state.set('validationMessages', messages.add(action.payload));
    }
    case ActionType.removeValidation: {
      const messages = state.get('validationMessages');
      return state.set('validationMessages', messages.remove(action.payload));
    }
    case ActionType.setIsComplete:
      return state.set('isComplete', action.payload);
  }
}

interface SubmitProps {
  dispatch: Dispatch<IAction<ActionType>>;
  state: RecordOf<State>;
}

const OnceSubmit = ({ dispatch, state }: SubmitProps) => (
  <Submit<'privacy', State, ActionType>
    addValidation={ActionType.addValidation}
    dispatch={dispatch}
    state={state}
    shouldValidateEmail={true}
    executeRequest={async (_, setError) => {
      const response = await fetch('/sponsor/email_subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: state.get('email'),
        }),
      });
      const result = await response.json();
      if (result.error) {
        setError(
          <h3 className='payment-error'>
            An error occurred while processing your request. Please try again
            later or{' '}
            <a href='mailto:sponsor@desiatov.com'>report this problem</a>.
          </h3>,
        );
        console.error(result.error.toString());
      } else {
        dispatch({
          type: ActionType.setIsComplete,
          payload: true,
        });
      }
    }}
  >
    Subscribe
  </Submit>
);

export default () => {
  const [state, dispatch] = useReducer(reducer, StateFactory({}));
  return (
    <Body>
      <span style={{ textAlign: 'center' }}>
        {/* FIXME: send an email to confirm the address and change the message
        below. */}
        <h3>Thank you for your sponsorship!</h3>

        {state.get('isComplete') ? (
          <h3>Your email subscription has been confirmed.</h3>
        ) : (
          false
        )}
      </span>
      {!state.get('isComplete') ? (
        <>
          <p>
            Would you like to get email updates about my work, including
            exclusive articles and other sponsorship perks?
          </p>
          <div className='form'>
            <Email
              {...{ dispatch, state }}
              setEmail={ActionType.setEmail}
              addValidation={ActionType.addValidation}
              removeValidation={ActionType.removeValidation}
            />

            <div className='checkbox-block'>
              <PrivacyCheckbox
                setIsAccepted={ActionType.setIsPrivacyPolicyAccepted}
                addValidation={ActionType.addValidation}
                removeValidation={ActionType.removeValidation}
                dispatch={dispatch}
                state={state}
              >
                email
              </PrivacyCheckbox>
            </div>
            <OnceSubmit dispatch={dispatch} state={state} />
          </div>
        </>
      ) : (
        <></>
      )}
    </Body>
  );
};
