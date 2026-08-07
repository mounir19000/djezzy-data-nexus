import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Book, X, Plus, FileText, Link as LinkIcon } from 'lucide-react';
import { useCreateKnowledgeArticle, useKnowledgeBase } from '../../hooks/useKnowledge';
import { useAppStore } from '../../store/useAppStore';
import { displayOperationalText, displayStatus, displayText } from '../../lib/frenchLabels';

const unique = (items: string[]) => [...new Set(items.filter(Boolean))].sort((a, b) => a.localeCompare(b));

const EMPTY_ARTICLES: any[] = [];

const asText = (value: unknown) => String(value || '').toLowerCase();

const fieldMatches = (items: string[] | undefined, query: string) => {
  if (!query) return true;
  return (items || []).some((item) => item.toLowerCase().includes(query));
};

const KnowledgeCenter = () => {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState('All Articles');
  const [equipment, setEquipment] = useState('');
  const [room, setRoom] = useState('');
  const [failureType, setFailureType] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const { data: knowledgeBase, isLoading } = useKnowledgeBase();
  const { mutate: createArticle, isPending: isCreating } = useCreateKnowledgeArticle();
  const { user } = useAppStore();
  const [formError, setFormError] = useState<string | null>(null);

  const articles = knowledgeBase ?? EMPTY_ARTICLES;
  const canCreate = user?.role === 'Super Admin' || user?.role === 'Engineer';

  useEffect(() => {
    const incomingSearch = searchParams.get('search');
    if (incomingSearch) setSearch(incomingSearch);
  }, [searchParams]);

  const categories = useMemo(() => ['All Articles', ...unique(articles.map((article: any) => article.category))], [articles]);
  const equipmentOptions = useMemo(() => unique(articles.flatMap((article: any) => article.relatedEquipment || article.tags || [])), [articles]);
  const roomOptions = useMemo(() => unique(articles.flatMap((article: any) => article.rooms || [])), [articles]);
  const failureTypeOptions = useMemo(() => unique(articles.map((article: any) => article.failureType || article.category)), [articles]);

  const filteredArticles = useMemo(() => {
    const query = search.trim().toLowerCase();
    const selectedDate = dateFrom ? new Date(dateFrom).getTime() : null;

    return articles.filter((article: any) => {
      const haystack = [
        article.title,
        article.category,
        article.problem,
        article.content,
        article.ruleId,
        article.faultId,
        ...(article.tags || []),
        ...(article.symptoms || []),
        ...(article.causes || []),
        ...(article.resolution || []),
        ...(article.relatedEquipment || []),
        ...(article.rooms || [])
      ].join(' ').toLowerCase();

      if (category !== 'All Articles' && article.category !== category) return false;
      if (query && !haystack.includes(query)) return false;
      if (!fieldMatches(article.relatedEquipment || article.tags, equipment.toLowerCase())) return false;
      if (!fieldMatches(article.rooms, room.toLowerCase())) return false;
      if (failureType && asText(article.failureType || article.category) !== failureType.toLowerCase()) return false;
      if (selectedDate && new Date(article.createdAt).getTime() < selectedDate) return false;
      return true;
    });
  }, [articles, category, dateFrom, equipment, failureType, room, search]);

  const selectedArticle = useMemo(() => {
    return filteredArticles.find((article: any) => article.id === selectedArticleId) || filteredArticles[0];
  }, [filteredArticles, selectedArticleId]);

  useEffect(() => {
    if (selectedArticle && selectedArticle.id !== selectedArticleId) {
      setSelectedArticleId(selectedArticle.id);
    }
  }, [selectedArticle, selectedArticleId]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    const data = new FormData(e.currentTarget);

    createArticle({
      title: String(data.get('title') || ''),
      category: String(data.get('category') || ''),
      tags: String(data.get('tags') || ''),
      content: String(data.get('content') || '')
    }, {
      onSuccess: () => setIsModalOpen(false),
      onError: (error) => setFormError(error.message)
    });
  };

  return (
    <div className="h-full flex flex-col space-y-6 relative">
      {canCreate && (
        <div className="flex justify-end">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary text-on-primary px-4 py-2 rounded-md font-sans font-medium hover:bg-primary-fixed-dim transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Créer un article
          </button>
        </div>
      )}

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-6 min-h-0">
        <aside className="xl:col-span-3 bg-bg-surface border border-border-subtle rounded-lg p-6 flex flex-col h-full min-h-0">
          <h3 className="text-sm font-mono text-on-surface-variant uppercase tracking-wider mb-4">Categories</h3>
          <ul className="space-y-2 overflow-y-auto pr-1">
            {categories.map((item) => (
              <li key={item}>
                <button
                  type="button"
                  onClick={() => setCategory(item)}
                  className={`w-full flex items-center justify-between text-sm p-2 rounded-md transition-colors ${category === item ? 'font-medium text-primary bg-bg-secondary' : 'text-on-surface hover:bg-bg-secondary'}`}
                >
                  <span className="truncate">{item === 'All Articles' ? 'Tous les articles' : displayText(item)}</span>
                  <span className="text-xs bg-background px-2 py-0.5 rounded text-on-surface-variant">
                    {item === 'All Articles' ? articles.length : articles.filter((article: any) => article.category === item).length}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="xl:col-span-4 bg-bg-surface border border-border-subtle rounded-lg p-6 flex flex-col h-full min-h-0">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
            <input
              type="text"
                  placeholder="Rechercher problèmes, symptômes, règles, tickets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-background border border-border-subtle rounded-md pl-10 pr-4 py-3 text-sm font-sans focus:outline-none focus:border-primary transition-colors text-on-surface placeholder:text-on-surface-variant"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
            <select value={equipment} onChange={(event) => setEquipment(event.target.value)} className="bg-background border border-border-subtle rounded-md px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary">
              <option value="">Équipement</option>
              {equipmentOptions.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <select value={room} onChange={(event) => setRoom(event.target.value)} className="bg-background border border-border-subtle rounded-md px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary">
              <option value="">Salle</option>
              {roomOptions.map((item) => <option key={item} value={item}>{displayText(item)}</option>)}
            </select>
            <select value={failureType} onChange={(event) => setFailureType(event.target.value)} className="bg-background border border-border-subtle rounded-md px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary">
              <option value="">Type de panne</option>
              {failureTypeOptions.map((item) => <option key={item} value={item}>{displayText(item)}</option>)}
            </select>
            <input value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} type="date" className="bg-background border border-border-subtle rounded-md px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary" />
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {isLoading ? (
              <div className="text-on-surface-variant text-sm">Chargement des articles...</div>
            ) : filteredArticles.length === 0 ? (
              <div className="text-on-surface-variant text-sm border border-dashed border-border-subtle rounded-lg p-5">Aucun article ne correspond aux filtres sélectionnés.</div>
            ) : filteredArticles.map((kb: any) => (
              <button
                key={kb.id}
                type="button"
                onClick={() => setSelectedArticleId(kb.id)}
                className={`w-full text-left bg-background border rounded-md p-4 transition-colors group ${selectedArticle?.id === kb.id ? 'border-primary' : 'border-border-subtle hover:border-primary'}`}
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-bg-secondary rounded-md group-hover:bg-primary/10 transition-colors">
                    <Book className="w-5 h-5 text-on-surface-variant group-hover:text-primary transition-colors" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      {kb.ruleId && <span className="text-[11px] font-mono text-primary bg-primary/10 border border-primary/20 rounded px-1.5 py-0.5">{kb.ruleId}</span>}
                      <span className="text-[11px] font-mono text-on-surface-variant bg-bg-secondary px-1.5 py-0.5 rounded">{displayText(kb.category)}</span>
                    </div>
                    <h4 className="font-sans font-medium text-on-surface group-hover:text-primary transition-colors line-clamp-2">{displayOperationalText(kb.title)}</h4>
                    <p className="text-xs text-on-surface-variant mt-2 line-clamp-2">{displayOperationalText(kb.problem || kb.content)}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="xl:col-span-5 bg-bg-surface border border-border-subtle rounded-lg p-6 flex flex-col h-full min-h-0">
          {!selectedArticle ? (
            <div className="flex-1 flex items-center justify-center text-on-surface-variant">Sélectionnez un article.</div>
          ) : (
            <div className="flex-1 overflow-y-auto pr-2 space-y-6">
              <div className="border-b border-border-subtle pb-5">
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedArticle.ruleId && <span className="text-xs font-mono text-primary bg-primary/10 border border-primary/30 rounded px-2 py-1">{selectedArticle.ruleId}</span>}
                  {selectedArticle.faultId && <span className="text-xs font-mono text-on-surface-variant bg-background border border-border-subtle rounded px-2 py-1">{selectedArticle.faultId}</span>}
                  <span className="text-xs font-mono text-on-surface-variant bg-background border border-border-subtle rounded px-2 py-1">{displayText(selectedArticle.failureType || selectedArticle.category)}</span>
                </div>
                <h2 className="text-xl font-display font-bold text-on-surface leading-tight">{displayOperationalText(selectedArticle.title)}</h2>
              </div>

              <div>
                <h3 className="text-sm font-mono text-on-surface-variant uppercase tracking-wider mb-2">Problème</h3>
                <p className="text-sm text-on-surface leading-relaxed">{displayOperationalText(selectedArticle.problem || selectedArticle.content)}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ArticleList title="Symptômes" items={selectedArticle.symptoms} />
                <ArticleList title="Cause" items={selectedArticle.causes} />
              </div>

              <ArticleList title="Résolution" items={selectedArticle.resolution} numbered />
              <ArticleList title="Équipements liés" items={selectedArticle.relatedEquipment} />
              <ArticleList title="Notes ingénieur" items={selectedArticle.engineerNotes} />
              <ArticleList title="Cas similaires" items={selectedArticle.similarCases} />

              <div>
                <h3 className="text-sm font-mono text-on-surface-variant uppercase tracking-wider mb-3">Tickets liés</h3>
                {(selectedArticle.relatedTickets || []).length === 0 ? (
                  <p className="text-sm text-on-surface-variant">Aucun ticket lié pour le moment.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedArticle.relatedTickets.map((ticket: any) => (
                      <div key={ticket.id} className="bg-background border border-border-subtle rounded-md p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-on-surface truncate">{displayOperationalText(ticket.title)}</p>
                            <p className="text-xs text-on-surface-variant mt-1 truncate">{displayText(ticket.site || 'Site')} / {displayText(ticket.room || 'Room')} / {ticket.equipment || displayText('Equipment')} / {displayStatus(ticket.status)}</p>
                          </div>
                          <span className="text-xs font-mono text-on-surface-variant shrink-0">{ticket.id.substring(0, 8)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-bg-surface border border-border-subtle rounded-lg w-full max-w-3xl shadow-xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b border-border-subtle">
              <h3 className="text-lg font-sans font-medium text-on-surface">Créer un article de connaissance</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-on-surface-variant hover:text-on-surface">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4 flex-1 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Titre</label>
                <input required name="title" type="text" className="w-full bg-background border border-border-subtle rounded-md px-3 py-2 text-on-surface focus:outline-none focus:border-primary" placeholder="ex. Procédure de reprise après défaut UPS" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1">Categorie</label>
                  <select required name="category" className="w-full bg-background border border-border-subtle rounded-md px-3 py-2 text-on-surface focus:outline-none focus:border-primary">
                    <option value="Power Systems">Systèmes énergie</option>
                    <option value="Cooling & HVAC">Climatisation et HVAC</option>
                    <option value="Network & Telemetry">Réseau et télémétrie</option>
                    <option value="General SOP">Procédure generale</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1">Tags</label>
                  <input name="tags" type="text" className="w-full bg-background border border-border-subtle rounded-md px-3 py-2 text-on-surface focus:outline-none focus:border-primary" placeholder="ups, urgence, énergie" />
                </div>
              </div>
              <div className="flex-1 flex flex-col min-h-[300px]">
                <label className="block text-sm font-medium text-on-surface mb-1">Contenu</label>
                <textarea required name="content" className="flex-1 w-full bg-background border border-border-subtle rounded-md px-3 py-2 text-on-surface font-mono text-sm focus:outline-none focus:border-primary" placeholder="# Contexte&#10;Décrivez le contexte...&#10;&#10;## Résolution&#10;Étapes de résolution..."></textarea>
              </div>
              {formError && <div className="text-sm text-status-warning">{formError}</div>}
              <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-md font-medium text-on-surface hover:bg-bg-secondary transition-colors">Annuler</button>
                <button disabled={isCreating} type="submit" className="bg-primary text-on-primary px-4 py-2 rounded-md font-medium hover:bg-primary-fixed-dim transition-colors disabled:opacity-50">
                  {isCreating ? 'Enregistrement...' : 'Enregistrer l’article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const ArticleList = ({ title, items, numbered = false }: { title: string; items?: string[]; numbered?: boolean }) => {
  const visibleItems = (items || []).filter(Boolean);
  const ListTag = numbered ? 'ol' : 'ul';

  return (
    <div className="bg-background border border-border-subtle rounded-lg p-4">
      <h3 className="text-sm font-mono text-on-surface-variant uppercase tracking-wider mb-3 flex items-center gap-2">
        {numbered ? <FileText className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
        {title}
      </h3>
      {visibleItems.length === 0 ? (
        <p className="text-sm text-on-surface-variant">Aucune entrée pour le moment.</p>
      ) : (
        <ListTag className={`${numbered ? 'list-decimal' : 'list-disc'} list-inside text-sm text-on-surface space-y-1`}>
          {visibleItems.map((item) => <li key={item}>{displayOperationalText(displayText(item))}</li>)}
        </ListTag>
      )}
    </div>
  );
};

export default KnowledgeCenter;
