import Link from "next/link";
import {
  ArrowUpRight,
  Flame,
  Hash,
  Heart,
  MessageCircle,
  PenLine,
  Search,
  Send,
  Sparkles,
  Users,
  X
} from "lucide-react";
import { createFeedCommentAction, createFeedPostAction, toggleFeedReactionAction } from "@/app/feed/actions";
import { PikoPet } from "@/components/piko-pet";
import { feedReactionTypes, filterFeedPosts, getFeedTopicCounts } from "@/lib/feed";
import { getFeedPosts } from "@/lib/supabase/feed";
import { hasSupabaseSession } from "@/lib/supabase/profile";
import type { FeedPost, FeedReactionType } from "@/lib/types";

type Props = {
  searchParams: {
    notice?: string;
    q?: string;
    topic?: string;
  };
};

const reactionLabels: Record<FeedReactionType, string> = {
  like: "Like",
  love: "Love",
  helpful: "Helpful"
};

export default async function FeedPage({ searchParams }: Props) {
  const [posts, hasSession] = await Promise.all([getFeedPosts(), hasSupabaseSession()]);
  const query = searchParams.q?.trim() ?? "";
  const selectedTopic = searchParams.topic?.trim() ?? "";
  const topics = getFeedTopicCounts(posts);
  const filteredPosts = filterFeedPosts(posts, query, selectedTopic);
  const totalComments = posts.reduce((total, post) => total + post.comments.length, 0);

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <section className="grid overflow-hidden rounded-lg bg-midnight text-white shadow-panel lg:grid-cols-[1fr_310px]">
        <div className="p-6 sm:p-8 lg:p-10">
          <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gold">
            <Sparkles className="h-4 w-4" />
            Piko community
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">Find your next coffee conversation.</h1>
          <p className="mt-4 max-w-2xl leading-7 text-white/70">
            Search local recommendations, brewing tips, cafe updates, and the questions coffee people are talking about.
          </p>

          <FeedSearch query={query} selectedTopic={selectedTopic} />

          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/65">
            <span className="flex items-center gap-2"><Users className="h-4 w-4 text-gold" /> {posts.length} discussions</span>
            <span className="flex items-center gap-2"><MessageCircle className="h-4 w-4 text-gold" /> {totalComments} replies</span>
            <span className="flex items-center gap-2"><Hash className="h-4 w-4 text-gold" /> {topics.length} topics</span>
          </div>
        </div>

        <div className="relative hidden min-h-72 overflow-hidden bg-roast/70 lg:flex lg:flex-col lg:items-center lg:justify-end">
          <div className="absolute inset-x-6 top-7 rounded-md bg-white p-4 text-sm font-semibold leading-5 text-midnight shadow-panel">
            I found the coziest conversations for you!
            <span className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 bg-white" />
          </div>
          <PikoPet mode="waving" />
        </div>
      </section>

      {searchParams.notice ? <Notice notice={searchParams.notice} /> : null}

      <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
        <div className="min-w-0">
          <Composer hasSession={hasSession} />

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-clay">Community conversations</p>
              <h2 className="mt-1 text-2xl font-semibold text-midnight">
                {query || selectedTopic ? `${filteredPosts.length} matching ${filteredPosts.length === 1 ? "discussion" : "discussions"}` : "Latest from the community"}
              </h2>
            </div>
            {(query || selectedTopic) && (
              <Link href="/feed" className="focus-ring inline-flex items-center gap-1.5 text-sm font-semibold text-clay hover:text-roast">
                <X className="h-4 w-4" /> Clear filters
              </Link>
            )}
          </div>

          <section className="mt-4 grid gap-4" aria-label="Feed discussions">
            {filteredPosts.length ? (
              filteredPosts.map((post) => <FeedPostCard key={post.id} post={post} hasSession={hasSession} />)
            ) : (
              <EmptyFeed query={query} selectedTopic={selectedTopic} />
            )}
          </section>
        </div>

        <aside className="grid gap-4 lg:sticky lg:top-6">
          <section className="rounded-lg border border-roast/10 bg-white p-5 shadow-panel">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-clay" />
              <h2 className="text-lg font-semibold text-midnight">Browse topics</h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-ink/60">Jump into a conversation that matches your mood.</p>
            <div className="mt-4 grid gap-2">
              <TopicLink label="All discussions" count={posts.length} active={!selectedTopic} query={query} />
              {topics.map(({ topic, count }) => (
                <TopicLink key={topic} label={topic} count={count} active={selectedTopic.toLowerCase() === topic.toLowerCase()} query={query} />
              ))}
            </div>
          </section>

          <section className="overflow-hidden rounded-lg bg-lagoon p-5 text-white shadow-panel">
            <Heart className="h-6 w-6 text-gold" />
            <h2 className="mt-3 text-xl font-semibold">Keep it kind and useful.</h2>
            <p className="mt-2 text-sm leading-6 text-white/75">Share firsthand tips, support local cafes, and help every coffee lover feel welcome.</p>
          </section>
        </aside>
      </section>
    </main>
  );
}

