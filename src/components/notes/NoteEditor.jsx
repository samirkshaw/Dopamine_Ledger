import { useState, useEffect, useRef, useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TurndownService from 'turndown';
import {
  Pin, Copy, Check, Trash2, ArrowLeft,
  Bold, Italic, Heading1, Heading2, List, ListOrdered,
  CheckSquare, CalendarCheck,
} from 'lucide-react';
import { C } from '../../theme.js';
import { todayStr } from '../../lib/dateHelpers.js';

const turndownService = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
});

export default function NoteEditor({
  note,
  categories = [],
  tasks = [],
  onUpdate,
  onDelete,
  onBack,
  onAddTask,
  onToggleTask,
}) {
  const [title, setTitle] = useState(note?.title || '');
  const [copied, setCopied] = useState(false);
  const [selectedText, setSelectedText] = useState('');

  const dirtyRef = useRef(false);
  const titleRef = useRef(note?.title || '');
  const contentRef = useRef(note?.content || '');
  const noteIdRef = useRef(note?.id);
  const timerRef = useRef(null);

  // Initialize Tiptap Editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2],
        },
      }),
    ],
    content: note?.content || '',
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      contentRef.current = html;
      dirtyRef.current = true;
      scheduleSave(titleRef.current, html);
    },
    onSelectionUpdate: ({ editor: ed }) => {
      const { from, to } = ed.state.selection;
      const text = ed.state.doc.textBetween(from, to, ' ').trim();
      setSelectedText(text);
    },
    onBlur: () => {
      handleBlur();
    },
    editorProps: {
      attributes: {
        class: 'tiptap',
      },
    },
  });

  // Flush pending auto-save when switching notes or unmounting
  useEffect(() => {
    return () => {
      if (dirtyRef.current && noteIdRef.current) {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        onUpdate(noteIdRef.current, {
          title: titleRef.current,
          content: contentRef.current,
        });
        dirtyRef.current = false;
      }
    };
  }, [note?.id, onUpdate]);

  // Sync state when active note changes
  useEffect(() => {
    noteIdRef.current = note?.id;
    setTitle(note?.title || '');
    titleRef.current = note?.title || '';
    contentRef.current = note?.content || '';
    dirtyRef.current = false;
    setSelectedText('');

    if (editor && !editor.isDestroyed) {
      const currentHtml = editor.getHTML();
      const targetContent = note?.content || '';
      if (currentHtml !== targetContent) {
        editor.commands.setContent(targetContent, false);
      }
    }
  }, [note?.id, editor]);

  function scheduleSave(newTitle, newContent) {
    dirtyRef.current = true;
    titleRef.current = newTitle;
    contentRef.current = newContent;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (dirtyRef.current && note?.id) {
        onUpdate(note.id, {
          title: titleRef.current,
          content: contentRef.current,
        });
        dirtyRef.current = false;
        timerRef.current = null;
      }
    }, 1500);
  }

  function handleTitleChange(val) {
    setTitle(val);
    scheduleSave(val, contentRef.current);
  }

  function handleBlur() {
    if (dirtyRef.current && note?.id) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      onUpdate(note.id, {
        title: titleRef.current,
        content: contentRef.current,
      });
      dirtyRef.current = false;
    }
  }

  function handleCopy() {
    if (!editor) return;
    try {
      const html = editor.getHTML();
      const markdown = turndownService.turndown(html);
      navigator.clipboard.writeText(markdown).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } catch (err) {
      console.error('Failed to convert or copy markdown', err);
    }
  }

  function togglePin() {
    if (!note?.id) return;
    onUpdate(note.id, { pinned: !note.pinned });
  }

  function handleCategoryChange(e) {
    if (!note?.id) return;
    const catId = e.target.value || null;
    onUpdate(note.id, { categoryId: catId });
  }

  function handleCreateTask(forToday = false) {
    if (!selectedText.trim() || !note?.id || !onAddTask) return;
    onAddTask({
      title: selectedText.trim(),
      sourceNoteId: note.id,
      ...(forToday ? { plannedDate: todayStr() } : {}),
    });
  }

  // Word and character counts from plain text
  const plainText = editor ? editor.getText() : '';
  const wordCount = plainText.trim() ? plainText.trim().split(/\s+/).length : 0;
  const charCount = plainText.length;

  const isQuickNote = note?.noteType === 'quick';

  // Created date formatted as "Aug 17, 2026"
  const createdDateFormatted = useMemo(() => {
    if (!note?.createdAt) return '';
    try {
      return new Date(note.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  }, [note?.createdAt]);

  // Linked tasks created from this note
  const linkedTasks = useMemo(() => {
    if (!note?.id || !tasks) return [];
    return tasks.filter(t => t.sourceNoteId === note.id);
  }, [tasks, note?.id]);

  return (
    <div className="hs-card-hover" style={{
      display: 'flex', flexDirection: 'column', height: '100%', minHeight: 480,
      background: 'rgba(21, 17, 32, 0.7)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: `1px solid ${C.line}`,
      borderRadius: 18,
      overflow: 'hidden', position: 'relative',
    }}>
      {/* Top action bar */}
      <div style={{
        padding: '12px 18px', borderBottom: `1px solid ${C.line}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 10, background: 'rgba(255,255,255,0.02)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 160 }}>
          {onBack && (
            <button
              onClick={onBack}
              className="hs-btn"
              title="Back to notes list"
              style={{
                background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.line}`,
                borderRadius: 8, padding: '6px 8px', color: C.ink, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <ArrowLeft size={16} />
            </button>
          )}

          {!isQuickNote && (
            <select
              value={note?.categoryId || ''}
              onChange={handleCategoryChange}
              style={{
                fontFamily: "'Outfit', sans-serif", fontSize: 12, padding: '6px 12px', borderRadius: 999,
                border: `1px solid ${C.line}`, background: '#181324', color: C.ink,
                outline: 'none', maxWidth: 160,
              }}
            >
              <option value="">No category</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}

          {isQuickNote && (
            <span style={{
              fontSize: 11, background: 'rgba(245, 200, 105, 0.15)', color: C.gold,
              border: '1px solid rgba(245, 200, 105, 0.3)',
              padding: '4px 10px', borderRadius: 999, fontWeight: 700,
            }}>
              Quick Note
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Pin toggle */}
          <button
            onClick={togglePin}
            className="hs-btn"
            title={note?.pinned ? 'Unpin note' : 'Pin to top'}
            style={{
              background: note?.pinned ? 'linear-gradient(135deg, #F5C869, #D97706)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${note?.pinned ? C.gold : C.line}`,
              borderRadius: 8, padding: '6px 10px',
              color: note?.pinned ? '#181003' : C.sub,
              boxShadow: note?.pinned ? '0 2px 10px rgba(245, 200, 105, 0.3)' : 'none',
              display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700,
            }}
          >
            <Pin size={13} fill={note?.pinned ? '#181003' : 'none'} />
            <span>{note?.pinned ? 'Pinned' : 'Pin'}</span>
          </button>

          {/* Copy as Markdown */}
          <button
            onClick={handleCopy}
            className="hs-btn"
            title="Copy formatted note as Markdown"
            style={{
              background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.line}`,
              borderRadius: 8, padding: '6px 10px', color: C.sub,
              display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600,
            }}
          >
            {copied ? <Check size={13} color="#10B981" /> : <Copy size={13} />}
            <span style={{ color: copied ? '#10B981' : C.sub }}>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {/* Delete note */}
          {onDelete && (
            <button
              onClick={() => onDelete(note.id)}
              className="hs-btn"
              title="Delete note"
              style={{
                background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.line}`,
                borderRadius: 8, padding: '6px 8px', color: C.bad,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Title & Created Date (for Notebook notes) */}
      {!isQuickNote && (
        <div style={{ padding: '14px 20px 10px', borderBottom: `1px solid ${C.line}` }}>
          <input
            value={title}
            onChange={e => handleTitleChange(e.target.value)}
            onBlur={handleBlur}
            placeholder="Untitled Note"
            style={{
              width: '100%', background: 'transparent', border: 'none',
              color: C.ink, fontFamily: "'Outfit', sans-serif", fontWeight: 700,
              fontSize: 20, outline: 'none', padding: '4px 0',
            }}
          />
          {createdDateFormatted && (
            <div style={{ fontSize: 11.5, color: C.sub, marginTop: 2, fontFamily: "'JetBrains Mono',monospace" }}>
              Created {createdDateFormatted}
            </div>
          )}
        </div>
      )}

      {/* Persistent formatting toolbar */}
      <div style={{
        padding: '8px 16px', borderBottom: `1px solid ${C.line}`,
        display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 5,
        background: 'rgba(255,255,255,0.015)',
      }}>
        {/* Bold */}
        <button
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className="hs-btn"
          title="Bold"
          style={{
            background: editor?.isActive('bold') ? 'linear-gradient(135deg, #F5C869, #D97706)' : 'transparent',
            color: editor?.isActive('bold') ? '#181003' : C.sub,
            border: `1px solid ${editor?.isActive('bold') ? C.gold : 'transparent'}`,
            borderRadius: 7, padding: '5px 8px', display: 'flex', alignItems: 'center',
          }}
        >
          <Bold size={13} strokeWidth={editor?.isActive('bold') ? 3 : 2} />
        </button>

        {/* Italic */}
        <button
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className="hs-btn"
          title="Italic"
          style={{
            background: editor?.isActive('italic') ? 'linear-gradient(135deg, #F5C869, #D97706)' : 'transparent',
            color: editor?.isActive('italic') ? '#181003' : C.sub,
            border: `1px solid ${editor?.isActive('italic') ? C.gold : 'transparent'}`,
            borderRadius: 7, padding: '5px 8px', display: 'flex', alignItems: 'center',
          }}
        >
          <Italic size={13} strokeWidth={editor?.isActive('italic') ? 3 : 2} />
        </button>

        <div style={{ width: 1, height: 16, background: C.line, margin: '0 2px' }} />

        {/* Heading 1 */}
        <button
          onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
          className="hs-btn"
          title="Heading 1"
          style={{
            background: editor?.isActive('heading', { level: 1 }) ? 'linear-gradient(135deg, #F5C869, #D97706)' : 'transparent',
            color: editor?.isActive('heading', { level: 1 }) ? '#181003' : C.sub,
            border: `1px solid ${editor?.isActive('heading', { level: 1 }) ? C.gold : 'transparent'}`,
            borderRadius: 7, padding: '5px 8px', display: 'flex', alignItems: 'center',
          }}
        >
          <Heading1 size={13} strokeWidth={2.4} />
        </button>

        {/* Heading 2 */}
        <button
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          className="hs-btn"
          title="Heading 2"
          style={{
            background: editor?.isActive('heading', { level: 2 }) ? 'linear-gradient(135deg, #F5C869, #D97706)' : 'transparent',
            color: editor?.isActive('heading', { level: 2 }) ? '#181003' : C.sub,
            border: `1px solid ${editor?.isActive('heading', { level: 2 }) ? C.gold : 'transparent'}`,
            borderRadius: 7, padding: '5px 8px', display: 'flex', alignItems: 'center',
          }}
        >
          <Heading2 size={13} strokeWidth={2.4} />
        </button>

        <div style={{ width: 1, height: 16, background: C.line, margin: '0 2px' }} />

        {/* Bullet List */}
        <button
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className="hs-btn"
          title="Bullet list"
          style={{
            background: editor?.isActive('bulletList') ? 'linear-gradient(135deg, #F5C869, #D97706)' : 'transparent',
            color: editor?.isActive('bulletList') ? '#181003' : C.sub,
            border: `1px solid ${editor?.isActive('bulletList') ? C.gold : 'transparent'}`,
            borderRadius: 7, padding: '5px 8px', display: 'flex', alignItems: 'center',
          }}
        >
          <List size={13} />
        </button>

        {/* Numbered List */}
        <button
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          className="hs-btn"
          title="Numbered list"
          style={{
            background: editor?.isActive('orderedList') ? 'linear-gradient(135deg, #F5C869, #D97706)' : 'transparent',
            color: editor?.isActive('orderedList') ? '#181003' : C.sub,
            border: `1px solid ${editor?.isActive('orderedList') ? C.gold : 'transparent'}`,
            borderRadius: 7, padding: '5px 8px', display: 'flex', alignItems: 'center',
          }}
        >
          <ListOrdered size={13} />
        </button>

        {/* Selection actions: + Task and + Today */}
        {selectedText && (
          <>
            <div style={{ width: 1, height: 16, background: C.line, margin: '0 4px' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, animation: 'fadeIn .15s ease' }}>
              <button
                onClick={() => handleCreateTask(false)}
                className="hs-btn"
                title={`Create task: "${selectedText.slice(0, 40)}..."`}
                style={{
                  background: 'linear-gradient(135deg, #F5C869, #D97706)', color: '#181003',
                  border: 'none', borderRadius: 999,
                  padding: '4px 10px', fontSize: 11.5, fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: 4,
                  boxShadow: '0 2px 8px rgba(245, 200, 105, 0.35)',
                }}
              >
                <CheckSquare size={12} strokeWidth={2.6} />
                <span>+ Task</span>
              </button>

              <button
                onClick={() => handleCreateTask(true)}
                className="hs-btn"
                title={`Create task planned for Today: "${selectedText.slice(0, 40)}..."`}
                style={{
                  background: 'linear-gradient(135deg, #10B981, #059669)', color: '#fff',
                  border: 'none', borderRadius: 999,
                  padding: '4px 10px', fontSize: 11.5, fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: 4,
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.35)',
                }}
              >
                <CalendarCheck size={12} strokeWidth={2.6} />
                <span>+ Today</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* WYSIWYG Editor Surface */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 320, overflowY: 'auto' }}>
        <div className="tiptap-editor-wrap">
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Linked Tasks list (tasks created from this note) */}
      {linkedTasks.length > 0 && (
        <div style={{
          padding: '14px 20px', borderTop: `1px solid ${C.line}`,
          background: 'rgba(255,255,255,0.015)',
        }}>
          <div style={{
            fontSize: 11, fontWeight: 700, color: C.sub, marginBottom: 8,
            letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <CheckSquare size={13} color={C.violet} />
            <span style={{ color: C.violet }}>LINKED TASKS ({linkedTasks.length})</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {linkedTasks.map(task => (
              <div
                key={task.id}
                className="hs-row"
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, fontSize: 13,
                  padding: '6px 8px', borderRadius: 8, background: 'rgba(255,255,255,0.02)',
                }}
              >
                <div
                  onClick={() => onToggleTask && onToggleTask(task.id)}
                  className="hs-cell"
                  style={{
                    width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                    background: task.done ? 'linear-gradient(135deg, #10B981, #059669)' : 'rgba(255,255,255,0.06)',
                    border: `1.6px solid ${task.done ? '#10B981' : C.line}`,
                    boxShadow: task.done ? '0 2px 8px rgba(16, 185, 129, 0.35)' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  {task.done && <Check size={11} color="#fff" strokeWidth={3.4} />}
                </div>
                <span style={{
                  textDecoration: task.done ? 'line-through' : 'none',
                  color: task.done ? C.sub : C.ink,
                  fontSize: 13, fontWeight: task.done ? 400 : 500,
                }}>
                  {task.title}
                </span>
                {task.plannedDate && (
                  <span style={{
                    fontSize: 10.5, color: C.gold, marginLeft: 'auto', fontWeight: 600,
                    background: 'rgba(245, 200, 105, 0.15)', border: '1px solid rgba(245, 200, 105, 0.3)',
                    padding: '2px 8px', borderRadius: 999,
                  }}>
                    Today
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer stats */}
      <div style={{
        padding: '10px 20px', borderTop: `1px solid ${C.line}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: 11.5, color: C.sub, background: 'rgba(255,255,255,0.01)',
        fontFamily: "'JetBrains Mono',monospace",
      }}>
        <span>{wordCount} words · {charCount} characters</span>
        <span style={{ color: C.good, display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />
          Auto-saved
        </span>
      </div>
    </div>
  );
}
