import { useCallback, useEffect, useRef, useState } from 'react';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const DEBOUNCE_MS = 400;
const MIN_QUERY_LENGTH = 3;
const USER_AGENT = 'ims-ambulancias-app';

export type NominatimAddress = {
  county?: string;
  suburb?: string;
  city_district?: string;
  [key: string]: string | undefined;
};

export type NominatimSuggestion = {
  place_id: number;
  display_name: string;
  address: NominatimAddress;
};

type UseAddressAutocompleteParams = {
  onSelect: (address: string, comuna: string) => void;
  defaultValue?: string;
};

function extraerComuna(address: NominatimAddress): string {
  return address.county ?? address.suburb ?? address.city_district ?? '';
}

// Muestra el display_name completo, quitando el postcode (ej: "7500000").
export function formatearSugerencia(item: NominatimSuggestion): string {
  const { address, display_name } = item;

  if (!address.postcode) return display_name;

  return display_name
    .split(', ')
    .filter((segmento) => segmento !== address.postcode)
    .join(', ');
}

export function useAddressAutocomplete({
  onSelect,
  defaultValue = '',
}: UseAddressAutocompleteParams) {
  const [query, setQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<NominatimSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const buscar = useCallback(async (texto: string) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        q: texto,
        format: 'jsonv2',
        addressdetails: '1',
        countrycodes: 'cl',
        limit: '5',
      });

      const response = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
        headers: { 'User-Agent': USER_AGENT },
      });

      const data: NominatimSuggestion[] = await response.json();
      setSuggestions(data);
    } catch {
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = useCallback(
    (text: string) => {
      setQuery(text);

      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (text.trim().length < MIN_QUERY_LENGTH) {
        setSuggestions([]);
        return;
      }

      debounceRef.current = setTimeout(() => buscar(text.trim()), DEBOUNCE_MS);
    },
    [buscar],
  );

  const handleSelect = useCallback(
    (item: NominatimSuggestion) => {
      const comuna = extraerComuna(item.address);
      setQuery(item.display_name);
      setSuggestions([]);
      onSelect(item.display_name, comuna);
    },
    [onSelect],
  );

  const clear = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setQuery('');
    setSuggestions([]);
  }, []);

  useEffect(() => {
    setQuery(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return { query, suggestions, isLoading, handleInputChange, handleSelect, clear };
}
