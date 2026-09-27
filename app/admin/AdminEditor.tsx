"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { DEFAULT_PORTFOLIO_CONTENT, type PortfolioContent } from "../../lib/portfolio-content";

type EditorTab = "content" | "layout";

function isPortfolioContent(value: unknown): value is PortfolioContent {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const content = value as Record<string, unknown>;
  return Boolean(
    content.profile && typeof content.profile === "object" &&
    content.about && typeof content.about === "object" &&
    content.contact && typeof content.contact === "object" &&
    content.layout && typeof content.layout === "object" &&
    Array.isArray(content.stats) && Array.isArray(content.experience) &&
    Array.isArray(content.projects) && Array.isArray(content.skills) &&
    Array.isArray(content.customSections),
  );
}

export default function AdminEditor({ ownerEmail }: { ownerEmail: string }) {
  const router = useRouter();
  const [content, setContent] = useState(DEFAULT_PORTFOLIO_CONTENT);
  const [draft, setDraft] = useState(JSON.stringify(DEFAULT_PORTFOLIO_CONTENT, null, 2));
  const [tab, setTab] = useState<EditorTab>("content");
  const [status, setStatus] = useState("Loading saved portfolio…");
  const [busy, setBusy] = useState(false);
  const [imageTarget, setImageTarget] = useState<"profile" | "about">("profile");

  useEffect(() => {
    let active = true;
    fetch("/api/content", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Saved content could not be loaded.");
        return response.json() as Promise<{ content?: unknown }>;
      })
      .then(({ content: saved }) => {
        if (!active) return;
        if (isPortfolioContent(saved)) {
          setContent(saved);
          setDraft(JSON.stringify(saved, null, 2));
          setStatus("Saved portfolio loaded.");
        } else {
          setStatus("No saved version yet. The current portfolio content is ready to edit.");
        }
      })
      .catch(() => {
        if (active) setStatus("Could not load saved content. Check the Supabase setup, then reload.");
      });
    return () => { active = false; };
  }, []);

  function applyContent(next: PortfolioContent) {
    setContent(next);
    setDraft(JSON.stringify(next, null, 2));
  }

  function editDraft(value: string) {
    setDraft(value);
    try {
      const parsed: unknown = JSON.parse(value);
      if (!isPortfolioContent(parsed)) {
        setStatus("The JSON must include the portfolio's profile, sections, layout, and contact data.");
        return;
      }
      setContent(parsed);
      setStatus("Draft is valid. Save to publish it.");
    } catch {
      setStatus("The JSON has a syntax error. Fix it before saving.");
    }
  }

  async function saveContent() {
    let parsed: unknown;
    try {
      parsed = JSON.parse(draft);
    } catch {
      setStatus("Fix the JSON syntax before saving.");
      return;
    }
    if (!isPortfolioContent(parsed)) {
      setStatus("The content structure is incomplete.");
      return;
    }

    setBusy(true);
    setStatus("Saving changes…");
    try {
      const response = await fetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: parsed }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Save failed.");
      setContent(parsed);
      setDraft(JSON.stringify(parsed, null, 2));
      setStatus("Changes saved and live on the portfolio.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not save changes.");
    } finally {
      setBusy(false);
    }
  }

  async function uploadImage(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
      setStatus("Choose an image under 5 MB (JPG, PNG, WebP, or GIF).");
      return;
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      setStatus("Supabase browser settings are missing.");
      return;
    }

    setBusy(true);
    setStatus("Uploading image…");
    const supabase = createBrowserClient(url, key);
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const path = `images/${Date.now()}-${safeName}`;
    const { error } = await supabase.storage.from("portfolio-media").upload(path, file, { contentType: file.type, upsert: false });
    if (error) {
      setStatus("Upload failed. Check the storage policies in Supabase.");
      setBusy(false);
      return;
    }

    const publicUrl = supabase.storage.from("portfolio-media").getPublicUrl(path).data.publicUrl;
    const next = imageTarget === "profile"
      ? { ...content, profile: { ...content.profile, portrait: publicUrl } }
      : { ...content, about: { ...content.about, image: publicUrl } };
    applyContent(next);
    setStatus("Image uploaded. Save changes to publish it.");
    setBusy(false);
  }

  function moveSection(sectionId: string, delta: number) {
    const currentOrder = [...content.layout.sectionOrder];
    const index = currentOrder.indexOf(sectionId);
    const targetIndex = index + delta;
    if (index < 0 || targetIndex < 0 || targetIndex >= currentOrder.length) return;
    [currentOrder[index], currentOrder[targetIndex]] = [currentOrder[targetIndex], currentOrder[index]];
    applyContent({ ...content, layout: { ...content.layout, sectionOrder: currentOrder } });
  }

  function addCustomSection() {
    const id = `custom-${Date.now()}`;
    const next = {
      ...content,
      customSections: [...content.customSections, { id, title: "New section", body: "Add your content here.", image: "", alignment: "left" as const }],
      layout: { ...content.layout, sectionOrder: [...content.layout.sectionOrder.filter((item) => item !== "contact"), `custom:${id}`, "contact"] },
    };
    applyContent(next);
    setStatus("Section added to the draft. Update its content, then save.");
  }

  function downloadBackup() {
    const blob = new Blob([draft], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "portfolio-content.json";
    link.click();
    URL.revokeObjectURL(link.href);
  }

  async function signOut() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (url && key) await createBrowserClient(url, key).auth.signOut();
    router.replace("/admin");
  }

  const sections = content.layout.sectionOrder;
  const imageUrl = imageTarget === "profile" ? content.profile.portrait : content.about.image;

  return (
    <main className="min-h-screen bg-[#0F1216] text-[#E7EAEE]">
      <header className="border-b border-[#2A313B] bg-[#14181E]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <Link href="/" className="text-xs text-[#9AA3AE] hover:text-white">← View portfolio</Link>
            <h1 className="mt-1 text-xl font-bold">Portfolio editor</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="hidden text-[#9AA3AE] sm:inline">{ownerEmail}</span>
            <a href="/" target="_blank" rel="noreferrer" className="border border-[#39424E] px-3 py-2 hover:border-[#5CC98E]">Preview site</a>
            <button type="button" onClick={downloadBackup} className="border border-[#39424E] px-3 py-2 hover:border-[#5CC98E]">Export backup</button>
            <button type="button" onClick={signOut} className="border border-[#39424E] px-3 py-2 text-[#B7C2CD] hover:text-white">Sign out</button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-7 sm:px-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section className="min-w-0">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[#2A313B]">
            <div className="flex gap-5">
              <button type="button" onClick={() => setTab("content")} className={`border-b-2 px-1 py-3 text-sm ${tab === "content" ? "border-[#5CC98E] text-white" : "border-transparent text-[#9AA3AE]"}`}>Content data</button>
              <button type="button" onClick={() => setTab("layout")} className={`border-b-2 px-1 py-3 text-sm ${tab === "layout" ? "border-[#5CC98E] text-white" : "border-transparent text-[#9AA3AE]"}`}>Layout & media</button>
            </div>
            <button disabled={busy} type="button" onClick={saveContent} className="mb-2 bg-[#28734E] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#32865D] disabled:opacity-60">{busy ? "Working…" : "Save and publish"}</button>
          </div>

          {tab === "content" ? (
            <div>
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-semibold">All portfolio content</h2>
                <button type="button" onClick={addCustomSection} className="border border-[#39424E] px-3 py-2 text-sm hover:border-[#5CC98E]">+ Add section</button>
              </div>
              <textarea
                aria-label="Portfolio content JSON"
                spellCheck={false}
                value={draft}
                onChange={(event) => editDraft(event.target.value)}
                className="min-h-[68vh] w-full resize-y border border-[#303944] bg-[#14181E] p-4 font-mono text-xs leading-6 text-[#D7DEE5] outline-none focus:border-[#5CC98E]"
              />
              <p className="mt-2 text-xs leading-5 text-[#9AA3AE]">Edit any text, list, link, image URL, or section in this structured content. Keep the JSON valid; the editor checks it before publishing.</p>
            </div>
          ) : (
            <div className="space-y-8">
              <div>
                <h2 className="font-semibold">Page text alignment</h2>
                <div className="mt-3 inline-flex border border-[#39424E] p-1">
                  {(["left", "center"] as const).map((alignment) => (
                    <button key={alignment} type="button" aria-pressed={content.layout.textAlignment === alignment} onClick={() => applyContent({ ...content, layout: { ...content.layout, textAlignment: alignment } })} className={`px-4 py-2 text-sm capitalize ${content.layout.textAlignment === alignment ? "bg-[#28734E] text-white" : "text-[#B7C2CD]"}`}>{alignment}</button>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="font-semibold">Section order</h2>
                <p className="mt-1 text-sm text-[#9AA3AE]">Move complete sections up or down on the published page.</p>
                <ol className="mt-3 divide-y divide-[#2A313B] border-y border-[#2A313B]">
                  {sections.map((sectionId, index) => (
                    <li key={sectionId} className="flex items-center justify-between gap-3 py-3 text-sm">
                      <span className="min-w-0 truncate">{sectionId.startsWith("custom:") ? content.customSections.find((section) => `custom:${section.id}` === sectionId)?.title || "Custom section" : sectionId}</span>
                      <span className="flex shrink-0 gap-2">
                        <button type="button" aria-label={`Move section ${sectionId} up`} disabled={index === 0} onClick={() => moveSection(sectionId, -1)} className="h-8 w-8 border border-[#39424E] disabled:opacity-30">↑</button>
                        <button type="button" aria-label={`Move section ${sectionId} down`} disabled={index === sections.length - 1} onClick={() => moveSection(sectionId, 1)} className="h-8 w-8 border border-[#39424E] disabled:opacity-30">↓</button>
                      </span>
                    </li>
                  ))}
                </ol>
              </div>

              <div>
                <h2 className="font-semibold">Images</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" onClick={() => setImageTarget("profile")} className={`border px-3 py-2 text-sm ${imageTarget === "profile" ? "border-[#5CC98E]" : "border-[#39424E]"}`}>Profile portrait</button>
                  <button type="button" onClick={() => setImageTarget("about")} className={`border px-3 py-2 text-sm ${imageTarget === "about" ? "border-[#5CC98E]" : "border-[#39424E]"}`}>About image</button>
                </div>
                <div className="mt-4 flex flex-col gap-4 sm:flex-row">
                  {/* Remote images are shown as previews before being published. */}
                  <Image src={imageUrl} alt="Selected portfolio image" width={160} height={128} unoptimized className="h-32 w-40 border border-[#39424E] object-cover" />
                  <div className="min-w-0 flex-1">
                    <label htmlFor="image-upload" className="block text-sm text-[#B7C2CD]">Upload image, max 5 MB</label>
                    <input id="image-upload" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => uploadImage(event.target.files?.[0])} className="mt-2 block w-full text-sm text-[#B7C2CD] file:mr-3 file:border-0 file:bg-[#252C35] file:px-3 file:py-2 file:text-[#E7EAEE]" />
                    <label htmlFor="image-position" className="mt-4 block text-sm text-[#B7C2CD]">Portrait crop position</label>
                    <input id="image-position" value={content.profile.portraitPosition} onChange={(event) => applyContent({ ...content, profile: { ...content.profile, portraitPosition: event.target.value } })} className="mt-2 w-full border border-[#39424E] bg-[#14181E] px-3 py-2 text-sm outline-none focus:border-[#5CC98E]" placeholder="center 35%" />
                  </div>
                </div>
              </div>
            </div>
          )}

          <p role="status" aria-live="polite" className="mt-5 min-h-5 text-sm text-[#B7C2CD]">{status}</p>
        </section>

        <aside className="h-fit border-t border-[#2A313B] pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#5CC98E]">Published content</p>
          <h2 className="mt-2 text-lg font-semibold">{content.profile.name}</h2>
          <p className="mt-1 text-sm leading-6 text-[#9AA3AE]">{content.profile.role}</p>
          <div className="mt-5 border-t border-[#2A313B] pt-4 text-sm text-[#B7C2CD]">
            <div className="flex justify-between py-2"><span>Sections</span><span>{sections.length}</span></div>
            <div className="flex justify-between py-2"><span>Projects</span><span>{content.projects.length}</span></div>
            <div className="flex justify-between py-2"><span>Experience entries</span><span>{content.experience.length}</span></div>
            <div className="flex justify-between py-2"><span>Custom sections</span><span>{content.customSections.length}</span></div>
          </div>
          <a href="/" target="_blank" rel="noreferrer" className="mt-5 inline-block text-sm text-[#5CC98E]">Open published portfolio ↗</a>
        </aside>
      </div>
    </main>
  );
}
