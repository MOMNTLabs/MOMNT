import assert from "node:assert/strict";
import { File as NodeFile } from "node:buffer";
import { readFile } from "node:fs/promises";

globalThis.File ??= NodeFile;

const { default: worker } = await import("../src/worker.js");

class MemoryR2 {
  objects = new Map();

  async get(key) {
    const object = this.objects.get(key);
    if (!object) return null;

    return {
      body: object.body,
      httpEtag: '"test-etag"',
    };
  }

  async put(key, body, options = {}) {
    let bytes;
    if (typeof body === "string") {
      bytes = new TextEncoder().encode(body);
    } else if (body instanceof ReadableStream) {
      bytes = new Uint8Array(await new Response(body).arrayBuffer());
    } else {
      bytes = new Uint8Array(await new Response(body).arrayBuffer());
    }

    this.objects.set(key, { body: bytes, options });
  }
}

const bucket = new MemoryR2();
const env = {
  PRODUCT_MEDIA: bucket,
  ADMIN_ACCESS_CODE: "test-admin-code",
  R2_PUBLIC_BASE_URL: "https://media.momnt.com.br",
  ASSETS: {
    fetch: async () => new Response("static asset"),
  },
};

const call = (path, init) =>
  worker.fetch(new Request(`https://momnt.test${path}`, init), env);

let response = await call("/api/health");
assert.equal(response.status, 200);
assert.equal((await response.json()).catalog, "r2");

response = await worker.fetch(
  new Request("https://momnt.test/api/admin/verify", { method: "POST" }),
  { ...env, ADMIN_ACCESS_CODE: "" },
);
assert.equal(response.status, 503);

response = await call("/api/admin/verify", {
  method: "POST",
  headers: { "x-admin-code": "wrong" },
});
assert.equal(response.status, 401);

response = await call("/api/admin/verify", {
  method: "POST",
  headers: { "x-admin-code": "test-admin-code" },
});
assert.equal(response.status, 200);

response = await call("/api/catalog");
assert.equal(response.status, 204);

const catalog = {
  products: [],
  categoryMeta: { all: { label: "Todos" } },
  siteContent: {},
};

response = await call("/api/catalog", {
  method: "PUT",
  headers: {
    "content-type": "application/json",
    "x-admin-code": "wrong",
  },
  body: JSON.stringify(catalog),
});
assert.equal(response.status, 401);

response = await call("/api/catalog", {
  method: "PUT",
  headers: {
    "content-type": "application/json",
    "x-admin-code": "test-admin-code",
  },
  body: JSON.stringify(catalog),
});
assert.equal(response.status, 200);

response = await call("/api/catalog");
assert.equal(response.status, 200);
assert.deepEqual(await response.json(), catalog);

const formData = new FormData();
formData.set("target", "Óculos Modernos");
formData.set(
  "image",
  new NodeFile([new Uint8Array([1, 2, 3])], "produto.png", {
    type: "image/png",
  }),
);

response = await call("/api/uploads/image", {
  method: "POST",
  headers: { "x-admin-code": "test-admin-code" },
  body: formData,
});
assert.equal(response.status, 200);
const upload = await response.json();
assert.match(upload.url, /^https:\/\/media\.momnt\.com\.br\/oculos-modernos\//);

response = await call("/");
assert.equal(response.status, 200);
assert.equal(await response.text(), "static asset");

const adminScript = await readFile(
  new URL("../assets/js/admin.js", import.meta.url),
  "utf8",
);
assert.doesNotMatch(adminScript, /const ACCESS_CODE\s*=/);
assert.doesNotMatch(adminScript, /momnt-admin["']/);
assert.match(adminScript, /const restoreSession = async \(\) =>/);
assert.match(adminScript, /await apiRequest\([\s\S]*?\/api\/admin\/verify/);

console.log("Worker smoke tests passed.");
