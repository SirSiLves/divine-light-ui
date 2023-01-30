import {PrimeIcons} from 'primeng/api';
import {ThemeType} from './theme.store';

export interface Theme {
  label: string;
  value: ThemeType;
  icon: PrimeIcons;
}
