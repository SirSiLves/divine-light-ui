export interface GameManagerSettings {
  id: string;
  mode: string;
  displayCellIDs: boolean;
  log: boolean;
  rematch: 'auto' | 'manual';
  autoSwitch: boolean;
}
