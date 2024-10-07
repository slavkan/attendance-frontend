export interface Person {
  faculty: any;
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  indexNumber: string | null;
  academicTitle: string | null;
  admin: boolean;
  worker: boolean;
  professor: boolean;
  student: boolean;
}

export interface Faculty {
  id: number;
  name: string;
  abbreviation: string;
}

export interface Study {
  id: number;
  name: string;
  faculty: Faculty;
}

export interface Subject {
  subject: any;
  id: number;
  name: string;
  semester: number;
  study: Study;
}

export interface FacultyPerson {
  id: number;
  faculty: Faculty;
  person: Person;
}

export interface SubjectPerson {
  id: number;
  subject: Subject;
  person: Person;
}

export interface Sort {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

export interface Pageable {
  pageNumber: number;
  pageSize: number;
  sort: Sort;
  offset: number;
  paged: boolean;
  unpaged: boolean;
}

export interface ApiResponsePerson {
  content: Person[];
  pageable: Pageable;
  last: boolean;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  sort: Sort;
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}