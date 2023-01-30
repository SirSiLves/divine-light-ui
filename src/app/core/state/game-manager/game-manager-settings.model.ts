export interface GameManagerSettings {
  id: string;
  mode: string;
  displayCellIDs: boolean;
  displayStateLoader: boolean;
  log: boolean;
  rematch: 'auto' | 'manual';
  autoSwitch: boolean;
}
