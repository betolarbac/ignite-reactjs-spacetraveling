import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

export function parseDate(target: string, withTime = false): string {
  const formatMask = `dd MMM yyyy${withTime ? "', às' p" : ''}`;

  return format(new Date(target), formatMask, {
    locale: ptBR,
  });
}
