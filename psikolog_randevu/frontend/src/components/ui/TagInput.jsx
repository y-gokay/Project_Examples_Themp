import { useRef, useState } from 'react';
import { X } from 'lucide-react';

const SUGGESTIONS = [
  'BDT', 'Aile Terapisi', 'Çocuk ve Ergen', 'Travma', 'EMDR',
  'Çift Terapisi', 'Depresyon', 'Kaygı Bozukluğu', 'Yetişkin',
  'Yas Terapisi', 'Öfke Yönetimi', 'Bağımlılık', 'Cinsel Terapi',
];

const TagInput = ({ value = [], onChange, max = 10 }) => {
  const [input, setInput] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  const add = (tag) => {
    const trimmed = tag.trim();
    if (!trimmed || value.includes(trimmed) || value.length >= max) return;
    onChange([...value, trimmed]);
    setInput('');
  };

  const remove = (tag) => onChange(value.filter((t) => t !== tag));

  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault();
      add(input);
    }
    if (e.key === 'Backspace' && !input && value.length > 0) {
      remove(value[value.length - 1]);
    }
  };

  const filteredSuggestions = SUGGESTIONS.filter(
    (s) => !value.includes(s) && s.toLowerCase().includes(input.toLowerCase())
  );

  return (
    <div className="relative">
      <div
        className="flex flex-wrap gap-1.5 min-h-[44px] px-3 py-2 rounded-xl border-[1.5px] transition-all duration-200 cursor-text"
        style={{
          background: 'rgb(var(--bg-muted))',
          borderColor: focused ? 'rgb(var(--accent))' : 'rgba(var(--border))',
          boxShadow: focused ? '0 0 0 3px rgba(var(--accent), 0.18)' : 'none',
        }}
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold"
            style={{
              background: 'rgba(var(--accent), 0.12)',
              color: 'rgb(var(--accent))',
            }}
          >
            {tag}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); remove(tag); }}
              className="hover:opacity-70 transition-opacity"
              aria-label={`${tag} kaldır`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        {value.length < max && (
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => { setFocused(false); if (input.trim()) add(input); }}
            placeholder={value.length === 0 ? 'Alan yazın, Enter ile ekleyin...' : ''}
            className="flex-1 min-w-[120px] bg-transparent text-sm outline-none"
            style={{ color: 'rgb(var(--text-1))' }}
          />
        )}
      </div>

      {focused && input && filteredSuggestions.length > 0 && (
        <div
          className="absolute z-20 top-full mt-1 w-full rounded-xl border shadow-card overflow-hidden"
          style={{
            background: 'rgb(var(--bg-elev))',
            borderColor: 'rgba(var(--border))',
          }}
        >
          {filteredSuggestions.slice(0, 6).map((s) => (
            <button
              key={s}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); add(s); }}
              className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-[rgba(var(--accent),0.07)]"
              style={{ color: 'rgb(var(--text-1))' }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <p className="text-[11px] mt-1.5" style={{ color: 'rgb(var(--text-3))' }}>
        {value.length}/{max} alan · Enter veya virgül ile ekleyin
      </p>
    </div>
  );
};

export default TagInput;
