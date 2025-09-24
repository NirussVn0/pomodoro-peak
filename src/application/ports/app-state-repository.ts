import type { AppState } from '../state/app-reducer';

export interface AppStateRepository {
  load(): Promise<AppState | null>;
  save(state: AppState): Promise<void>;
  clear(): Promise<void>;
}
