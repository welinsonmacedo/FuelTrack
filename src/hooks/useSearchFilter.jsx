import { useState, useMemo } from "react";

export function useSearchFilter(data, searchTerm, field) {
  const [search, setSearch] = useState(searchTerm || "");

  const filtered = useMemo(() => {
    return data.filter(item =>
      item[field]?.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search, field]);

  return { search, setSearch, filtered };
}
