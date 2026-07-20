/**
 * Client-side documentation search.
 *
 * Reaproveita a infraestrutura de busca que já existe no repo em vez de
 * introduzir um serviço externo:
 *   - fonte de dados: `mcp-snapshot.json`, publicado no build por
 *     `plugins/mcp-snapshot` (o mesmo snapshot que alimenta o docs-mcp);
 *   - motor de busca: MiniSearch com a MESMA configuração de campos/boost/
 *     fuzzy usada em `mcp-server/src/search/index.ts`.
 *
 * Swizzle de `@theme/SearchBar`: o Navbar do theme-classic já renderiza
 * `<SearchBar />` quando não há item `type: 'search'` no navbar, então este
 * componente aparece sem nenhuma mudança em `docusaurus.config.js`.
 */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {createPortal} from 'react-dom';
import {useHistory} from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {useAllDocsData} from '@docusaurus/plugin-content-docs/client';
import {translate} from '@docusaurus/Translate';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import MiniSearch from 'minisearch';
import styles from './styles.module.css';

// productId (do snapshot) -> pluginId (do content-docs). O devportal é a
// instância default; os demais usam o próprio nome como id.
const PRODUCT_TO_PLUGIN = {
  devportal: 'default',
  platform: 'platform',
  'admin-ui': 'admin-ui',
  vkdr: 'vkdr',
};

const PRODUCT_LABEL = {
  devportal: 'DevPortal',
  platform: 'Platform',
  'admin-ui': 'Admin-UI',
  vkdr: 'VKDR-CLI',
};

const SNIPPET_MAX = 160;
const MAX_RESULTS = 20;

// Espelha makeSnippet de mcp-server/src/search/index.ts.
function makeSnippet(content, query) {
  const lower = content.toLowerCase();
  const needle = query.toLowerCase().split(/\s+/)[0];
  if (!needle) return content.slice(0, SNIPPET_MAX);
  const idx = lower.indexOf(needle);
  if (idx === -1) return content.slice(0, SNIPPET_MAX);
  const start = Math.max(0, idx - 40);
  const end = Math.min(content.length, idx + SNIPPET_MAX - 40);
  return (start > 0 ? '…' : '') + content.slice(start, end) + (end < content.length ? '…' : '');
}

// Espelha buildIndex de mcp-server/src/search/index.ts (mesma config).
function buildIndex(snapshot) {
  const mini = new MiniSearch({
    fields: ['section_title', 'content', 'doc_title'],
    storeFields: ['path', 'anchor', 'product', 'doc_title', 'section_title', 'content'],
    searchOptions: {
      boost: {doc_title: 3, section_title: 2, content: 1},
      prefix: true,
      fuzzy: 0.2,
    },
  });
  const docs = [];
  for (const doc of snapshot.docs) {
    for (const section of doc.sections) {
      docs.push({
        id: `${doc.path}#${section.anchor}`,
        path: doc.path,
        anchor: section.anchor,
        product: doc.product,
        doc_title: doc.title,
        section_title: section.title,
        content: section.content,
      });
    }
  }
  mini.addAll(docs);
  return mini;
}

// Mapa exato docId -> permalink, da versão corrente de cada instância.
function buildPermalinkMap(allDocsData) {
  const map = new Map();
  for (const [pluginId, data] of Object.entries(allDocsData ?? {})) {
    const version = data.versions.find((v) => v.isLast) ?? data.versions[0];
    if (!version) continue;
    for (const doc of version.docs) {
      map.set(`${pluginId}:${doc.id}`, doc.path);
    }
  }
  return map;
}

function resolveUrl(hit, permalinkMap) {
  const slash = hit.path.indexOf('/');
  const productId = hit.path.slice(0, slash);
  const rel = hit.path.slice(slash + 1).replace(/\.md$/, '');
  const pluginId = PRODUCT_TO_PLUGIN[productId] ?? productId;
  const permalink = permalinkMap.get(`${pluginId}:${rel}`) ?? `/${productId}/${rel}`;
  return hit.anchor ? `${permalink}#${hit.anchor}` : permalink;
}

