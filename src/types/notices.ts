export interface Notice {
  _id: string;
  species: string;
  category: string;
  price?: number;
  title: string;
  name: string;
  birthday: string | null;
  comment: string;
  sex: string;
  location: string;
  imgURL: string;
  createdAt: string;
  updatedAt?: string;
  user: string;
  popularity: number;
}

export interface NoticesResponse {
  page: number;
  perPage: number;
  totalPages: number;
  results: Notice[];
}

export interface NoticeFilters {
  keyword: string;
  category: string;
  sex: string;
  species: string;
  locationId: string;
  sortBy: '' | 'popular' | 'unpopular' | 'expensive' | 'cheap';
}

export const defaultNoticeFilters: NoticeFilters = {
  keyword: '',
  category: '',
  sex: '',
  species: '',
  locationId: '',
  sortBy: '',
};

export interface LocationOption {
  _id: string;
  stateEn: string;
  cityEn: string;
}
