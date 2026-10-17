import { api } from './api';
import type { DropdownOption } from '../components/Dropdown/Dropdown';

export async function getSpecies(): Promise<DropdownOption[]> {
  const response = await api.get<string[]>('/notices/species');

  return response.data.map((species) => ({
    value: species,
    label: species.charAt(0).toUpperCase() + species.slice(1),
  }));
}
