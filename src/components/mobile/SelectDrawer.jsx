import React, { useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Check } from 'lucide-react';

export default function SelectDrawer({ open, onOpenChange, items, value, onSelect, placeholder, searchable = true }) {
  const [search, setSearch] = useState('');

  const filtered = searchable
    ? items.filter(item =>
        (item.label || item).toLowerCase().includes(search.toLowerCase())
      )
    : items;

  const handleSelect = (item) => {
    onSelect(item.value !== undefined ? item.value : item);
    onOpenChange(false);
    setSearch('');
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle>{placeholder || 'Select'}</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-4 space-y-3 overflow-y-auto">
          {searchable && (
            <Input
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="mb-2"
            />
          )}
          {filtered.map((item, idx) => {
            const itemValue = item.value !== undefined ? item.value : item;
            const itemLabel = item.label || item;
            const isSelected = itemValue === value;
            return (
              <button
                key={idx}
                onClick={() => handleSelect(item)}
                className="w-full flex items-center justify-between px-3 py-3 rounded-lg hover:bg-secondary transition-colors text-left"
              >
                <span className="text-sm font-medium">{itemLabel}</span>
                {isSelected && <Check className="w-4 h-4 text-primary" />}
              </button>
            );
          })}
        </div>
      </DrawerContent>
    </Drawer>
  );
}