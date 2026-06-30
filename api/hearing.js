// 送信内容を ninjin.konishi@gmail.com にメール通知するだけのシンプル版。
// データ保存はしません。環境変数 RESEND_API_KEY が必要です。

// 通知メールの見出し用ラベル
const LABELS = {
  company: "会社名・屋号", name: "ご担当者名", tel: "電話番号", email: "メールアドレス",
  industry: "業種", current: "現在の管理方法", currentOther: "現在の管理方法（その他）",
  problem: "解決したいこと", features: "ほしい機能", featuresOther: "ほしい機能（その他）",
  users: "使う人数", devices: "使う端末", integrations: "つなげたいサービス",
  timeline: "希望時期", budget: "ご予算感", reference: "参考サイト", notes: "その他ご要望",
  createdAt: "送信日時",
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const body = req.body || {};
    if (!body.company) {
      return res.status(400).json({ error: "会社名・屋号は必須です" });
    }

    const record = { ...body, createdAt: body.createdAt || new Date().toISOString() };
    await notifyEmail(record);

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: "送信に失敗しました" });
  }
}

// Resend でメール通知（環境変数 RESEND_API_KEY が必要）
// 未設定なら何もせず正常終了します
async function notifyEmail(record) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;

  // 完了画面の「控えコピー」と同じ見やすい形式に揃える
  const lines = ["■ システム開発 ヒアリングシート", ""];
  for (const k of Object.keys(LABELS)) {
    const v = record[k];
    if (v == null || (Array.isArray(v) && v.length === 0) || String(v).trim() === "") continue;
    lines.push(`【${LABELS[k]}】`);
    lines.push(Array.isArray(v) ? v.join("、") : String(v));
    lines.push("");
  }
  const text = lines.join("\n").trim();

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      // 本番は独自ドメインの送信元に。検証用は onboarding@resend.dev が使えます
      from: "ヒアリングシート <onboarding@resend.dev>",
      to: ["ninjin.konishi@gmail.com"],
      subject: `【ヒアリング】${record.company || "新規"} 様より`,
      text,
    }),
  });
}
