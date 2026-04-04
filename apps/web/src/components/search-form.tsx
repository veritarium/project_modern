'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Loader2 } from 'lucide-react';

interface SearchFormProps {
  onSearch: (platform: string, name: string) => void;
  isLoading?: boolean;
}

export function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [platform, setPlatform] = useState('npm');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSearch(platform, name.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Select value={platform} onValueChange={setPlatform}>
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Platform" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="npm">npm</SelectItem>
          <SelectItem value="pypi">PyPI</SelectItem>
          <SelectItem value="maven">Maven</SelectItem>
          <SelectItem value="go">Go</SelectItem>
          <SelectItem value="rust">Rust</SelectItem>
          <SelectItem value="nuget">NuGet</SelectItem>
        </SelectContent>
      </Select>
      <Input
        type="text"
        placeholder="Enter package name..."
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="flex-1"
      />
      <Button type="submit" disabled={isLoading || !name.trim()}>
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        <span className="ml-2">Search</span>
      </Button>
    </form>
  );
}
