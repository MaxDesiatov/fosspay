import { Record, RecordOf, Set } from 'immutable';
import { Dispatch, useReducer } from 'react';

type ValidationMessage = 'amount' | 'email' | 'privacy';

const StateFactory = Record({
  amount: 10,
  comments: '',
  email: '',
  isPrivacyPolicyAccepted: false,
  isPublic: false,
  isSubscription: true,
  emailUpdates: false,
  projectID: null,
  validationMessages: Set(),
} as State);

interface State {
  amount: number;
  comments: string;
  email: string;
  isPrivacyPolicyAccepted: false;
  isPublic: boolean;
  isSubscription: boolean;
  emailUpdates: boolean;
  projectID: number | null;
  validationMessages: Set<ValidationMessage>;
}

interface Action {
  type: ActionType;
  payload: any;
}

export enum ActionType {
  setAmount = 'setAmount',
  setComments = 'setComments',
  setEmail = 'setEmail',
  setIsSubscription = 'setIsSubscription',
  setIsPrivacyPolicyAccepted = 'setIsPrivacyPolicyAccepted',
  setIsPublic = 'setIsPublic',
  setProject = 'setProject',
  setEmailUpdates = 'setEmailUpdates',
  addValidationMessage = 'pushValidationMessage',
  removeValidationMessage = 'removeValidationMessage',
  resetValidationMessages = 'resetValidationMessages',
}

function reducer(state: RecordOf<State>, action: Action): RecordOf<State> {
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
    case ActionType.addValidationMessage: {
      const messages = state.get('validationMessages');
      return state.set('validationMessages', messages.add(action.payload));
    }
    case ActionType.removeValidationMessage: {
      const messages = state.get('validationMessages');
      return state.set('validationMessages', messages.remove(action.payload));
    }
    case ActionType.resetValidationMessages:
      return state.set('validationMessages', Set());
    case ActionType.setEmailUpdates:
      return state.set('emailUpdates', action.payload);
  }
}

export interface StateProps {
  state: RecordOf<State>;
  dispatch: Dispatch<Action>;
}

export const useFormState = () => useReducer(reducer, StateFactory({}));
