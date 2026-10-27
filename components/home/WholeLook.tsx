"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { ArrowRight, Check, ChevronLeft, ChevronRight, RotateCcw, ShoppingBag, Shuffle, SlidersHorizontal, Sparkles } from "lucide-react";
import type { Product } from "@/data/product";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import styles from "./WholeLook.module.css";
import { colorMockup, stylingColors, stylingCartItem } from "@/lib/styling-products";



type Part = "top" | "bottom";
type Placement = { zoom: number; x: number; y: number };
type Choice = { id: string; color: string; variant: string; placement: Placement };
const initial = (): Choice => ({ id: "", color: "", variant: "", placement: { zoom: 1, x: 0, y: 0 } });
const topWords = /\b(top|tops|shirt|shirts|blouse|blouses|tee|tees|tshirt|tshirts|sweater|sweaters|hoodie|hoodies|cardigan|cardigans|jacket|jackets|sweatshirt|sweatshirts|pullover|pullovers|vest|vests)\b|بلوز|توب|تيشيرت|قميص|سويت|هودي|جاكيت|كارديجان/i;
const bottomWords = /\b(bottom|bottoms|pant|pants|trouser|trousers|jeans|skirt|skirts|shorts|legging|leggings|jogger|joggers)\b|بنطلون|بناطيل|جيب|شورت|ليجن/i;

// The optional stylingSlot field lets the catalog explicitly classify ambiguous names.
function slot(product: Product, categories: { id: string; name: string; slug: string }[]): Part | null {
  const explicit = product.stylingSlot;
  if (explicit === "") return null;
  if (explicit === "top" || explicit === "bottom") return explicit;
  const category = categories.find(c => c.id === product.category || c.slug === product.category);
  const text = `${product.category} ${category?.name ?? ""} ${category?.slug ?? ""} ${product.title}`.replace(/[-_]/g, " ");
  if (bottomWords.test(text)) return "bottom";
  if (topWords.test(text)) return "top";
  return null;
}