function FeedSearch({ query, selectedTopic }: { query: string; selectedTopic: string }) {
  return (
    <form action="/feed" className="mt-6 flex max-w-2xl flex-col gap-2 sm:flex-row" role="search">
      {selectedTopic ? <input type="hidden" name="topic" value={selectedTopic} /> : null}
      <label className="relative min-w-0 flex-1">
        <span className="sr-only">Search topics or discussions</span>
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink/45" />
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search topics or discussions…"
          className="focus-ring h-12 w-full rounded-md border-0 bg-white pl-12 pr-4 text-midnight shadow-sm placeholder:text-ink/45"
        />
      </label>
      <button className="focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-md bg-gold px-5 font-semibold text-midnight transition hover:bg-white">
        <Search className="h-4 w-4" /> Search
      </button>
    </form>
  );
}

function Composer({ hasSession }: { hasSession: boolean }) {
  return (
    <section className="rounded-lg border border-roast/10 bg-white p-5 shadow-panel sm:p-6">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-clay/10 text-clay"><PenLine className="h-5 w-5" /></span>
        <div>
          <h2 className="text-xl font-semibold text-midnight">Start a discussion</h2>
          <p className="mt-1 text-sm text-ink/60">Ask the community or share something worth knowing.</p>
        </div>
      </div>
      {hasSession ? (
        <form action={createFeedPostAction} className="mt-5 grid gap-3">
          <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
            <label className="grid gap-1.5 text-sm font-semibold text-ink/70">
              Discussion title
              <input name="title" required placeholder="What would you like to talk about?" className="focus-ring h-11 rounded-md border border-ink/15 px-3 font-normal text-ink" />
            </label>
            <label className="grid gap-1.5 text-sm font-semibold text-ink/70">
              Topic
              <input name="topic" defaultValue="General" placeholder="e.g. Brewing tips" className="focus-ring h-11 rounded-md border border-ink/15 px-3 font-normal text-ink" />
            </label>
          </div>
          <label className="grid gap-1.5 text-sm font-semibold text-ink/70">
            Your post
            <textarea name="body" required placeholder="Share the details with the community…" className="focus-ring min-h-28 rounded-md border border-ink/15 p-3 font-normal text-ink" />
          </label>
          <button className="focus-ring inline-flex items-center justify-center gap-2 rounded-md bg-midnight px-4 py-3 font-semibold text-white transition hover:bg-roast sm:justify-self-end">
            <Send className="h-4 w-4" /> Post discussion
          </button>
        </form>
      ) : (
        <div className="mt-5 flex flex-col gap-3 rounded-lg bg-linen p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-6 text-ink/70">Sign in to start a discussion, leave a reply, or react.</p>
          <Link href="/auth?next=/feed" className="focus-ring inline-flex shrink-0 items-center justify-center gap-1 rounded-md bg-midnight px-4 py-2.5 font-semibold text-white">
            Sign in to join <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </section>
  );
}

function FeedPostCard({ post, hasSession }: { post: FeedPost; hasSession: boolean }) {
  const initials = post.authorName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const reactionTotal = Object.values(post.reactionCounts).reduce((total, count) => total + count, 0);

  return (
    <article className="interactive-lift rounded-lg border border-roast/10 bg-white p-5 shadow-panel sm:p-6">
      <div className="flex gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-roast text-sm font-bold text-gold" aria-hidden="true">{initials}</div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="font-semibold text-midnight">{post.authorName}</p>
            <span className="text-ink/30">•</span>
            <time className="text-sm text-ink/50" dateTime={post.createdAt}>{formatFeedDate(post.createdAt)}</time>
          </div>
          <span className="mt-2 inline-flex items-center gap-1 rounded-md bg-lagoon/10 px-2.5 py-1 text-xs font-semibold text-lagoon"><Hash className="h-3 w-3" /> {post.topic}</span>
        </div>
      </div>

      <h2 className="mt-4 text-2xl font-semibold leading-snug text-midnight">{post.title}</h2>
      <p className="mt-3 whitespace-pre-line leading-7 text-ink/75">{post.body}</p>

      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-roast/10 pt-4">
        {feedReactionTypes.map((reactionType) => (
          <form key={reactionType} action={toggleFeedReactionAction}>
            <input type="hidden" name="postId" value={post.id} />
            <input type="hidden" name="reactionType" value={reactionType} />
            <button
              disabled={!hasSession}
              aria-label={`${reactionLabels[reactionType]} reaction, ${post.reactionCounts[reactionType]}`}
              className={`focus-ring rounded-md px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-55 ${
                post.viewerReaction === reactionType ? "bg-gold text-midnight" : "bg-crema text-roast hover:bg-roast/10"
              }`}
            >
              {reactionLabels[reactionType]} · {post.reactionCounts[reactionType]}
            </button>
          </form>
        ))}
        <span className="ml-auto inline-flex items-center gap-1.5 text-sm font-semibold text-ink/50">
          <MessageCircle className="h-4 w-4" /> {post.comments.length} {post.comments.length === 1 ? "reply" : "replies"}
          <span className="sr-only"> and {reactionTotal} reactions</span>
        </span>
      </div>

      {(post.comments.length > 0 || hasSession) && (
        <section className="mt-4 rounded-lg bg-linen p-4">
          {post.comments.length > 0 && (
            <div className="grid gap-3">
              {post.comments.map((comment) => (
                <div key={comment.id} className="border-l-2 border-sage pl-3">
                  <p className="text-sm font-semibold text-midnight">{comment.authorName}</p>
                  <p className="mt-1 text-sm leading-6 text-ink/70">{comment.body}</p>
                </div>
              ))}
            </div>
          )}
          {hasSession ? (
            <form action={createFeedCommentAction} className={`${post.comments.length ? "mt-4" : ""} grid gap-2 sm:grid-cols-[1fr_auto]`}>
              <input type="hidden" name="postId" value={post.id} />
              <label className="sr-only" htmlFor={`comment-${post.id}`}>Reply to {post.title}</label>
              <input id={`comment-${post.id}`} name="body" required placeholder="Write a helpful reply…" className="focus-ring h-11 min-w-0 rounded-md border border-ink/15 px-3" />
              <button className="focus-ring rounded-md bg-midnight px-4 py-2.5 font-semibold text-white">Reply</button>
            </form>
          ) : null}
        </section>
      )}
    </article>
  );
}

function TopicLink({ label, count, active, query }: { label: string; count: number; active: boolean; query: string }) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (label !== "All discussions") params.set("topic", label);
  const href = params.size ? `/feed?${params.toString()}` : "/feed";

  return (
    <Link
      href={href}
      className={`focus-ring flex items-center justify-between gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition ${active ? "bg-midnight text-white" : "bg-linen text-ink/70 hover:bg-crema hover:text-midnight"}`}
      aria-current={active ? "page" : undefined}
    >
      <span className="flex min-w-0 items-center gap-2"><Hash className={`h-4 w-4 shrink-0 ${active ? "text-gold" : "text-clay"}`} /><span className="truncate">{label}</span></span>
      <span className={`rounded-full px-2 py-0.5 text-xs ${active ? "bg-white/10 text-white" : "bg-roast/5 text-ink/50"}`}>{count}</span>
    </Link>
  );
}

function EmptyFeed({ query, selectedTopic }: { query: string; selectedTopic: string }) {
  return (
    <div className="rounded-lg border border-dashed border-roast/20 bg-white/70 p-8 text-center shadow-panel sm:p-12">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-md bg-clay/10 text-clay"><Search className="h-6 w-6" /></span>
      <h3 className="mt-4 text-xl font-semibold text-midnight">No conversations found</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink/60">
        We could not find anything matching {query ? `“${query}”` : "that search"}{selectedTopic ? ` in ${selectedTopic}` : ""}. Try a broader phrase or explore every discussion.
      </p>
      <Link href="/feed" className="focus-ring mt-5 inline-flex items-center gap-2 rounded-md bg-midnight px-4 py-2.5 font-semibold text-white">
        View all discussions
      </Link>
    </div>
  );
}

function Notice({ notice }: { notice: string }) {
  const messages: Record<string, string> = {
    posted: "Post added to the feed.",
    commented: "Comment added.",
    demo: "Demo mode: connect Supabase to save feed activity."
  };

  return <div className="mt-6 rounded-lg bg-sage/20 p-4 text-sm font-semibold text-lagoon">{messages[notice] ?? "Saved."}</div>;
}

function formatFeedDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}
