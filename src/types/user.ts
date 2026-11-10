import type { Notice } from './notices';

export interface CurrentUser {
  _id: string;
  name: string;
  email: string;
  noticesFavorites: Notice[];
}

export interface UserPet {
  _id: string;
  name: string;
  title: string;
  imgURL: string;
  species: string;
  birthday: string;
  sex: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CurrentUserFull extends CurrentUser {
  avatar?: string;
  phone?: string;
  noticesViewed: Notice[];
  pets: UserPet[];
  createdAt?: string;
  updatedAt?: string;
}
