import { useMemo, useState } from 'react';
import {
  BookOpen,
  Eye,
  ExternalLink,
  FilePlus2,
  Plus,
  Send,
  Trash2,
  X,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import Block from '../components/ui/Block.jsx';
import Badge from '../components/ui/Badge.jsx';
import KpiRow from '../components/ui/KpiRow.jsx';
import SectionTabs from '../components/ui/SectionTabs.jsx';
import Table from '../components/ui/Table.jsx';
import ImagesField from '../components/partners/ImagesField.jsx';
import { useApp } from '../store/AppStore.jsx';
import { api } from '../lib/api.js';

const SECTIONS = ['Posts', 'Write a post'];

const ABOUT = {
  Posts: 'Everything written so far, and whether a reader can see it',
  'Write a post': 'The article itself — this is what appears on the website',
};

/** The three chips the website files a post under. */
const CATEGORIES = [
  { key: 'guide', label: 'Travel Guides' },
  { key: 'hotel', label: 'Hotel Stays' },
  { key: 'destination', label: 'Destinations' },
];

const labelFor = (key) => CATEGORIES.find((c) => c.key === key)?.label || key;

/** Where the website will put it. */
const SITE = import.meta.env?.VITE_WEBSITE_URL || 'https://smiraclubwebsite.vercel.app';

/** An empty section of an article. */
const EMPTY_SECTION = { h: '', p: '', list: '' };

const EMPTY_POST = {
  title: '',
  slug: '',
  category: 'guide',
  tag: '',
  excerpt: '',
  cover: '',
  readMins: 5,
  author: '',
  publishedOn: '',
  latest: true,
  popular: false,
  status: 'Draft',
  body: [{ ...EMPTY_SECTION }],
};

/** "Top 10 beaches" becomes "top-10-beaches", the same way the server does. */
const slugify = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);

/** About 200 words a minute, rounded up, so the writer need not count. */
const minutesToRead = (body) => {
  const words = body.reduce(
    (n, s) => n + `${s.h} ${s.p} ${s.list}`.trim().split(/\s+/).filter(Boolean).length,
    0,
  );
  return Math.max(1, Math.round(words / 200)) || 1;
};

const TONE = { Published: 'green', Draft: 'slate' };

/**
 * The blog, written here and read on the website.
 *
 * The website used to carry its own articles in its source, which meant
 * publishing one was a developer's job and a deploy. A post saved on this
 * screen is on the site as soon as it is marked Published — the blog pages
 * fetch what is here every time they render.
 *
 * Writing is split from the list on purpose: the list answers "what have we
 * got and who can see it", and the editor is a long form nobody wants to
 * scroll past to reach the list.
 */
