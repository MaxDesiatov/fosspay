import { Record, RecordOf, Set } from 'immutable';
import { Dispatch, useReducer } from 'react';
import { IAction } from '../../Helpers/IAction';
import { EmailState, EmailValidation } from '../../Helpers/EmailState';

type ValidationMessage = 'amount' | 'privacy';

interface State extends EmailState<ValidationMessage> {
  amount: number;
  comments: string;
  isPrivacyPolicyAccepted: boolean;
  isPublic: boolean;
  isSubscription: boolean;
  emailUpdates: boolean;
  projectID: number | null;
}

const StateFactory = Record<State>({
  amount: 10,
  comments: '',
  email: '',
  isPrivacyPolicyAccepted: false,
  isPublic: false,
  isSubscription: true,
  emailUpdates: false,
  projectID: null,
  validationMessages: Set(),
});

export enum ActionType {
  setAmount = 'setAmount',
  setComments = 'setComments',
  setEmail = 'setEmail',
  setIsSubscription = 'setIsSubscription',
  setIsPrivacyPolicyAccepted = 'setIsPrivacyPolicyAccepted',
  setIsPublic = 'setIsPublic',
  setProject = 'setProject',
  setEmailUpdates = 'setEmailUpdates',
  addValidation = 'addValidation',
  removeValidation = 'removeValidation',
  resetValidation = 'resetValidation',
}

function reducer(
  state: RecordOf<State>,
  action: IAction<ActionType>,
): RecordOf<State> {
  switch (action.type) {
    case ActionType.setAmount:
      return state.set('amount', action.payload);
    case ActionType.setEmail:
      return state.set('email', action.payload);
    case ActionType.setIsSubscription:
      return state.set('isSubscription', action.payload);
    case ActionType.setIsPublic:
      return state.set('isPublic', action.payload);
    case ActionType.setProject:
      return state.set('projectID', action.payload);
    case ActionType.setComments:
      return state.set('comments', action.payload);
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
    case ActionType.resetValidation:
      return state.set('validationMessages', Set());
    case ActionType.setEmailUpdates:
      return state.set('emailUpdates', action.payload);
  }
}

export interface StateProps {
  state: RecordOf<State>;
  dispatch: Dispatch<IAction<ActionType>>;
}

export const useFormState = () => useReducer(reducer, StateFactory({}));
