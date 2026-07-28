import React, { useState } from 'react';
import { Search, Book, HelpCircle, FileText, ChevronRight } from 'lucide-react';
import { useKnowledgeBase } from '../../hooks/useKnowledge';

const KnowledgeCenter = () => {
  const [search, setSearch] = useState('');
  const { data: knowledgeBase, isLoading } = useKnowledgeBase();

  return (
    <div className="h-full flex flex-col space-y-6">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-display font-bold text-on-surface">Knowledge Center</h2>
          <p className="text-on-surface-variant font-sans mt-1">Engineering documentation and standard operating procedures.</p>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
        
        {/* Categories Sidebar */}
        <div className="col-span-1 bg-bg-surface border border-border-subtle rounded-lg p-6 flex flex-col h-full">
          <h3 className="text-sm font-mono text-on-surface-variant uppercase tracking-wider mb-4">Categories</h3>
          <ul className="space-y-2">
            <li className="flex items-center justify-between text-sm font-sans font-medium text-primary bg-bg-secondary p-2 rounded-md cursor-pointer">
              <span>All Articles</span>
              <span className="text-xs bg-background px-2 py-0.5 rounded text-on-surface-variant">{knowledgeBase?.length || 0}</span>
            </li>
            <li className="flex items-center justify-between text-sm font-sans text-on-surface hover:bg-bg-secondary p-2 rounded-md cursor-pointer transition-colors">
              <span>Power Systems</span>
            </li>
            <li className="flex items-center justify-between text-sm font-sans text-on-surface hover:bg-bg-secondary p-2 rounded-md cursor-pointer transition-colors">
              <span>Cooling & HVAC</span>
            </li>
            <li className="flex items-center justify-between text-sm font-sans text-on-surface hover:bg-bg-secondary p-2 rounded-md cursor-pointer transition-colors">
              <span>Network & Telemetry</span>
            </li>
          </ul>
        </div>

        {/* Content Area */}
        <div className="col-span-1 lg:col-span-3 bg-bg-surface border border-border-subtle rounded-lg p-6 flex flex-col h-full">
          
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
            <input 
              type="text" 
              placeholder="Search SOPs, recovery guides, or equipment manuals..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-background border border-border-subtle rounded-md pl-10 pr-4 py-3 text-sm font-sans focus:outline-none focus:border-primary transition-colors text-on-surface placeholder:text-on-surface-variant"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {isLoading ? (
              <div className="text-on-surface-variant text-sm">Loading articles...</div>
            ) : knowledgeBase?.filter((kb: any) => kb.title.toLowerCase().includes(search.toLowerCase())).map((kb: any) => (
              <div key={kb.id} className="bg-background border border-border-subtle rounded-md p-4 flex items-center justify-between hover:border-primary cursor-pointer transition-colors group">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-bg-secondary rounded-md group-hover:bg-primary/10 transition-colors">
                    <Book className="w-5 h-5 text-on-surface-variant group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <h4 className="font-sans font-medium text-on-surface mb-1 group-hover:text-primary transition-colors">{kb.title}</h4>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-on-surface-variant">{kb.id.substring(0,8)}</span>
                      <span className="text-xs font-sans text-on-surface-variant bg-bg-secondary px-2 py-0.5 rounded">{kb.category}</span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default KnowledgeCenter;
