import { useQuery } from '@tanstack/react-query';
import { dictApi } from '../../lib/api';
import { Select, SelectTrigger, SelectContent, SelectItem } from './Select';
import * as SelectPrimitive from '@radix-ui/react-select';

interface DictSelectProps {
  typeCode: string;
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function DictSelect({ typeCode, value, onValueChange, placeholder, disabled, className }: DictSelectProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['dict', typeCode],
    queryFn: () => dictApi.getByTypeCode(typeCode).then((r) => r.data),
    staleTime: 10 * 60 * 1000,
  });

  const items = data?.items ?? [];

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled || isLoading}>
      <SelectTrigger className={className}>
        <SelectPrimitive.Value placeholder={isLoading ? '加载中...' : placeholder} />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.id} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
