export interface User {
  uid: string;
  email: string;
  displayName: string;
  emailVerified: boolean;
}


export const users = [
  {
    id: '999',
    vorname: 'Yves',
    nachname: 'Ruosch',
    name: 'Yves Ruosch',
    password: 'asdfasdfasdf',
    rolle: 'Admin',
    mail: 'yves@ruosch.me'
  },
  {
    id: '100',
    vorname: 'Test',
    nachname: 'Tester',
    name: 'Test Tester',
    password: 'tester',
    rolle: 'Tester',
    mail: 'test@tester.me'
  },
];