function SearchModal({snapshotUrl, permalinkMap, onClose}) {
  const history = useHistory();
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const indexRef = useRef(null);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [active, setActive] = useState(0);

  // Carrega o snapshot uma vez e constrói o índice no cliente.
  useEffect(() => {
    let cancelled = false;
    fetch(snapshotUrl)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((snapshot) => {
        if (cancelled) return;
        indexRef.current = buildIndex(snapshot);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [snapshotUrl]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const runSearch = useCallback((q) => {
    const mini = indexRef.current;
    if (!mini || !q.trim()) {
      setResults([]);
      setActive(0);
      return;
    }
    const hits = mini.search(q).slice(0, MAX_RESULTS).map((h) => ({
      url: resolveUrl(h, permalinkMap),
      product: h.product,
      doc_title: h.doc_title,
      section_title: h.section_title,
      snippet: makeSnippet(h.content, q),
    }));
    setResults(hits);
    setActive(0);
  }, [permalinkMap]);

  // Debounce leve na digitação.
  useEffect(() => {
    const t = setTimeout(() => runSearch(query), 120);
    return () => clearTimeout(t);
  }, [query, runSearch]);

  const go = useCallback((url) => {
    if (!url) return;
    onClose();
    history.push(url);
  }, [history, onClose]);

  const onKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      go(results[active]?.url);
    }
  }, [results, active, go, onClose]);

  // Mantém o item ativo visível.
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${active}"]`);
    el?.scrollIntoView({block: 'nearest'});
  }, [active]);

  return (
    <div
      className={styles.overlay}
      role="button"
      tabIndex={-1}
      aria-label={translate({id: 'theme.SearchBar.close', message: 'Close search'})}
      onClick={onClose}
      onKeyDown={onKeyDown}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label={translate({id: 'theme.SearchBar.label', message: 'Search the documentation'})}
        onClick={(e) => e.stopPropagation()}>
        <div className={styles.inputRow}>
          <svg className={styles.inputIcon} width="18" height="18" viewBox="0 0 20 20" aria-hidden="true">
            <path
              fill="currentColor"
              d="M8.5 3a5.5 5.5 0 0 1 4.383 8.823l3.647 3.647-1.06 1.06-3.647-3.647A5.5 5.5 0 1 1 8.5 3Zm0 1.5a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"
            />
          </svg>
          <input
            ref={inputRef}
            className={styles.input}
            type="search"
            autoComplete="off"
            spellCheck={false}
            placeholder={translate({id: 'theme.SearchBar.placeholder', message: 'Search the docs…'})}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            aria-controls="veecode-search-results"
          />
          <kbd className={styles.escHint}>Esc</kbd>
        </div>

        <div className={styles.results} id="veecode-search-results" ref={listRef} role="listbox">
          {status === 'loading' && (
            <p className={styles.hint}>
              {translate({id: 'theme.SearchBar.loading', message: 'Loading search index…'})}
            </p>
          )}
          {status === 'error' && (
            <p className={styles.hint}>
              {translate({id: 'theme.SearchBar.error', message: 'Search is unavailable right now.'})}
            </p>
          )}
          {status === 'ready' && query.trim() && results.length === 0 && (
            <p className={styles.hint}>
              {translate(
                {id: 'theme.SearchBar.noResults', message: 'No results for “{query}”.'},
                {query},
              )}
            </p>
          )}
          {results.map((r, i) => (
            <a
              key={r.url + i}
              href={r.url}
              data-idx={i}
              role="option"
              aria-selected={i === active}
              className={i === active ? `${styles.result} ${styles.resultActive}` : styles.result}
              onMouseEnter={() => setActive(i)}
              onClick={(e) => {
                e.preventDefault();
                go(r.url);
              }}>
              <span className={styles.resultBadge}>{PRODUCT_LABEL[r.product] ?? r.product}</span>
              <span className={styles.resultText}>
                <span className={styles.resultTitle}>
                  {r.doc_title}
                  {r.section_title ? <span className={styles.resultSection}> › {r.section_title}</span> : null}
                </span>
                {r.snippet ? <span className={styles.resultSnippet}>{r.snippet}</span> : null}
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SearchBar() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const snapshotUrl = useBaseUrl('/mcp-snapshot.json');
  const allDocsData = useAllDocsData();
  const permalinkMap = useMemo(() => buildPermalinkMap(allDocsData), [allDocsData]);

  useEffect(() => setMounted(true), []);

  // Atalho de teclado ⌘K / Ctrl+K.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Trava o scroll do body enquanto o modal está aberto.
  useEffect(() => {
    if (!open || !ExecutionEnvironment.canUseDOM) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const isApple = mounted && ExecutionEnvironment.canUseDOM && /mac|iphone|ipad/i.test(navigator.platform);

  return (
    <>
      <button
        type="button"
        className={styles.trigger}
        aria-label={translate({id: 'theme.SearchBar.button.label', message: 'Search'})}
        onClick={() => setOpen(true)}>
        <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true">
          <path
            fill="currentColor"
            d="M8.5 3a5.5 5.5 0 0 1 4.383 8.823l3.647 3.647-1.06 1.06-3.647-3.647A5.5 5.5 0 1 1 8.5 3Zm0 1.5a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"
          />
        </svg>
        <span className={styles.triggerText}>
          {translate({id: 'theme.SearchBar.button.label', message: 'Search'})}
        </span>
        <kbd className={styles.triggerKbd}>{isApple ? '⌘' : 'Ctrl'} K</kbd>
      </button>
      {open && mounted && ExecutionEnvironment.canUseDOM
        ? createPortal(
            <SearchModal
              snapshotUrl={snapshotUrl}
              permalinkMap={permalinkMap}
              onClose={() => setOpen(false)}
            />,
            document.body,
          )
        : null}
    </>
  );
}
