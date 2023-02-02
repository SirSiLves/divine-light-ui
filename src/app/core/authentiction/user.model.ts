export interface User {
  uid: string;
  email: string;
  displayName: string;
  emailVerified: boolean;
}


export const users = [
  {
    id: '999',
    firstName: 'Yves',
    lastName: 'Ruosch',
    name: 'Yves Ruosch',
    password: 'asdfasdfasdf',
    role: 'Admin',
    mail: 'yves@ruosch.me'
  },
  {
    id: '100',
    firstName: 'Test',
    lastName: 'Tester',
    name: 'Test Tester',
    password: 'tester',
    role: 'Tester',
    mail: 'test@tester.me'
  },
];
