import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const formatDate = (date) => {
  return format(new Date(date), 'dd/MM/yyyy', { locale: fr });
};

export const formatNumber = (number) => {
  return new Intl.NumberFormat('fr-FR').format(Math.round(number));
};

export const formatPercentage = (value) => {
  return `${(value * 100).toFixed(2)}%`;
}; 