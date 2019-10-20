export const validEmail = (email: string) =>
  email.match(/^.+@\w+(\.\w+)+$/) !== null;
