import React, { useReducer, Dispatch } from 'react';
import Body from '../Body';
import { Checkbox } from '../Checkbox';
import { Record, RecordOf, Set } from 'immutable';
import { IAction } from '../../Helpers/IAction';
import { EmailState } from '../../Helpers/EmailState';
import { Email } from '../Email';

interface State extends EmailState<'privacy'> {
  isPrivacyPolicyAccepted: boolean;
}

const StateFactory = Record<State>({
  email: '',
  isPrivacyPolicyAccepted: false,
  validationMessages: Set(),
});

enum ActionType {
  setEmail = 'setEmail',
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
  }
}

interface SubmitProps {
  dispatch: Dispatch<IAction<ActionType>>;
  state: RecordOf<State>;
}

const OnceSubmit = ({ dispatch, state }: SubmitProps) => {};

export default () => {
  const [state, dispatch] = useReducer(reducer, StateFactory({}));
  return (
    <Body>
      <h3>Thank you for your sponsorship!</h3>
      <p>
        Would you like to get email updates about my work, including exclusive
        articles and other sponsorship perks?
      </p>
      <div className='form'>
        <Email
          {...{ dispatch, state }}
          setEmail={ActionType.setEmail}
          addValidation={ActionType.addValidation}
          removeValidation={ActionType.removeValidation}
        />

        <div className='checkbox-block'>
          <Checkbox
            action={ActionType.setIsPrivacyPolicyAccepted}
            dispatch={dispatch}
          >
            <div>
              I accept that my data will be processed according to the{' '}
              <a href='/privacy'>Privacy Policy</a>: my email can be recorded
              and cookies can be used so that I can manage my email
              subscription. The subscription can be cancelled at any time.
              <br />
              <small>(required)</small>
            </div>
          </Checkbox>
        </div>
      </div>
    </Body>
  );
};