export default function Blog() {
  const { db, create, update, remove, toast, live: online } = useApp();
  const posts = db.blogs || [];

  const [section, setSection] = useState(SECTIONS[0]);
  const [filter, setFilter] = useState('All');
  /** The post being edited, or null while writing a new one. */
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState({ ...EMPTY_POST });
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setDraft((p) => ({ ...p, [k]: e.target.value }));
  const setFlag = (k) => (e) => setDraft((p) => ({ ...p, [k]: e.target.checked }));

  const setBlock = (i, k, value) =>
    setDraft((p) => ({
      ...p,
      body: p.body.map((s, n) => (n === i ? { ...s, [k]: value } : s)),
    }));

  const addBlock = () => setDraft((p) => ({ ...p, body: [...p.body, { ...EMPTY_SECTION }] }));
  const dropBlock = (i) =>
    setDraft((p) => ({
      ...p,
      body: p.body.length > 1 ? p.body.filter((_, n) => n !== i) : p.body,
    }));

  /** Start a new one. */
  const blank = () => {
    setEditing(null);
    setDraft({ ...EMPTY_POST, body: [{ ...EMPTY_SECTION }] });
    setSection('Write a post');
  };

  /** Open one that exists. */
  const open = (post) => {
    setEditing(post);
    setDraft({
      ...EMPTY_POST,
      ...post,
      body: post.body?.length ? post.body.map((s) => ({ ...EMPTY_SECTION, ...s })) : [{ ...EMPTY_SECTION }],
    });
    setSection('Write a post');
  };

  /** A cover photograph, uploaded to our own store rather than linked. */
  const upload = async (body) => {
    const res = await api.post('/uploads', body);
    return res.data;
  };

  const save = (status) => {
    const title = draft.title.trim();
    if (!title) return toast('Give the post a title', 'danger');
    if (!draft.excerpt.trim()) return toast('Write the one-line summary — the cards print it', 'danger');

    const written = draft.body.some((s) => s.p.trim() || s.list.trim());
    if (status === 'Published' && !written) return toast('There is nothing in the article yet', 'danger');
    if (status === 'Published' && !draft.cover) return toast('A published post needs a cover photograph', 'danger');

    const body = {
      ...draft,
      title,
      slug: slugify(draft.slug || title),
      tag: draft.tag.trim() || labelFor(draft.category),
      excerpt: draft.excerpt.trim(),
      readMins: Number(draft.readMins) || minutesToRead(draft.body),
      status,
      // Published with no date prints a blank line on the website.
      publishedOn: status === 'Published' && !draft.publishedOn
        ? new Date().toISOString().slice(0, 10)
        : draft.publishedOn,
    };

    setSaving(true);
    if (editing) update('blogs', editing.id, body);
    else create('blogs', body);
    setSaving(false);

    setEditing(null);
    setDraft({ ...EMPTY_POST, body: [{ ...EMPTY_SECTION }] });
    setSection('Posts');
  };

  const drop = (post) => {
    if (!window.confirm(`Delete "${post.title}"? Readers will stop being able to open it.`)) return;
    remove('blogs', post.id);
  };

  const published = posts.filter((p) => p.status === 'Published');
  const shown = useMemo(
    () => (filter === 'All' ? posts : posts.filter((p) => p.status === filter)),
    [posts, filter],
  );

  const kpis = [
    { label: 'Posts', value: posts.length, icon: BookOpen, hint: 'everything written' },
    { label: 'On the website', value: published.length, icon: Send, tone: 'text-emerald-600', hint: 'readers can open these' },
    { label: 'Drafts', value: posts.length - published.length, icon: FilePlus2, hint: 'not out yet' },
    {
      label: 'Reads',
      value: posts.reduce((n, p) => n + Number(p.views || 0), 0),
      icon: Eye,
      tone: 'text-sky-600',
      hint: 'counted by the website',
    },
  ];

  const body = {
    Posts: (
      <Block
        title="Posts"
        note={
          online
            ? 'A post marked Published is on the website straight away'
            : 'Not signed in, so nothing here is saved or sent to the website'
        }
        wide
        action={
          <div className="flex flex-wrap items-center gap-2">
            {['All', 'Published', 'Draft'].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition ${
                  filter === f
                    ? 'border-brand-600 bg-brand-50 text-brand-700'
                    : 'border-ink-900/10 text-ink-600 hover:bg-surface-soft'
                }`}
              >
                {f}
              </button>
            ))}
            <button className="btn-action btn-sm" onClick={blank}>
              <Plus size={14} /> Write a post
            </button>
          </div>
        }
      >
        <Table
          minWidth={840}
          empty={
            posts.length === 0
              ? 'Nothing written yet. Write a post and it appears on the website.'
              : `No ${filter.toLowerCase()} posts.`
          }
          head={['Title', 'Filed under', 'Date', 'Read', 'Reads', 'Status', '']}
          rows={shown.map((p) => ({
            key: p.id,
            cells: [
              <button type="button" onClick={() => open(p)} className="text-left font-semibold text-ink-900 hover:text-brand-700">
                {p.title}
                <span className="block text-xs font-normal text-ink-400">/blogs/{p.slug}</span>
              </button>,
              <span>
                {labelFor(p.category)}
                {p.tag && p.tag !== labelFor(p.category) && (
                  <span className="block text-xs text-ink-400">prints as &ldquo;{p.tag}&rdquo;</span>
                )}
              </span>,
              p.published || <span className="text-ink-400">—</span>,
              `${p.readMins} min`,
              <span className="num">{p.views || 0}</span>,
              <span className="flex flex-wrap items-center gap-1.5">
                <Badge tone={TONE[p.status]}>{p.status}</Badge>
                {p.status === 'Published' && p.popular && <Badge tone="violet">Popular</Badge>}
              </span>,
              <span className="flex items-center justify-end gap-1">
                {p.status === 'Published' && (
                  <a
                    href={`${SITE}/blogs/${p.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    title="Open it on the website"
                    className="rounded-lg p-1.5 text-ink-400 transition hover:bg-surface-soft hover:text-brand-700"
                  >
                    <ExternalLink size={15} />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => drop(p)}
                  title="Delete this post"
                  className="rounded-lg p-1.5 text-ink-400 transition hover:bg-rose-50 hover:text-rose-600"
                >
                  <Trash2 size={15} />
                </button>
              </span>,
            ],
          }))}
        />
      </Block>
    ),

    'Write a post': (
      <>
        <Block
          title={editing ? `Editing "${editing.title}"` : 'Write a post'}
          note={
            editing
              ? `Saved as ${editing.id}. The address stays /blogs/${editing.slug} however the title changes.`
              : 'The title, the summary and the cover are what a reader sees before they open it'
          }
          wide
          action={
            <div className="flex flex-wrap items-center gap-2">
              {editing && (
                <button className="btn-line btn-sm" onClick={blank}>
                  <X size={14} /> New post instead
                </button>
              )}
              <button className="btn-line btn-sm" onClick={() => save('Draft')} disabled={saving}>
                Save as draft
              </button>
              <button className="btn-action btn-sm" onClick={() => save('Published')} disabled={saving}>
                <Send size={14} /> {saving ? 'Saving…' : 'Publish'}
              </button>
            </div>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label">Title</label>
              <input
                className="input"
                placeholder="Top 10 beach destinations in India"
                value={draft.title}
                onChange={set('title')}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="label">One-line summary</label>
              <textarea
                className="input min-h-[72px]"
                placeholder="From the serene beaches to vibrant coastlines, the ten stretches of coast worth planning a trip around."
                value={draft.excerpt}
                onChange={set('excerpt')}
              />
              <p className="mt-1 text-xs text-ink-500">Printed on the card and under the headline.</p>
            </div>

            <div>
              <label className="label">Filed under</label>
              <select className="input" value={draft.category} onChange={set('category')}>
                {CATEGORIES.map((c) => (
                  <option key={c.key} value={c.key}>{c.label}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-ink-500">Which chip on the website finds it.</p>
            </div>
            <div>
              <label className="label">Words on the card</label>
              <input
                className="input"
                placeholder={labelFor(draft.category)}
                value={draft.tag}
                onChange={set('tag')}
              />
              <p className="mt-1 text-xs text-ink-500">Left empty it prints &ldquo;{labelFor(draft.category)}&rdquo;.</p>
            </div>

            <div>
              <label className="label">Author</label>
              <input className="input" placeholder="Smira Club desk" value={draft.author} onChange={set('author')} />
            </div>
            <div>
              <label className="label">Minutes to read</label>
              <input type="number" min="1" className="input" value={draft.readMins} onChange={set('readMins')} />
              <p className="mt-1 text-xs text-ink-500">
                About {minutesToRead(draft.body)} min by what is written so far.
              </p>
            </div>

            <div>
              <label className="label">Date on the post</label>
              <input type="date" className="input" value={draft.publishedOn} onChange={set('publishedOn')} />
              <p className="mt-1 text-xs text-ink-500">Left empty, publishing dates it today.</p>
            </div>
            <div>
              <label className="label">Address on the website</label>
              <input
                className="input"
                placeholder={slugify(draft.title) || 'top-10-beaches'}
                value={draft.slug}
                onChange={(e) => setDraft((p) => ({ ...p, slug: e.target.value }))}
              />
              <p className="mt-1 text-xs text-ink-500">
                /blogs/{slugify(draft.slug || draft.title) || '…'} — leave it empty and the title decides.
              </p>
            </div>

            <div className="sm:col-span-2">
              <label className="label">Cover photograph</label>
              <ImagesField
                value={draft.cover ? [draft.cover] : []}
                onChange={(list) => setDraft((p) => ({ ...p, cover: list[list.length - 1] || '' }))}
                upload={upload}
                label="Blog cover"
                hint="One photograph, landscape. It fills the top of the article and the card in the list."
              />
            </div>

            <div className="sm:col-span-2 flex flex-wrap gap-5 border-t border-ink-900/[0.07] pt-4">
              <label className="flex items-center gap-2 text-sm font-semibold text-ink-700">
                <input type="checkbox" checked={draft.latest} onChange={setFlag('latest')} />
                Show under Latest Blogs
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold text-ink-700">
                <input type="checkbox" checked={draft.popular} onChange={setFlag('popular')} />
                Show under Popular Blogs
              </label>
              <p className="text-sm text-ink-500">
                The website draws those two rails. A post on neither is reachable only by its address.
              </p>
            </div>
          </div>
        </Block>

        <Block
          title="The article"
          note="One block per heading. A block with no heading is just prose, which is how an article usually opens."
          wide
          action={
            <button className="btn-line btn-sm" onClick={addBlock}>
              <Plus size={14} /> Add a block
            </button>
          }
        >
          <div className="space-y-4">
            {draft.body.map((s, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <div key={i} className="rounded-xl border border-ink-900/[0.07] bg-surface-soft/40 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-ink-400">Block {i + 1}</p>
                  {draft.body.length > 1 && (
                    <button
                      type="button"
                      onClick={() => dropBlock(i)}
                      title="Remove this block"
                      className="rounded-lg p-1.5 text-ink-400 transition hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <div className="mt-3 grid gap-3">
                  <div>
                    <label className="label">Heading</label>
                    <input
                      className="input"
                      placeholder="For the classic beach holiday"
                      value={s.h}
                      onChange={(e) => setBlock(i, 'h', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label">Paragraphs</label>
                    <textarea
                      className="input min-h-[120px]"
                      placeholder={'One paragraph.\n\nA blank line starts the next one.'}
                      value={s.p}
                      onChange={(e) => setBlock(i, 'p', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label">Bulleted list</label>
                    <textarea
                      className="input min-h-[90px]"
                      placeholder={'One bullet per line.\nNorth Goa — shacks, music and water sports.'}
                      value={s.list}
                      onChange={(e) => setBlock(i, 'list', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Block>
      </>
    ),
  };

  return (
    <>
      <PageHeader
        eyebrow="Website"
        title="Blog"
        subtitle="Articles for the website. What is published here is what a reader sees there."
      >
        <a href={`${SITE}/blogs`} target="_blank" rel="noreferrer" className="btn-line">
          <ExternalLink size={16} /> See the blog
        </a>
        <button className="btn-action" onClick={blank}>
          <Plus size={16} /> Write a post
        </button>
      </PageHeader>

      <div className="mt-4">
        <KpiRow items={kpis} cols={4} />
      </div>

      <SectionTabs className="mt-6" items={SECTIONS} value={section} onChange={setSection} />

      {/* What this view is, so nobody has to open it to find out. */}
      <p className="mt-4 text-sm text-ink-500">{ABOUT[section]}</p>

      <div className="mt-3 grid gap-5 xl:grid-cols-2">{body[section]}</div>
    </>
  );
}
