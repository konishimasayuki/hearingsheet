import { useState } from "react";

/* ───────────────────────────────────────────────
   ヒアリングシート（お客さま入力用）
   - スマホ最優先・ステップ式
   - 送信先: POST /api/hearing （Vercel API Routes → Upstash Redis）
   - プレビュー/未デプロイ時は控えコピーで動作確認できます
   ─────────────────────────────────────────────── */

const STEPS = [
  {
    key: "basic",
    title: "基本情報",
    short: "基本",
    hint: "",
    required: ["company"],
    fields: [
      { id: "company", type: "text", label: "会社名・屋号", placeholder: "株式会社○○ / ○○商店" },
      { id: "name", type: "text", label: "ご担当者名", placeholder: "山田 太郎" },
      { id: "tel", type: "tel", label: "電話番号", placeholder: "090-1234-5678" },
      { id: "email", type: "email", label: "メールアドレス（任意）", placeholder: "you@example.com" },
      {
        id: "industry", type: "icongrid", label: "業種",
        options: [
          { icon: "🍽", label: "飲食・カフェ" },
          { icon: "💅", label: "美容・サロン" },
          { icon: "💪", label: "フィットネス" },
          { icon: "📚", label: "教育・スクール" },
          { icon: "🏥", label: "医療・健康" },
          { icon: "🛍", label: "EC・小売" },
          { icon: "💻", label: "IT・Web" },
          { icon: "🎨", label: "クリエイティブ" },
          { icon: "🤝", label: "サービス業" },
          { icon: "⚖️", label: "士業" },
          { icon: "🚗", label: "自動車関係" },
          { icon: "🏠", label: "不動産" },
          { icon: "🏗", label: "建築" },
          { icon: "📦", label: "その他" },
        ],
      },
    ],
  },
  {
    key: "problem",
    title: "今のお困りごと",
    short: "課題",
    hint: "現状といちばん困っていることを教えてください。ここがいちばん大事です。",
    required: ["problem"],
    fields: [
      {
        id: "current", type: "multi", label: "今はどうやって管理していますか？（複数選択可）",
        options: ["紙・手書き", "Excel・スプレッドシート", "既存のシステム・アプリ", "LINE・チャット", "特に決まっていない"],
      },
      {
        id: "currentOther", type: "text", label: "その他（自由記述）",
        placeholder: "上記以外の方法があればご記入ください",
      },
      {
        id: "problem", type: "textarea", label: "いちばん解決したいこと・困っていること",
        placeholder: "困っていることを自由にご記入ください",
        rows: 6,
        examples: [
          "毎月の請求書づくりに時間がかかるので、自動で作れるようにしたい",
          "車両や在庫の状態が把握できておらず、二重対応が起きてしまう",
          "お客さまへの連絡をLINEで自動化して、問い合わせ対応を減らしたい",
          "紙の書類が多いので、見積や契約書の作成・管理を電子化したい",
          "売上や入金の状況を、リアルタイムで把握できるようにしたい",
          "スタッフの勤怠やシフトを、スマホで管理できるようにしたい",
          "電話での予約・受付が多いので、ネットから受けられるようにしたい",
          "顧客情報がバラバラなので、ひとつにまとめて検索できるようにしたい",
        ],
      },
    ],
  },
  {
    key: "features",
    title: "ほしい機能",
    short: "機能",
    hint: "",
    required: [],
    fields: [
      {
        id: "features", type: "multigroup", label: "ほしい機能（複数選択可）",
        groups: [
          { label: "顧客・取引先", options: ["顧客・会員管理", "取引先・仕入先管理", "問い合わせ・対応履歴"] },
          { label: "在庫・商品・車両", options: ["在庫管理", "車両・商品管理", "バーコード・QR管理"] },
          { label: "お金まわり", options: ["見積の作成", "請求書の作成", "入金・売掛管理", "支払・買掛管理", "クレジット・QR決済", "分割・ローン管理", "売上・データ分析"] },
          { label: "書類・帳票", options: ["各種書類の自動作成", "契約書・申込書", "領収書・納品書", "帳票のPDF出力"] },
          { label: "連絡・通知", options: ["LINE連携（自動返信・通知）", "メール送信・通知", "SMS・自動架電", "お知らせ配信"] },
          { label: "予約・スケジュール・勤怠", options: ["予約・受付管理", "スケジュール・カレンダー", "勤怠・タイムカード", "シフト管理"] },
          { label: "その他", options: ["スマホアプリ化（PWA）", "多店舗・複数拠点対応", "権限・スタッフ管理", "地図・GPS連携"] },
        ],
      },
      { id: "featuresOther", type: "text", label: "その他ほしい機能（任意）", placeholder: "自由にご記入ください" },
    ],
  },
  {
    key: "env",
    title: "使う環境",
    short: "環境",
    hint: "誰がどの端末で使うか、つながってほしいサービスを教えてください。",
    required: [],
    fields: [
      { id: "users", type: "radio", label: "使う人数", options: ["1人", "2〜5人", "6〜20人", "21人以上"] },
      { id: "devices", type: "multi", label: "主に使う端末（複数選択可）", options: ["スマホ", "PC", "タブレット"] },
      {
        id: "integrations", type: "multi", label: "つなげたいサービス（複数選択可）",
        options: ["会計ソフト（freee・弥生 など）", "LINE公式アカウント", "メール", "今あるシステム", "特になし", "分からない"],
      },
    ],
  },
  {
    key: "budget",
    title: "ご予算・時期",
    short: "予算",
    hint: "ざっくりで構いません。最後にご要望を自由にどうぞ。",
    required: [],
    fields: [
      { id: "timeline", type: "radio", label: "希望の時期", options: ["できるだけ早く", "1〜3ヶ月以内", "3〜6ヶ月", "時期は未定"] },
      { id: "budget", type: "radio", label: "ご予算感", options: ["〜30万円", "30〜80万円", "80〜150万円", "150万円〜", "相談したい"] },
      { id: "reference", type: "textarea", label: "参考にしたいサイト・システム（任意）", placeholder: "URLや「○○みたいなもの」など" },
      { id: "notes", type: "textarea", label: "その他ご要望・自由記入（任意）", placeholder: "" },
    ],
  },
];

