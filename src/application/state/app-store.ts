import { createStore } from 'zustand/vanilla';
import { appReducer, defaultAppState } from './app-reducer';
import type { AppState, AppAction } from './app-reducer';

export interface AppStore {
  readonly getState: () => AppState;
  readonly dispatch: (action: AppAction) => void;
  readonly subscribe: (listener: () => void) => () => void;
}

export const createAppStore = (initialState?: AppState): AppStore => {
  const store = createStore<{ state: AppState } & { dispatch: (action: AppAction) => void }>((set, get) => ({
    state: initialState ?? defaultAppState(),
    dispatch: (action: AppAction) => {
      const current = get().state;
      const next = appReducer(current, action);
      set({ state: next });
    },
  }));

  return {
    getState: () => store.getState().state,
    dispatch: (action: AppAction) => store.getState().dispatch(action),
    subscribe: (listener: () => void) =>
      store.subscribe(() => {
        listener();
      }),
  };
};
