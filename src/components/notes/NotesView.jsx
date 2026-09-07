import { useState, useMemo, useEffect } from 'react';
import { Plus, Pin, BookOpen, Trash2, ArrowUpRight, Search, FileText, Sparkles, X } from 'lucide-react';
import { C } from '../../theme.js';
import { textOn } from '../../lib/format.js';
import NoteEditor from './NoteEditor.jsx';

const LECTURE_TEMPLATE = `<h2>Topic</h2><p></p><h2>Key Points</h2><ul><li><p></p></li></ul><h2>Questions</h2><ul><li><p></p></li></ul>`;

function formatRelativeTime(dateStrOrDate) {
  if (!dateStrOrDate) return '';
  const date = new Date(dateStrOrDate);
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function NotesView({
  notes = [],
  categories = [],
  tasks = [],
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  onPromoteQuickNote,
  onManageCats,
  onAddTask,
  onToggleTask,
}) {
  const [quickInput, setQuickInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [mobileShowEditor, setMobileShowEditor] = useState(false);
  const [promoteNote, setPromoteNote] = useState(null); // Note object to promote
  const [promoteTitle, setPromoteTitle] = useState('');
  const [promoteCatId, setPromoteCatId] = useState('');

  // Partition notes into quick notes and notebook notes
  const quickNotes = useMemo(() => {
    return notes.filter(n => n.noteType === 'quick');
  }, [notes]);

  const notebookNotes = useMemo(() => {
    return notes.filter(n => n.noteType !== 'quick');
  }, [notes]);

  // Filtered notebook notes
  const filteredNotes = useMemo(() => {
    let result = notebookNotes;
    if (filterCat !== 'all') {
      result = result.filter(n => n.categoryId === filterCat);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(n =>
        (n.title && n.title.toLowerCase().includes(q)) ||
        (n.content && n.content.toLowerCase().includes(q))
      );
    }
    return result;
  }, [notebookNotes, filterCat, searchQuery]);

  // Ensure activeNoteId points to a valid notebook note if possible
  useEffect(() => {
    if (!activeNoteId && filteredNotes.length > 0) {
      setActiveNoteId(filteredNotes[0].id);
    } else if (activeNoteId && !notes.some(n => n.id === activeNoteId)) {
      setActiveNoteId(filteredNotes[0]?.id || null);
    }
  }, [activeNoteId, filteredNotes, notes]);

  const activeNote = useMemo(() => {
    return notes.find(n => n.id === activeNoteId) || null;
  }, [notes, activeNoteId]);

  function handleCreateQuickNote(e) {
    e?.preventDefault();
    if (!quickInput.trim()) return;
    onAddNote({
      content: quickInput.trim(),
      noteType: 'quick',
    });
    setQuickInput('');
  }

  function handleCreateNotebookNote(templateContent = '') {
    const categoryId = filterCat !== 'all' ? filterCat : (categories[0]?.id || null);
    onAddNote({
      title: templateContent ? 'Lecture Notes' : '',
      content: templateContent,
      categoryId,
      noteType: 'note',
    }).then(newRow => {
      if (newRow?.id) {
        setActiveNoteId(newRow.id);
        setMobileShowEditor(true);
      }
    });
  }

  function startPromote(note) {
    setPromoteNote(note);
    // Extract first line of plain content as suggested title
    const plain = (note.content || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    setPromoteTitle(plain.slice(0, 50) || 'Untitled Note');
    setPromoteCatId(categories[0]?.id || '');
  }

  function confirmPromote() {
    if (!promoteNote) return;
    onPromoteQuickNote(promoteNote.id, promoteTitle.trim() || 'Untitled Note', promoteCatId || null);
    setActiveNoteId(promoteNote.id);
    setPromoteNote(null);
    setMobileShowEditor(true);
  }

  function handleSelectNote(noteId) {
    setActiveNoteId(noteId);
    setMobileShowEditor(true);
  }

  function handleDeleteNote(id) {
    onDeleteNote(id);
    if (activeNoteId === id) {
      const remaining = filteredNotes.filter(n => n.id !== id);
      setActiveNoteId(remaining[0]?.id || null);
      setMobileShowEditor(false);
    }
  }

  const catMap = useMemo(() => {
    const map = {};
    categories.forEach(c => { map[c.id] = c; });
    return map;
  }, [categories]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeIn .2s ease' }}>
      {/* ── Area 1: Quick Notes Scratchpad ─────────────────────────────────── */}
      <div style={{
        background: C.panel, border: `1px solid ${C.line}`,
        borderRadius: 16, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>⚡</span>
            <span style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: '0.02em' }}>
              QUICK NOTES SCRATCHPAD
            </span>
          </div>
          <span style={{ fontSize: 11.5, color: C.sub }}>
            {quickNotes.length} {quickNotes.length === 1 ? 'scratchpad note' : 'scratchpad notes'}
          </span>
        </div>

        {/* Quick note input box */}
        <form onSubmit={handleCreateQuickNote} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <textarea
            value={quickInput}
            onChange={e => setQuickInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleCreateQuickNote();
              }
            }}
            placeholder="Type a quick scratchpad note... (Ctrl+Enter to save)"
            rows={2}
            style={{
              width: '100%', background: 'rgba(255,255,255,0.05)',
              border: `1px solid ${C.line}`, borderRadius: 10,
              padding: '10px 12px', color: C.ink, fontSize: 13,
              fontFamily: "'Inter',sans-serif", outline: 'none', resize: 'vertical',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 11, color: C.sub }}>Press Ctrl+Enter to save instantly</span>
            <button
              type="submit"
              disabled={!quickInput.trim()}
              className="hs-btn"
              style={{
                padding: '7px 16px', borderRadius: 999, border: 'none',
                background: quickInput.trim() ? C.tealDark : 'rgba(255,255,255,0.08)',
                color: quickInput.trim() ? '#fff' : C.sub,
                fontSize: 12, fontWeight: 700,
                cursor: quickInput.trim() ? 'pointer' : 'default',
              }}
            >
              + Add Quick Note
            </button>
          </div>
        </form>

        {/* Existing Quick Notes grid */}
        {quickNotes.length > 0 && (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 10, marginTop: 4,
          }}>
            {quickNotes.map(n => (
              <div
                key={n.id}
                style={{
                  background: 'rgba(255,255,255,0.035)', border: `1px solid ${C.line}`,
                  borderRadius: 12, padding: '12px 14px', display: 'flex', flexDirection: 'column',
                  justifyContent: 'space-between', gap: 10, position: 'relative',
                  transition: 'background .15s ease, border-color .15s ease',
                }}
              >
                <div style={{
                  fontSize: 13, color: C.ink, whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word', maxHeight: 110, overflowY: 'auto',
                  lineHeight: 1.55,
                }}>
                  {n.content}
                </div>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  borderTop: `1px solid rgba(255,255,255,0.06)`, paddingTop: 8, marginTop: 'auto',
                }}>
                  <span style={{ fontSize: 11, color: C.sub }}>{formatRelativeTime(n.updatedAt || n.createdAt)}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <button
                      onClick={() => startPromote(n)}
                      className="hs-btn"
                      title="Move to Notebook"
                      style={{
                        background: 'rgba(232,193,112,0.12)', border: `1px solid rgba(232,193,112,0.3)`,
                        borderRadius: 6, padding: '3px 8px', color: C.gold, fontSize: 11,
                        fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3,
                      }}
                    >
                      <ArrowUpRight size={12} />
                      <span>Move to Notebook</span>
                    </button>
                    <button
                      onClick={() => onDeleteNote(n.id)}
                      className="hs-btn"
                      title="Delete quick note"
                      style={{
                        background: 'transparent', border: 'none', color: C.sub,
                        padding: '4px', cursor: 'pointer', display: 'flex',
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Area 2: Notebook Master-Detail Layout ───────────────────────────── */}
      <div className="notes-layout" style={{ minHeight: 600 }}>
        {/* Left pane: Notes list (hidden on mobile when editor is active) */}
        <div className={`notes-list ${mobileShowEditor ? 'notes-hide-mobile' : ''}`} style={{
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          {/* Header & New Note actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 16 }}>
              Notebook
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={() => handleCreateNotebookNote()}
                className="hs-btn"
                style={{
                  background: C.tealDark, color: '#fff', border: 'none',
                  borderRadius: 8, padding: '7px 11px', fontSize: 11.5, fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: 4,
                }}
              >
                <Plus size={13} /> Blank Note
              </button>
              <button
                onClick={() => handleCreateNotebookNote(LECTURE_TEMPLATE)}
                className="hs-btn"
                title="Create note from Lecture Notes template"
                style={{
                  background: 'rgba(139,127,224,0.18)', color: C.violet,
                  border: `1px solid rgba(139,127,224,0.4)`, borderRadius: 8,
                  padding: '7px 11px', fontSize: 11.5, fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: 4,
                }}
              >
                <Sparkles size={13} /> Lecture Note
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div style={{ position: 'relative' }}>
            <Search size={14} color={C.sub} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search notebook notes..."
              style={{
                width: '100%', background: C.panel, border: `1px solid ${C.line}`,
                borderRadius: 10, padding: '8px 12px 8px 30px', color: C.ink,
                fontSize: 12.5, outline: 'none',
              }}
            />
          </div>

          {/* Category filter chips */}
          <div className="hs-filter-ribbon" style={{ display: 'flex', flexWrap: 'wrap', gap: 5, alignItems: 'center' }}>
            <button
              onClick={() => setFilterCat('all')}
              className="hs-btn"
              style={{
                fontFamily: "'JetBrains Mono',monospace", fontSize: 11, padding: '5px 10px', borderRadius: 16,
                border: `1.4px solid ${filterCat === 'all' ? C.chip : C.line}`,
                background: filterCat === 'all' ? C.chip : 'transparent',
                color: filterCat === 'all' ? '#fff' : C.sub,
              }}
            >
              All
            </button>
            {categories.map(c => (
              <button
                key={c.id}
                onClick={() => setFilterCat(c.id)}
                className="hs-btn"
                style={{
                  fontFamily: "'JetBrains Mono',monospace", fontSize: 11, padding: '5px 10px', borderRadius: 16,
                  border: `1.4px solid ${filterCat === c.id ? c.color : C.line}`,
                  background: filterCat === c.id ? c.color : 'transparent',
                  color: filterCat === c.id ? textOn(c.color) : C.sub,
                }}
              >
                {c.name}
              </button>
            ))}
            <button
              onClick={onManageCats}
              className="hs-btn"
              title="Manage note categories"
              style={{
                width: 26, height: 26, borderRadius: '50%', border: `1.4px solid ${C.line}`,
                background: 'transparent', color: C.sub, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 12,
              }}
            >
              ⚙
            </button>
          </div>

          {/* Notebook list items */}
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 6,
            maxHeight: 'calc(100vh - 300px)', minHeight: 300, overflowY: 'auto',
            paddingRight: 2,
          }}>
            {filteredNotes.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '36px 12px', color: C.sub,
                background: C.panel, border: `1px dashed ${C.line}`, borderRadius: 12,
              }}>
                <FileText size={24} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                <div style={{ fontSize: 13, fontWeight: 600 }}>No notes found</div>
                <div style={{ fontSize: 11.5, marginTop: 4 }}>
                  {notebookNotes.length === 0 ? 'Create your first note above.' : 'Try a different filter or search.'}
                </div>
              </div>
            ) : (
              filteredNotes.map(n => {
                const isActive = activeNoteId === n.id;
                const cat = n.categoryId ? catMap[n.categoryId] : null;
                const snippet = (n.content || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

                return (
                  <div
                    key={n.id}
                    onClick={() => handleSelectNote(n.id)}
                    className="hs-btn"
                    style={{
                      background: isActive ? 'rgba(232,193,112,0.12)' : C.panel,
                      border: `1px solid ${isActive ? C.gold : C.line}`,
                      borderRadius: 12, padding: '12px 14px', cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', gap: 5, textAlign: 'left',
                      transition: 'border-color .15s ease, background .15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
                        {n.pinned && (
                          <Pin size={11} fill={C.gold} color={C.gold} style={{ flexShrink: 0 }} />
                        )}
                        <span style={{
                          fontWeight: isActive ? 700 : 600, fontSize: 13.5, color: C.ink,
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>
                          {n.title || 'Untitled Note'}
                        </span>
                      </div>
                      {cat && (
                        <span style={{
                          width: 8, height: 8, borderRadius: '50%', background: cat.color, flexShrink: 0,
                        }} title={cat.name} />
                      )}
                    </div>

                    {snippet && (
                      <div style={{
                        fontSize: 12, color: C.sub, whiteSpace: 'nowrap',
                        overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.4,
                      }}>
                        {snippet.slice(0, 70)}
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                      <span style={{ fontSize: 10.5, color: C.sub }}>
                        {formatRelativeTime(n.updatedAt || n.createdAt)}
                      </span>
                      {cat && (
                        <span style={{ fontSize: 10, color: cat.color, fontWeight: 500 }}>
                          {cat.name}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right pane: NoteEditor (hidden on mobile unless active) */}
        <div className={`notes-editor ${!mobileShowEditor ? 'notes-hide-mobile' : 'notes-editor-fullscreen'}`} style={{
          minWidth: 0,
        }}>
          {activeNote ? (
            <NoteEditor
              note={activeNote}
              categories={categories}
              tasks={tasks}
              onUpdate={onUpdateNote}
              onDelete={handleDeleteNote}
              onBack={() => setMobileShowEditor(false)}
              onAddTask={onAddTask}
              onToggleTask={onToggleTask}
            />
          ) : (
            <div style={{
              height: '100%', minHeight: 460, background: C.panel,
              border: `1px dashed ${C.line}`, borderRadius: 16,
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', color: C.sub, gap: 10, padding: 20,
            }}>
              <BookOpen size={32} style={{ opacity: 0.4 }} />
              <div style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>No note selected</div>
              <div style={{ fontSize: 12, textAlign: 'center', maxWidth: 300 }}>
                Select a note from the left list or create a new one to begin editing.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Promote Quick Note Modal ────────────────────────────────────────── */}
      {promoteNote && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(6,5,10,0.68)',
            zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'fadeIn .15s ease', padding: 16,
          }}
          onClick={() => setPromoteNote(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: 420, maxWidth: '100%', background: '#18141F',
              border: `1px solid ${C.line}`, borderRadius: 16, padding: 22,
              boxShadow: '0 12px 40px rgba(0,0,0,0.6)', display: 'flex',
              flexDirection: 'column', gap: 14,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 15 }}>
                Move Note to Notebook
              </div>
              <button
                onClick={() => setPromoteNote(null)}
                style={{ background: 'none', border: 'none', color: C.sub, cursor: 'pointer' }}
              >
                <X size={17} />
              </button>
            </div>

            <div style={{
              fontSize: 12, color: C.sub, background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${C.line}`, borderRadius: 8, padding: '8px 10px',
              maxHeight: 80, overflowY: 'auto', whiteSpace: 'pre-wrap',
            }}>
              {promoteNote.content}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, color: C.sub, fontWeight: 600 }}>Note Title</label>
              <input
                value={promoteTitle}
                onChange={e => setPromoteTitle(e.target.value)}
                placeholder="Give your notebook note a title"
                autoFocus
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.line}`,
                  borderRadius: 10, padding: '9px 12px', color: C.ink, fontSize: 13, outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, color: C.sub, fontWeight: 600 }}>Category (Optional)</label>
              <select
                value={promoteCatId}
                onChange={e => setPromoteCatId(e.target.value)}
                style={{
                  width: '100%', background: '#171320', border: `1px solid ${C.line}`,
                  borderRadius: 10, padding: '9px 12px', color: C.ink, fontSize: 13, outline: 'none',
                }}
              >
                <option value="">No category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              <button
                onClick={confirmPromote}
                className="hs-btn"
                style={{
                  flex: 1, padding: '10px 0', borderRadius: 10, border: 'none',
                  background: C.tealDark, color: '#fff', fontSize: 13, fontWeight: 700,
                }}
              >
                Move to Notebook
              </button>
              <button
                onClick={() => setPromoteNote(null)}
                className="hs-btn"
                style={{
                  flex: 1, padding: '10px 0', borderRadius: 10, border: `1px solid ${C.line}`,
                  background: 'transparent', color: C.sub, fontSize: 13, fontWeight: 600,
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