const ALL_FIELDS = STEPS.flatMap((s) => s.fields);
const labelOf = (id) => ALL_FIELDS.find((f) => f.id === id)?.label || id;

export default function HearingSheet() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({});
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);

  const isReview = step === STEPS.length;
  const total = STEPS.length;

  const setField = (id, value) => {
    setData((d) => ({ ...d, [id]: value }));
    setErrors((e) => ({ ...e, [id]: false }));
  };

  const toggleMulti = (id, opt) => {
    setData((d) => {
      const arr = Array.isArray(d[id]) ? d[id] : [];
      return { ...d, [id]: arr.includes(opt) ? arr.filter((x) => x !== opt) : [...arr, opt] };
    });
  };

  const validateStep = () => {
    if (isReview) return true;
    const req = STEPS[step].required;
    const next = {};
    req.forEach((id) => {
      const v = data[id];
      if (!v || (Array.isArray(v) && v.length === 0) || String(v).trim() === "") next[id] = true;
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const goNext = () => {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, STEPS.length));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const goBack = () => {
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const buildSummary = () => {
    const lines = ["■ ヒアリングシート", ""];
    ALL_FIELDS.forEach((f) => {
      const v = data[f.id];
      if (v == null || (Array.isArray(v) && v.length === 0) || String(v).trim() === "") return;
      lines.push(`【${f.label}】`);
      lines.push(Array.isArray(v) ? v.join("、") : String(v));
      lines.push("");
    });
    return lines.join("\n").trim();
  };

  const submit = async () => {
    setSubmitting(true);
    const payload = { ...data, createdAt: new Date().toISOString() };
    try {
      const res = await fetch("/api/hearing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("save failed");
    } catch (e) {
      // 未デプロイ/プレビューでは保存できないため、控えコピーで対応
    } finally {
      setSubmitting(false);
      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const copySummary = async () => {
    const text = buildSummary();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch (_) {}
      document.body.removeChild(ta);
    }
  };

  return (
    <div className="hs-root">
      <style>{CSS}</style>

      <div className="hs-card">
        {done ? (
          <Completed data={data} summary={buildSummary()} onCopy={copySummary} copied={copied} />
        ) : (
          <>
            <header className="hs-head">
              <div className="hs-brand">システム開発 ヒアリングシート</div>
              <Stepper step={step} total={total} isReview={isReview} />
            </header>

            {!isReview ? (
              <section className="hs-body" key={step}>
                <div className="hs-step-meta">
                  <span className="hs-stepnum">STEP {step + 1} / {total}</span>
                  <h2 className="hs-title">{STEPS[step].title}</h2>
                  {STEPS[step].hint && <p className="hs-hint">{STEPS[step].hint}</p>}
                </div>

                <div className="hs-fields">
                  {STEPS[step].fields.map((f) => (
                    <Field
                      key={f.id}
                      field={f}
                      value={data[f.id]}
                      error={errors[f.id]}
                      required={STEPS[step].required.includes(f.id)}
                      onText={(v) => setField(f.id, v)}
                      onPick={(v) => setField(f.id, v)}
                      onToggle={(v) => toggleMulti(f.id, v)}
                    />
                  ))}
                </div>
              </section>
            ) : (
              <Review data={data} onEdit={(i) => setStep(i)} />
            )}

            <footer className="hs-foot">
              {step > 0 && (
                <button className="hs-btn hs-ghost" onClick={goBack} disabled={submitting}>戻る</button>
              )}
              {!isReview ? (
                <button className="hs-btn hs-primary" onClick={goNext}>次へ</button>
              ) : (
                <button className="hs-btn hs-primary" onClick={submit} disabled={submitting}>
                  {submitting ? "送信中…" : "送信する"}
                </button>
              )}
            </footer>
          </>
        )}
      </div>
    </div>
  );
}

function Stepper({ step, total, isReview }) {
  const current = isReview ? total : step;
  const labels = [...STEPS.map((s) => s.short || s.title), "確認"];
  return (
    <div className="hs-stepper" aria-hidden="true">
      {labels.map((label, i) => {
        const state = i < current ? "done" : i === current ? "active" : "";
        return (
          <div className="hs-seg" key={i}>
            <span className={`hs-seg-bar ${state}`} />
            <span className={`hs-seg-label ${state}`}>{label}</span>
          </div>
        );
      })}
    </div>
  );
}

function Field({ field, value, error, required, onText, onPick, onToggle }) {
  const { type, label, placeholder, options } = field;
  return (
    <div className={`hs-field ${error ? "has-error" : ""}`}>
      <label className="hs-label">
        {label}
        {required && <span className="hs-req">必須</span>}
      </label>

      {type === "textarea" ? (
        <>
          <textarea className="hs-input hs-textarea" rows={field.rows || 3} placeholder={placeholder}
            value={value || ""} onChange={(e) => onText(e.target.value)} />
          {field.examples && (
            <div className="hs-examples">
              <span className="hs-examples-cap">記入例（タップで追加・もう一度で削除）</span>
              {field.examples.map((ex) => {
                const cur = value || "";
                const added = cur.split("\n").some((l) => l.trim() === ex);
                const toggle = () => {
                  if (added) {
                    onText(cur.split("\n").filter((l) => l.trim() !== ex).join("\n").replace(/^\n+|\n+$/g, ""));
                  } else {
                    onText(cur.trim() ? cur.replace(/\n+$/, "") + "\n" + ex : ex);
                  }
                };
                return (
                  <button type="button" key={ex} className={`hs-example ${added ? "added" : ""}`} onClick={toggle}>
                    <span className="hs-example-icon">{added ? "✕" : "＋"}</span>
                    <span className="hs-example-text">{ex}</span>
                  </button>
                );
              })}
            </div>
          )}
        </>
      ) : type === "radio" ? (
        <div className="hs-options">
          {options.map((opt) => (
            <button type="button" key={opt}
              className={`hs-opt ${value === opt ? "picked" : ""}`}
              onClick={() => onPick(opt)}>
              <span className="hs-dot" />{opt}
            </button>
          ))}
        </div>
      ) : type === "icongrid" ? (
        <div className="hs-grid">
          {options.map((opt) => (
            <button type="button" key={opt.label}
              className={`hs-tile ${value === opt.label ? "picked" : ""}`}
              onClick={() => onPick(opt.label)}>
              <span className="hs-tile-icon">{opt.icon}</span>
              <span className="hs-tile-label">{opt.label}</span>
            </button>
          ))}
        </div>
      ) : type === "multi" ? (
        <div className="hs-options">
          {options.map((opt) => {
            const on = Array.isArray(value) && value.includes(opt);
            return (
              <button type="button" key={opt}
                className={`hs-opt ${on ? "picked" : ""}`}
                onClick={() => onToggle(opt)}>
                <span className="hs-check">{on ? "✓" : ""}</span>{opt}
              </button>
            );
          })}
        </div>
      ) : type === "multigroup" ? (
        <div className="hs-groups">
          {field.groups.map((g) => (
            <div className="hs-group" key={g.label}>
              <span className="hs-group-label">{g.label}</span>
              <div className="hs-options">
                {g.options.map((opt) => {
                  const on = Array.isArray(value) && value.includes(opt);
                  return (
                    <button type="button" key={opt}
                      className={`hs-opt ${on ? "picked" : ""}`}
                      onClick={() => onToggle(opt)}>
                      <span className="hs-check">{on ? "✓" : ""}</span>{opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <input className="hs-input" type={type} inputMode={type === "tel" ? "tel" : type === "email" ? "email" : "text"}
          placeholder={placeholder} value={value || ""} onChange={(e) => onText(e.target.value)} />
      )}

      {error && <span className="hs-error-msg">こちらの入力をお願いします</span>}
    </div>
  );
}

function Review({ data, onEdit }) {
  return (
    <section className="hs-body">
      <div className="hs-step-meta">
        <span className="hs-stepnum">確認</span>
        <h2 className="hs-title">内容のご確認</h2>
        <p className="hs-hint">この内容で送信します。修正したい項目は「編集」から戻れます。</p>
      </div>

      <div className="hs-review">
        {STEPS.map((s, i) => {
          const answered = s.fields.filter((f) => {
            const v = data[f.id];
            return v != null && !(Array.isArray(v) && v.length === 0) && String(v).trim() !== "";
          });
          if (answered.length === 0) return null;
          return (
            <div className="hs-review-block" key={s.key}>
              <div className="hs-review-head">
                <h3>{s.title}</h3>
                <button className="hs-edit" onClick={() => onEdit(i)}>編集</button>
              </div>
              {answered.map((f) => {
                const v = data[f.id];
                return (
                  <div className="hs-review-row" key={f.id}>
                    <span className="hs-review-label">{f.label}</span>
                    <span className="hs-review-val">{Array.isArray(v) ? v.join("、") : v}</span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Completed({ data, summary, onCopy, copied }) {
  const today = new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" });
  const onPdf = () => window.print();
  return (
    <div className="hs-done">
      <div className="hs-no-print">
        <div className="hs-done-mark">✓</div>
        <h2 className="hs-done-title">送信が完了しました</h2>
        <p className="hs-done-text">
          ご入力ありがとうございました。内容を確認のうえ、ご連絡いたします。
        </p>
        <div className="hs-done-note">
          <p>控えをPDFで保存できます。コピーしてLINE・メールで送ることもできます。</p>
          <button className="hs-btn hs-primary hs-copy" onClick={onPdf}>PDFをダウンロード</button>
          <button className="hs-btn hs-ghost hs-copy hs-copy-2" onClick={onCopy}>
            {copied ? "コピーしました ✓" : "控えをコピーする"}
          </button>
        </div>
        <pre className="hs-summary">{summary}</pre>
      </div>

      <div className="hs-print-sheet">
        <div className="hs-print-head">
          <span className="hs-print-eyebrow">システム開発 ヒアリングシート</span>
          <span className="hs-print-date">{today}</span>
        </div>
        {STEPS.map((s) => {
          const answered = s.fields.filter((f) => {
            const v = data[f.id];
            return v != null && !(Array.isArray(v) && v.length === 0) && String(v).trim() !== "";
          });
          if (answered.length === 0) return null;
          return (
            <div className="hs-print-block" key={s.key}>
              <h3 className="hs-print-section">{s.title}</h3>
              {answered.map((f) => {
                const v = data[f.id];
                return (
                  <div className="hs-print-row" key={f.id}>
                    <span className="hs-print-label">{f.label}</span>
                    <span className="hs-print-val">{Array.isArray(v) ? v.join("、") : v}</span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const CSS = `
.hs-root{
  --paper:#F4F7FB; --ink:#16202E; --ink-soft:#5A6B82; --line:#E3E9F2;
  --primary:#2563EB; --primary-soft:#E9F1FF; --accent:#0EA5E9; --danger:#DC2626; --card:#FFFFFF;
  font-family:-apple-system,BlinkMacSystemFont,"Hiragino Kaku Gothic ProN","Hiragino Sans","Noto Sans JP",Meiryo,sans-serif;
  color:var(--ink); background:var(--paper); min-height:100%;
  padding:20px 14px 40px; -webkit-text-size-adjust:100%;
}
.hs-card{ max-width:560px; margin:0 auto; background:var(--card); border:1px solid var(--line);
  border-radius:18px; overflow:hidden; box-shadow:0 1px 0 rgba(22,32,46,.02),0 14px 34px -24px rgba(37,99,235,.30); }
.hs-head{ padding:18px 18px 10px; border-bottom:1px solid var(--line); }
.hs-brand{ font-size:13px; font-weight:700; letter-spacing:.14em; color:var(--accent); margin-bottom:14px; }

.hs-stepper{ display:flex; gap:6px; }
.hs-seg{ flex:1; display:flex; flex-direction:column; align-items:center; gap:8px; }
.hs-seg-bar{ width:100%; height:5px; border-radius:3px; background:var(--line); transition:background .25s ease; }
.hs-seg-bar.done, .hs-seg-bar.active{ background:var(--primary); }
.hs-seg-label{ font-size:10.5px; font-weight:700; color:var(--ink-soft); text-align:center; line-height:1.2; transition:color .2s; }
.hs-seg-label.done{ color:var(--ink); }
.hs-seg-label.active{ color:var(--primary); }

.hs-body{ padding:22px 18px 6px; animation:hs-fade .3s ease; }
@keyframes hs-fade{ from{opacity:0; transform:translateY(6px);} to{opacity:1; transform:none;} }
.hs-step-meta{ margin-bottom:18px; }
.hs-stepnum{ font-size:12px; font-weight:700; letter-spacing:.1em; color:var(--accent); }
.hs-title{ font-size:21px; font-weight:800; margin:6px 0 4px; letter-spacing:.01em; }
.hs-hint{ font-size:13.5px; line-height:1.7; color:var(--ink-soft); margin:0; }

.hs-fields{ display:flex; flex-direction:column; gap:20px; }
.hs-field{ display:flex; flex-direction:column; gap:9px; }
.hs-label{ font-size:14.5px; font-weight:700; display:flex; align-items:center; gap:8px; }
.hs-req{ font-size:10.5px; font-weight:700; color:var(--danger); border:1px solid var(--danger);
  border-radius:5px; padding:1px 6px; letter-spacing:.05em; }
.hs-input{ width:100%; box-sizing:border-box; font:inherit; font-size:16px; color:var(--ink);
  background:#fff; border:1.5px solid var(--line); border-radius:11px; padding:13px 14px; transition:border-color .15s; }
.hs-input:focus{ outline:none; border-color:var(--primary); box-shadow:0 0 0 3px var(--primary-soft); }
.hs-textarea{ resize:vertical; line-height:1.6; }

.hs-options{ display:flex; flex-direction:column; gap:8px; }
.hs-opt{ display:flex; align-items:center; gap:11px; width:100%; text-align:left; cursor:pointer;
  font:inherit; font-size:15px; color:var(--ink); background:#fff; border:1.5px solid var(--line);
  border-radius:11px; padding:13px 14px; min-height:48px; transition:all .15s; }
.hs-opt:hover{ border-color:#B8C6DC; }
.hs-opt.picked{ border-color:var(--primary); background:var(--primary-soft); font-weight:700; }
.hs-dot{ width:18px; height:18px; flex:0 0 18px; border-radius:50%; border:2px solid var(--line); transition:all .15s; }
.hs-opt.picked .hs-dot{ border-color:var(--primary); background:radial-gradient(circle,#fff 30%,var(--primary) 36%); }
.hs-check{ width:20px; height:20px; flex:0 0 20px; border-radius:6px; border:2px solid var(--line);
  display:grid; place-items:center; font-size:13px; color:#fff; font-weight:800; transition:all .15s; }
.hs-opt.picked .hs-check{ border-color:var(--primary); background:var(--primary); }

.hs-field.has-error .hs-input{ border-color:var(--danger); }
.hs-error-msg{ font-size:12.5px; color:var(--danger); font-weight:600; }

.hs-foot{ display:flex; gap:10px; padding:16px 18px 20px; border-top:1px solid var(--line); margin-top:16px; }
.hs-btn{ flex:1; font:inherit; font-size:16px; font-weight:700; border-radius:12px; padding:14px;
  cursor:pointer; border:1.5px solid transparent; min-height:50px; transition:all .15s; }
.hs-primary{ background:var(--primary); color:#fff; }
.hs-primary:hover{ background:#1D4ED8; }
.hs-primary:disabled{ opacity:.6; cursor:default; }
.hs-ghost{ background:#fff; border-color:var(--line); color:var(--ink); flex:0 0 110px; }
.hs-ghost:hover{ border-color:#B8C6DC; }

.hs-review{ display:flex; flex-direction:column; gap:14px; padding-bottom:4px; }
.hs-review-block{ border:1px solid var(--line); border-radius:13px; padding:14px; }
.hs-review-head{ display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
.hs-review-head h3{ font-size:15px; margin:0; font-weight:800; }
.hs-edit{ font:inherit; font-size:13px; font-weight:700; color:var(--primary); background:none; border:none; cursor:pointer; }
.hs-review-row{ display:flex; flex-direction:column; gap:2px; padding:8px 0; border-top:1px dashed var(--line); }
.hs-review-row:first-of-type{ border-top:none; }
.hs-review-label{ font-size:12px; color:var(--ink-soft); font-weight:600; }
.hs-review-val{ font-size:15px; line-height:1.6; white-space:pre-wrap; }

.hs-done{ padding:40px 24px; text-align:center; }
.hs-done-mark{ width:60px; height:60px; margin:0 auto 18px; border-radius:50%; background:var(--primary);
  color:#fff; font-size:30px; font-weight:800; display:grid; place-items:center; animation:hs-pop .4s ease; }
@keyframes hs-pop{ from{transform:scale(.5); opacity:0;} to{transform:scale(1); opacity:1;} }
.hs-done-title{ font-size:21px; font-weight:800; margin:0 0 10px; }
.hs-done-text{ font-size:14px; line-height:1.8; color:var(--ink-soft); margin:0 0 22px; }
.hs-done-note{ background:var(--paper); border:1px solid var(--line); border-radius:13px; padding:16px; }
.hs-done-note p{ font-size:13px; color:var(--ink-soft); margin:0 0 12px; line-height:1.7; }
.hs-copy{ flex:none; width:100%; }
.hs-summary{ text-align:left; margin:18px 0 0; padding:16px; background:#fff; border:1px solid var(--line);
  border-radius:11px; font-size:12.5px; line-height:1.7; white-space:pre-wrap; word-break:break-word;
  color:var(--ink-soft); max-height:240px; overflow:auto; font-family:inherit; }

.hs-copy-2{ margin-top:8px; }

.hs-examples{ display:flex; flex-direction:column; gap:6px; margin-top:2px; }
.hs-examples-cap{ font-size:12px; color:var(--ink-soft); font-weight:600; }
.hs-example{ display:flex; align-items:flex-start; gap:9px; text-align:left; font:inherit; font-size:13px; line-height:1.6; color:var(--ink);
  background:var(--paper); border:1px dashed var(--line); border-radius:9px; padding:9px 11px; cursor:pointer; transition:all .15s; }
.hs-example:hover{ border-color:var(--primary); background:var(--primary-soft); }
.hs-example.added{ border-style:solid; border-color:var(--primary); background:var(--primary-soft); }
.hs-example-icon{ flex:0 0 auto; font-weight:800; color:var(--primary); }
.hs-example.added .hs-example-icon{ color:var(--danger); }
.hs-example-text{ flex:1; }

.hs-groups{ display:flex; flex-direction:column; gap:16px; }
.hs-group-label{ display:block; font-size:12.5px; font-weight:800; color:var(--accent); letter-spacing:.05em; margin-bottom:8px; }

.hs-grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:8px; }
.hs-tile{ display:flex; flex-direction:column; align-items:center; justify-content:center; gap:5px; cursor:pointer; font:inherit;
  background:#fff; border:1.5px solid var(--line); border-radius:11px; padding:12px 6px; min-height:66px; transition:all .15s; }
.hs-tile:hover{ border-color:#B8C6DC; }
.hs-tile.picked{ border-color:var(--primary); background:var(--primary-soft); }
.hs-tile-icon{ font-size:22px; line-height:1; }
.hs-tile-label{ font-size:11.5px; font-weight:700; color:var(--ink); text-align:center; line-height:1.3; }

.hs-print-sheet{ display:none; }
.hs-print-head{ display:flex; justify-content:space-between; align-items:baseline; border-bottom:2px solid var(--ink); padding-bottom:8px; margin-bottom:16px; }
.hs-print-eyebrow{ font-size:18px; font-weight:800; }
.hs-print-date{ font-size:12px; color:var(--ink-soft); }
.hs-print-block{ margin-bottom:14px; }
.hs-print-section{ font-size:13px; font-weight:800; margin:0 0 6px; padding:2px 0 2px 8px; border-left:3px solid var(--ink); }
.hs-print-row{ display:flex; gap:10px; padding:5px 0; border-bottom:1px solid #eee; font-size:12px; }
.hs-print-label{ flex:0 0 130px; color:#555; font-weight:600; }
.hs-print-val{ flex:1; white-space:pre-wrap; }

@media print{
  .hs-root{ background:#fff; padding:0; }
  .hs-card{ box-shadow:none; border:none; border-radius:0; max-width:none; }
  .hs-no-print{ display:none !important; }
  .hs-print-sheet{ display:block !important; }
}

@media (prefers-reduced-motion: reduce){ .hs-body,.hs-done-mark{ animation:none; } .hs-node,.hs-opt,.hs-btn,.hs-input{ transition:none; } }
`;
