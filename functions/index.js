"use strict";

const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { requestLineCrm } = require("./line-crm");

initializeApp();
const lineCrmApiKey = defineSecret("LINE_CRM_API_KEY");

function allowCors(req, res) {
  const origin = req.get("origin");
  if (origin) res.set("Access-Control-Allow-Origin", origin);
  res.set("Vary", "Origin");
  res.set("Access-Control-Allow-Headers", "Authorization, Content-Type");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
}

exports.lineLinkQr = onRequest({ region: "asia-northeast1", secrets: [lineCrmApiKey] }, async (req, res) => {
  allowCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).send("");
  try {
    const match = /^Bearer (.+)$/.exec(req.get("authorization") || "");
    if (!match) return res.status(401).json({ detail: "staff login required" });
    const user = await getAuth().verifyIdToken(match[1]);
    if (!user.email) return res.status(403).json({ detail: "staff email required" });

    let crmRequest;
    if (req.method === "POST" && req.path === "/") {
      const externalSystemId = String(req.body?.externalSystemId || "").trim();
      if (!externalSystemId) return res.status(400).json({ detail: "案件IDが設定されていません" });
      crmRequest = {
        path: "/api/inbound/link-qr",
        method: "POST",
        apiKey: lineCrmApiKey.value(),
        body: { externalSystemId, createdBy: user.email }
      };
    } else if (req.method === "GET") {
      const token = req.path.replace(/^\//, "");
      if (!/^[A-Za-z0-9_-]+$/.test(token)) return res.status(400).json({ detail: "invalid token" });
      crmRequest = { path: `/api/inbound/link-qr/${token}`, apiKey: lineCrmApiKey.value() };
    } else {
      return res.status(405).json({ detail: "method not allowed" });
    }

    const result = await requestLineCrm(crmRequest);
    return res.status(result.status).json(result.payload);
  } catch (error) {
    console.error("LINE CRM proxy failed", error);
    return res.status(500).json({ detail: "LINE連携でエラーが発生しました" });
  }
});
