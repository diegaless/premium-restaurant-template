import { appendFile, mkdir, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

export function createNewsletterHandler({
  siteSlug,
  file = process.env.NEWSLETTER_DATA_FILE ||
    resolve(".data", `${siteSlug}-subscribers.jsonl`),
}) {
  const attempts = new Map();
  let queue = Promise.resolve();
  const reply = (res, status, body) => {
    res.writeHead(status, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    });
    res.end(JSON.stringify(body));
  };
  return async function newsletter(req, res) {
    if (req.method !== "POST")
      return reply(res, 405, { error: "method_not_allowed" });
    if (!/^application\/json(?:;|$)/i.test(req.headers["content-type"] || ""))
      return reply(res, 415, { error: "json_required" });
    if (req.headers.origin) {
      try {
        if (new URL(req.headers.origin).host !== req.headers.host)
          return reply(res, 403, { error: "origin_not_allowed" });
      } catch {
        return reply(res, 403, { error: "origin_not_allowed" });
      }
    }
    const key = req.socket.remoteAddress || "unknown",
      now = Date.now();
    for (const [address, entry] of attempts)
      if (now - entry.since > 60000) attempts.delete(address);
    const entry = attempts.get(key) || { since: now, count: 0 };
    entry.count++;
    attempts.set(key, entry);
    if (entry.count > 20)
      return reply(res, 429, { error: "too_many_requests" });
    try {
      const chunks = [];
      let bytes = 0;
      for await (const chunk of req) {
        bytes += chunk.length;
        if (bytes > 4096) {
          reply(res, 413, { error: "payload_too_large" });
          return;
        }
        chunks.push(chunk);
      }
      let data;
      try {
        data = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      } catch {
        return reply(res, 400, { error: "invalid_json" });
      }
      if (!data || typeof data !== "object")
        return reply(res, 400, { error: "invalid_input" });
      if (data.website) return reply(res, 202, { ok: true });
      const email =
        typeof data.email === "string" ? data.email.trim().toLowerCase() : "";
      if (
        email.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        data.consent !== true ||
        data.site !== siteSlug
      )
        return reply(res, 400, { error: "invalid_input" });
      // Serialize reads and appends so concurrent identical submissions are stored once.
      const save = queue.then(async () => {
        let existing = "";
        try {
          existing = await readFile(file, "utf8");
        } catch (error) {
          if (error.code !== "ENOENT") throw error;
        }
        const duplicate = existing
          .split("\n")
          .filter(Boolean)
          .some((line) => {
            const record = JSON.parse(line);
            return record.email === email && record.site === siteSlug;
          });
        if (!duplicate) {
          await mkdir(dirname(file), { recursive: true, mode: 0o700 });
          await appendFile(
            file,
            JSON.stringify({
              email,
              site: siteSlug,
              consent: true,
              consentVersion: 1,
              subscribedAt: new Date().toISOString(),
            }) + "\n",
            { mode: 0o600 },
          );
        }
      });
      queue = save.catch(() => {});
      await save;
      reply(res, 201, { ok: true });
    } catch (error) {
      console.error(
        `Newsletter storage failed: ${error.code || "storage_error"}`,
      );
      if (!res.headersSent) reply(res, 503, { error: "storage_unavailable" });
    }
  };
}
