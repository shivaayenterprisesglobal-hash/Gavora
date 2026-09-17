import { useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Icon from '@/components/ui/Icon';
import { searchSuggestions } from '@/lib/catalog';
import { cn } from '@/utils/cn';

/**
 * Product search with live suggestions.
 *
 * Built as a combobox so the suggestion list is properly announced and can be
 * driven from the keyboard: Up/Down move through results, Enter opens the
 * highlighted one, Escape closes the list without clearing the query.
 *
 * Suggestions come from `catalog.searchSuggestions`, which will become an API
 * call in the next phase — the debounce is already in place for that.
 */
export function SearchBar({ autoFocus = false, onNavigate, className }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);

  const navigate = useNavigate();
  const containerRef = useRef(null);
  const listboxId = useId();

  useEffect(() => {
    const term = query.trim();

    if (term.length < 2) {
      return undefined;
    }

    // Debounced so typing does not fire a request per keystroke once this is
    // hitting the network.
    const timer = setTimeout(() => {
searchSuggestions(term)
        .then((results) => {
          setSuggestions(results);
          setHighlighted(-1);
        })
        .catch(() => {
          setSuggestions([]);
        });
    }, 180);

    return () => clearTimeout(timer);
  }, [query]);

  // Close the suggestion list when focus or a click lands outside.
  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [open]);

  const go = (path) => {
    setOpen(false);
    onNavigate?.();
    navigate(path);
  };

  const submit = (event) => {
    event.preventDefault();
    const term = query.trim();
    go(term ? `/shop?q=${encodeURIComponent(term)}` : '/shop');
  };

  const handleKeyDown = (event) => {
    if (!open || suggestions.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlighted((index) => (index + 1) % suggestions.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlighted((index) => (index <= 0 ? suggestions.length - 1 : index - 1));
    } else if (event.key === 'Enter' && highlighted >= 0) {
      event.preventDefault();
      go(`/product/${suggestions[highlighted].slug}`);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  };

  const showList = open && query.trim().length >= 2 && suggestions.length > 0;

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <form role="search" onSubmit={submit}>
        <label htmlFor={`${listboxId}-input`} className="sr-only">
          Search products
        </label>

        <div className="relative">
          <Icon
            name="search"
            size="sm"
            className="text-ink-400 pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2"
          />
          <input
            id={`${listboxId}-input`}
            type="search"
            role="combobox"
            autoComplete="off"
            aria-expanded={showList}
            aria-controls={showList ? listboxId : undefined}
            aria-activedescendant={
              highlighted >= 0 && showList ? `${listboxId}-option-${highlighted}` : undefined
            }
            autoFocus={autoFocus}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search for products, brands and more"
            className="rounded-control border-ink-200 bg-canvas-raised text-ink-900 placeholder:text-ink-400 hover:border-gold-300 focus:border-gold-600 h-11 w-full border shadow-sm pr-4 pl-10 text-sm transition-colors"
          />
        </div>
      </form>

      {showList && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Search suggestions"
          className="border-ink-100 bg-canvas-raised rounded-card shadow-panel animate-fade-in absolute top-full z-50 mt-2 w-full overflow-hidden border py-1"
        >
          {suggestions.map((item, index) => (
            <li key={item._id} role="none">
              <button
                type="button"
                id={`${listboxId}-option-${index}`}
                role="option"
                aria-selected={index === highlighted}
                onMouseEnter={() => setHighlighted(index)}
                onClick={() => go(`/product/${item.slug}`)}
                className={cn(
                  'flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors',
                  index === highlighted ? 'bg-ink-50' : 'hover:bg-ink-50',
                )}
              >
                <Icon name="search" size="sm" className="text-ink-300" />
                <span className="min-w-0 flex-1 truncate">{item.name}</span>
                <span className="text-ink-500 shrink-0 text-xs">{item.category?.name}</span>
              </button>
            </li>
          ))}

          <li role="none" className="border-ink-100 mt-1 border-t">
            <button
              type="button"
              onClick={() => go(`/shop?q=${encodeURIComponent(query.trim())}`)}
              className="text-ink-600 hover:bg-ink-50 w-full px-4 py-2.5 text-left text-xs font-medium transition-colors"
            >
              See all results for &ldquo;{query.trim()}&rdquo;
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}

export default SearchBar;
