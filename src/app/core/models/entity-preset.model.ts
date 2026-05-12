import { EntityFilterMode } from './operation.model';

export interface EntityPreset {
  id: string;
  name: string;
  description?: string;
  filterMode: EntityFilterMode;
  selectedEntities: string[];
  createdAt: number;
}
