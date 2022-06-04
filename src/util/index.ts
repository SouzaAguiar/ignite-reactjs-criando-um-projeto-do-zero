import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function formatdata(data: string): string {
  return format(new Date(data), 'dd MMM yyyy', { locale: ptBR });
}
