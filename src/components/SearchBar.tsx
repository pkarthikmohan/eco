import { Search, Loader2 } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('query') as string;
    if (query.trim()) onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <input
          name="query"
          type="text"
          placeholder="Search for a product (e.g. Coca Cola, Lays)..."
          className="w-full h-14 pl-12 pr-4 bg-white border-2 border-slate-200 rounded-2xl focus:border-eco-a focus:ring-0 transition-all outline-none text-lg shadow-sm"
          disabled={isLoading}
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-eco-a" />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </div>
      </div>
    </form>
  );
}