function Garment({ product, part, placement, color }: { product: Product; part: Part; placement: Placement; color: string }) {
  const source = colorMockup(product, color);
  if (!source) return null;
  return <div data-look-part={part} className={`${styles.garment} ${styles[part]}`}><img src={source} alt={`${product.title} — ${color}`} draggable={false} style={{ transform: `translate(${placement.x}%, ${placement.y}%) scale(${placement.zoom})` }} /></div>;
}
export default function WholeLook() {
  const { lang } = useLanguage();
  const ar = lang === "ar";
  const say = (en: string, arabic: string) => ar ? arabic : en;
  const { addItem, items } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [attempt, setAttempt] = useState(0);
  const [part, setPart] = useState<Part>("top");
  const [choices, setChoices] = useState<Record<Part, Choice>>({ top: initial(), bottom: initial() });
  const [adjust, setAdjust] = useState(true);
  const [tucked, setTucked] = useState(false);
  const [message, setMessage] = useState("");
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ part: Part; placement: Placement; center: { x: number; y: number }; distance: number; width: number; height: number } | null>(null);
  const latestChoices = useRef(choices);
  latestChoices.current = choices;
  const rebaseGesture = (element: HTMLDivElement, activePart: Part) => {
    const points = [...pointers.current.values()];
    if (!points.length) { gesture.current = null; return; }
    const placement = latestChoices.current[activePart].placement;
    const image = element.querySelector<HTMLImageElement>(`[data-look-part="${activePart}"] img`);
    const bounds = image?.getBoundingClientRect();
    if (!bounds) return;
    const second = points[1] ?? points[0];
    gesture.current = { part: activePart, placement: { ...placement }, center: { x: (points[0].x + second.x) / 2, y: (points[0].y + second.y) / 2 }, distance: Math.hypot(points[0].x - second.x, points[0].y - second.y), width: bounds.width / placement.zoom, height: bounds.height / placement.zoom };
  };
  const pointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (pointers.current.size >= 2) return;
    const hit = (event.target as Element).closest<HTMLElement>("[data-look-part]")?.dataset.lookPart as Part | undefined;
    const activePart = gesture.current?.part ?? hit ?? part;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    event.currentTarget.setPointerCapture(event.pointerId);
    setPart(activePart);
    setMessage("");
    rebaseGesture(event.currentTarget, activePart);
  };
  const pointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(event.pointerId) || !gesture.current) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const points = [...pointers.current.values()];
    const second = points[1] ?? points[0];
    const start = gesture.current;
    const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
    const placement = {
      x: clamp(start.placement.x + (((points[0].x + second.x) / 2 - start.center.x) / start.width) * 100, -100, 100),
      y: clamp(start.placement.y + (((points[0].y + second.y) / 2 - start.center.y) / start.height) * 100, -100, 100),
      zoom: start.distance > 0 && points.length === 2 ? clamp(start.placement.zoom * Math.hypot(points[0].x - second.x, points[0].y - second.y) / start.distance, .5, 2) : start.placement.zoom,
    };
    const next = { ...latestChoices.current, [start.part]: { ...latestChoices.current[start.part], placement } };
    latestChoices.current = next;
    setChoices(next);
  };
  const pointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointers.current.delete(event.pointerId)) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    rebaseGesture(event.currentTarget, gesture.current?.part ?? part);
  };
  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");
    fetch("/api/products", { signal: controller.signal, cache: "no-store" }).then(r => { if (!r.ok) throw new Error(); return r.json(); }).then(data => {
      setProducts((Array.isArray(data.products) ? data.products : []).filter((p: Product) => p.status === "active" && p.variants?.some(v => v.stock > 0) && stylingColors(p).length > 0));
      setCategories(Array.isArray(data.categories) ? data.categories : []);
      setStatus("ready");
    }).catch(() => { if (!controller.signal.aborted) setStatus("error"); });
    return () => controller.abort();
  }, [attempt]);
  const catalog = useMemo(() => ({ top: products.filter(p => slot(p, categories) === "top"), bottom: products.filter(p => slot(p, categories) === "bottom") }), [products, categories]);
  const selected = { top: catalog.top.find(p => p.id === choices.top.id) ?? catalog.top[0], bottom: catalog.bottom.find(p => p.id === choices.bottom.id) ?? catalog.bottom[0] };
  const product = selected[part];
  const choice = choices[part];
  const selectedColor = (p: Part) => selected[p] ? (choices[p].color || stylingColors(selected[p]!)[0] || "") : "";
  const update = (patch: Partial<Choice>) => { setChoices(prev => ({ ...prev, [part]: { ...prev[part], ...patch } })); setMessage(""); };
  const pick = (id: string) => update({ ...initial(), id });
  const cycle = (delta: number) => {
    const list = catalog[part];
    if (!list.length) return;
    pick(list[(list.findIndex(p => p.id === product?.id) + delta + list.length) % list.length].id);
  };
  const total = (selected.top?.price ?? 0) + (selected.bottom?.price ?? 0);
  const complete = selected.top && selected.bottom;
  const configured = complete && (["top", "bottom"] as Part[]).every(p => selected[p] && stylingCartItem(selected[p]!, selectedColor(p), choices[p].variant) !== null);
  const addLook = () => {
    if (!configured) { setMessage(say("Choose a color and size for both pieces first.", "اختاري اللون والمقاس لكل قطعة الأول.")); return; }
    const pieces = (["top", "bottom"] as Part[]).map(p => stylingCartItem(selected[p]!, selectedColor(p), choices[p].variant)!);
    if (pieces.some(piece => items.filter(i => i.productId === piece.productId && i.variantId === piece.variantId).reduce((sum, i) => sum + i.qty, 0) >= piece.stock!)) {
      setMessage(say("Your bag already has all available stock for one of these pieces.", "الكمية المتاحة من إحدى القطع موجودة بالفعل في الشنطة.")); return;
    }
    pieces.forEach(addItem);
    setMessage(say("Your whole look is in the bag!", "اللوك كله في الشنطة!"));
  };
  return <section id="whole-look" className={styles.section} aria-labelledby="whole-look-title">
    <div className={styles.heading}><span className={styles.eyebrow}><Sparkles size={14} /> {say("THE HEDOOMYY STYLING ROOM", "غرفة تنسيق هدومي")}</span><h2 id="whole-look-title">{say("Good pieces. Better together.", "اللوك عليكي، التنسيق علينا")}</h2><p>{say("A little mixing. A little matching. A whole lot of you.", "اختاري توب، جرّبي بنطلون، واعملي اللوك اللي شبهك.")}</p></div>
    {status === "loading" ? <div className={styles.loading} role="status"><Sparkles className="animate-pulse" /> {say("Opening your wardrobe…", "بنجهز دولابك…")}</div> : status === "error" ? <div className={styles.loading}><p>{say("Your wardrobe couldn't load.", "حصلت مشكلة في تحميل القطع.")}</p><button onClick={() => setAttempt(n => n + 1)}>{say("Try again", "حاولي تاني")}</button></div> : <div className={styles.studio}>
      <div className={styles.stage}>
        <div className={styles.stageHeader}><span>{say("YOUR OUTFIT, YOUR RULES", "لوكك على مزاجك")}</span><span className={styles.live}><span /> {say("Live styling", "تنسيق مباشر")}</span></div>
        <p className={styles.touchHint}>{say("Drag a piece to move it · Pinch with two fingers to resize", "اسحبي القطعة عشان تحركيها · كبّري وصغّري بصباعين")}</p>
        <div className={styles.touchParts}>{(["top", "bottom"] as Part[]).map(p => <button key={p} aria-pressed={part === p} onClick={() => setPart(p)}>{p === "top" ? say("Move top", "تحريك التوب") : say("Move bottom", "تحريك البنطلون")}</button>)}</div>
        <div className={`${styles.mannequin} ${tucked ? styles.tucked : ""}`} dir="ltr" onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerEnd} onPointerCancel={pointerEnd} onLostPointerCapture={pointerEnd}>
          <div className={styles.halo} />
          <svg className={styles.figure} viewBox="0 0 300 600" aria-label={say("Mannequin outfit preview", "معاينة اللوك على المانيكان")} role="img"><defs><linearGradient id="mannequin-shade"><stop stopColor="#d9c9bb"/><stop offset=".5" stopColor="#f3e8de"/><stop offset="1" stopColor="#cdbbab"/></linearGradient></defs><g fill="url(#mannequin-shade)" stroke="#c8b5a5" strokeWidth="1"><ellipse cx="150" cy="60" rx="26" ry="36"/><path d="M137 91 L137 113 L104 127 Q91 132 87 156 L69 267 L77 310 Q82 317 87 308 L83 267 L108 181 L115 242 L107 285 Q100 310 111 345 L119 451 L121 550 Q107 568 116 573 L143 573 L145 448 L150 348 L155 448 L158 573 L184 573 Q193 567 179 550 L181 451 L190 345 Q201 310 193 285 L185 242 L192 181 L217 267 L213 308 Q218 317 223 310 L231 267 L213 156 Q209 132 196 127 L163 113 L163 91 Z"/></g></svg>
          {selected.bottom && <Garment key={`bottom-${selected.bottom.id}`} product={selected.bottom} part="bottom" color={selectedColor("bottom")} placement={choices.bottom.placement} />}
          {selected.top && <Garment key={`top-${selected.top.id}`} product={selected.top} part="top" color={selectedColor("top")} placement={choices.top.placement} />}
          <span className={styles.floor}>HEDOOMYY / THE WHOLE LOOK</span>
        </div>
        <div className={styles.stageTools}><button onClick={() => { setChoices({ top: { ...initial(), id: catalog.top[Math.floor(Math.random() * catalog.top.length)]?.id ?? "" }, bottom: { ...initial(), id: catalog.bottom[Math.floor(Math.random() * catalog.bottom.length)]?.id ?? "" } }); setMessage(""); }} disabled={!complete}><Shuffle size={15}/>{say("Surprise me", "فاجئيني")}</button><button aria-pressed={tucked} onClick={() => setTucked(v => !v)}>{tucked ? <Check size={15}/> : <ArrowRight size={15}/>} {say("Tuck it in", "دخّلي التوب")}</button></div>
        <p className={styles.previewNote}>{say("A styling preview, not a virtual fitting. Photos and garment shapes may vary.", "معاينة للتنسيق، مش قياس افتراضي. الصور وشكل القطع ممكن يختلفوا.")}</p>
      </div>
      <div className={styles.wardrobe}>
        <div className="flex items-center justify-between gap-3"><div className={styles.step}>{say("01 / BUILD YOUR LOOK", "01 / نسّقي اللوك")}</div><button type="button" className="mb-4 flex items-center gap-1 text-xs text-zinc-500" onClick={() => setAttempt(n => n + 1)}><RotateCcw size={12}/>{say("Refresh pieces", "تحديث القطع")}</button></div>
        <div className={styles.tabs} role="tablist" aria-label={say("Garment type", "نوع القطعة")}>{(["top", "bottom"] as Part[]).map(p => <button key={p} role="tab" id={`look-tab-${p}`} aria-selected={part === p} aria-controls="look-products" onClick={() => { setPart(p); setMessage(""); }} className={part === p ? styles.activeTab : ""}>{p === "top" ? say("Tops", "توبات") : say("Bottoms", "بناطيل وجيب")} <span>{catalog[p].length}</span></button>)}</div>
        <div id="look-products" role="tabpanel" aria-labelledby={`look-tab-${part}`}>
          <div className={styles.productRail}>{catalog[part].map(p => <button key={p.id} onClick={() => pick(p.id)} aria-label={p.title} aria-pressed={product?.id === p.id} className={`${styles.productThumb} ${product?.id === p.id ? styles.selectedThumb : ""}`}><img src={colorMockup(p, stylingColors(p)[0])} alt={p.title} loading="lazy"/>{product?.id === p.id && <span><Check size={12}/></span>}</button>)}</div>
          {!product ? <div className={styles.empty}>{say(`No ${part === "top" ? "tops" : "bottoms"} available just yet. Explore the collection while we restock.`, "مفيش قطع متاحة هنا دلوقتي. شوفي باقي الكوليكشن لحد ما تتوفر.")}<a href="/products">{say("Explore the collection", "شوفي الكوليكشن")} <ArrowRight size={14}/></a></div> : <>
            <div className={styles.productHeading}><div><h3>{product.title}</h3><p>EGP {product.price.toLocaleString()}</p></div><div className={styles.arrows}><button onClick={() => cycle(-1)} aria-label={say("Previous piece", "القطعة السابقة")}><ChevronLeft size={18}/></button><button onClick={() => cycle(1)} aria-label={say("Next piece", "القطعة التالية")}><ChevronRight size={18}/></button></div></div>
            <label className={styles.variantLabel} htmlFor="look-color">{say("Color", "اللون")}</label>
            <div className={styles.colorOptions}>{stylingColors(product).map(color => <button key={color} type="button" aria-pressed={selectedColor(part) === color} onClick={() => update({ color, variant: "" })}><img src={colorMockup(product, color)} alt=""/>{color}{selectedColor(part) === color && <Check size={13}/>}</button>)}</div>
            <label className={styles.variantLabel} htmlFor="look-color">{say("Selected color", "اللون المختار")}</label><select id="look-color" value={selectedColor(part)} onChange={e => update({ color: e.target.value, variant: "" })} className={styles.variantSelect}>{stylingColors(product).map(color => <option key={color} value={color}>{color}</option>)}</select>
            <label className={styles.variantLabel} htmlFor="look-variant">{say("Size", "المقاس")}</label><select id="look-variant" value={choice.variant} onChange={e => update({ variant: e.target.value })} className={styles.variantSelect}><option value="">{say("Choose your size", "اختاري مقاسك")}</option>{product.variants.filter(v => v.stock > 0 && v.color === selectedColor(part)).map(v => <option key={v.id} value={v.id}>{v.size}</option>)}</select>
            <button className={styles.adjustToggle} aria-expanded={adjust} onClick={() => setAdjust(v => !v)}><SlidersHorizontal size={14}/>{say("Adjust on mannequin", "ظبّطي القطعة على المانيكان")}<span>{adjust ? "−" : "+"}</span></button>
            {adjust && <div className={styles.adjustments}>{(["zoom", "x", "y"] as const).map(axis => <label key={axis}>{axis === "zoom" ? say("Scale", "الحجم") : axis === "x" ? say("Left / right", "يمين / شمال") : say("Up / down", "فوق / تحت")}<input type="range" min={axis === "zoom" ? .5 : -100} max={axis === "zoom" ? 2 : 100} step={axis === "zoom" ? .05 : 1} value={choice.placement[axis]} onChange={e => update({ placement: { ...choice.placement, [axis]: Number(e.target.value) } })}/></label>)}<button onClick={() => update({ placement: initial().placement })}><RotateCcw size={12}/>{say("Reset placement", "إعادة الضبط")}</button></div>}
          </>}
        </div>
        <div className={styles.bagSummary}><div className={styles.step}>{say("02 / MAKE IT YOURS", "02 / اللوك بقى ليكي")}</div>{(["top", "bottom"] as Part[]).map(p => <button className={styles.summaryRow} key={p} onClick={() => setPart(p)}><span className={choices[p].variant ? styles.done : styles.pending}>{choices[p].variant ? <Check size={12}/> : p === "top" ? "1" : "2"}</span><span>{selected[p]?.title ?? (p === "top" ? say("Choose a top", "اختاري توب") : say("Choose a bottom", "اختاري بنطلون أو جيبة"))}<small>{selected[p]?.variants.find(v => v.id === choices[p].variant) ? (() => { const v = selected[p]!.variants.find(v => v.id === choices[p].variant)!; return `${v.color} / ${v.size}`; })() : say("Choose color & size", "اختاري اللون والمقاس")}</small></span><span>{selected[p] ? `EGP ${selected[p]!.price.toLocaleString()}` : "—"}</span></button>)}<div className={styles.total}><span>{say("The whole look", "اللوك كله")}</span><strong>EGP {total.toLocaleString()}</strong></div><p className={styles.shipping}>{say("Two pieces. One outfit. Shipping calculated at checkout.", "قطعتين، لوك واحد. الشحن بيتحسب عند الدفع.")}</p><button className={styles.addButton} disabled={!complete} onClick={addLook}><ShoppingBag size={17}/>{say("Add the whole look", "ضيفي اللوك كله للشنطة")}<ArrowRight size={17}/></button><p aria-live="polite" className={styles.message}>{message || (!configured ? say("Pick a color & size for each piece to complete your look.", "اختاري اللون والمقاس لكل قطعة عشان تكمّلي اللوك.") : say("Looking good. Ready when you are.", "اللوك جاهز، مستنيكي."))}</p></div>
      </div>
    </div>}
  </section>;
}
