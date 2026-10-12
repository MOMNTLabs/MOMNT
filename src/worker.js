const CATALOG_KEY = "catalog/catalog.json";
const MAX_IMAGE_SIZE = 8 * 1024 * 1024;

const json = (value, init = {}) => {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json; charset=utf-8");

  return new Response(JSON.stringify(value), { ...init, headers });
};

const error = (message, status = 400) => json({ error: message }, { status });

const getAdminCode = (request) => {
  const headerCode = request.headers.get("x-admin-code") || "";
  const authorization = request.headers.get("authorization") || "";
  const bearerCode = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : "";

  return String(headerCode || bearerCode).trim();
};

const requireAdmin = (request, env) => {
  const configuredCode = String(env.ADMIN_ACCESS_CODE || "").trim();

  if (!configuredCode) {
    return error("ADMIN_ACCESS_CODE não configurado.", 503);
  }

  if (getAdminCode(request) !== configuredCode) {
    return error("Código de admin inválido.", 401);
  }

  return null;
};

const isPlainObject = (value) =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const validateCatalog = (catalog) => {
  if (!isPlainObject(catalog)) return "Catálogo inválido.";
  if (!Array.isArray(catalog.products)) {
    return "A lista de produtos é inválida.";
  }
  if (!isPlainObject(catalog.categoryMeta) || !catalog.categoryMeta.all) {
    return "As categorias do catálogo são inválidas.";
  }
  if (!isPlainObject(catalog.siteContent)) {
    return "O conteúdo do site é inválido.";
  }

  return null;
};

const extensionByMimeType = (mimeType) => {
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  if (mimeType === "image/gif") return "gif";
  if (mimeType === "image/svg+xml") return "svg";
  if (mimeType === "image/avif") return "avif";
  return "jpg";
};

const sanitizeTarget = (value) =>
  String(value || "products")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "products";

const handleCatalogRead = async (env) => {
  const object = await env.PRODUCT_MEDIA.get(CATALOG_KEY);

  if (!object) {
    // O navegador já contém o catálogo padrão do repositório. O 204 faz com
    // que ele mantenha esses dados até o primeiro salvamento no painel.
    return new Response(null, {
      status: 204,
      headers: { "cache-control": "no-store" },
    });
  }

  return new Response(object.body, {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      etag: object.httpEtag,
    },
  });
};

const handleCatalogWrite = async (request, env) => {
  const unauthorized = requireAdmin(request, env);
  if (unauthorized) return unauthorized;

  let catalog;
  try {
    catalog = await request.json();
  } catch {
    return error("Não foi possível ler o catálogo enviado.");
  }

  const validationError = validateCatalog(catalog);
  if (validationError) return error(validationError);

  const body = JSON.stringify(catalog);
  if (new TextEncoder().encode(body).byteLength > 2 * 1024 * 1024) {
    return error("O catálogo ultrapassa o limite de 2 MB.", 413);
  }

  await env.PRODUCT_MEDIA.put(CATALOG_KEY, body, {
    httpMetadata: {
      contentType: "application/json; charset=utf-8",
      cacheControl: "no-store",
    },
  });

  return json(catalog, {
    headers: { "cache-control": "no-store" },
  });
};

const handleImageUpload = async (request, env) => {
  const unauthorized = requireAdmin(request, env);
  if (unauthorized) return unauthorized;

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return error("Não foi possível ler o arquivo enviado.");
  }

  const image = formData.get("image");
  if (!(image instanceof File) || !image.type.startsWith("image/")) {
    return error("Envie um arquivo de imagem.");
  }

  if (image.size > MAX_IMAGE_SIZE) {
    return error("A imagem deve ter no máximo 8 MB.", 413);
  }

  const target = sanitizeTarget(formData.get("target"));
  const now = new Date();
  const extension = extensionByMimeType(image.type);
  const key = [
    target,
    String(now.getUTCFullYear()),
    String(now.getUTCMonth() + 1).padStart(2, "0"),
    `${crypto.randomUUID()}.${extension}`,
  ].join("/");

  await env.PRODUCT_MEDIA.put(key, image.stream(), {
    httpMetadata: {
      contentType: image.type,
      cacheControl: "public, max-age=31536000, immutable",
    },
    customMetadata: {
      originalName: image.name.slice(0, 256),
    },
  });

  const publicBaseUrl = String(env.R2_PUBLIC_BASE_URL || "").replace(/\/+$/, "");
  if (!publicBaseUrl) {
    return error("R2_PUBLIC_BASE_URL não configurada.", 503);
  }

  return json({
    url: `${publicBaseUrl}/${key}`,
    key,
  });
};

const handleApi = async (request, env) => {
  const url = new URL(request.url);

  if (url.pathname === "/api/health" && request.method === "GET") {
    return json({ ok: true, catalog: "r2", uploads: Boolean(env.PRODUCT_MEDIA) });
  }

  if (url.pathname === "/api/admin/verify" && request.method === "POST") {
    return requireAdmin(request, env) || json({ ok: true });
  }

  if (url.pathname === "/api/catalog" && request.method === "GET") {
    return handleCatalogRead(env);
  }

  if (url.pathname === "/api/catalog" && request.method === "PUT") {
    return handleCatalogWrite(request, env);
  }

  if (url.pathname === "/api/uploads/image" && request.method === "POST") {
    return handleImageUpload(request, env);
  }

  return error("Rota não encontrada.", 404);
};

export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      if (url.pathname.startsWith("/api/")) {
        return await handleApi(request, env);
      }

      return env.ASSETS.fetch(request);
    } catch (caughtError) {
      console.error(caughtError);
      return error("Erro interno do servidor.", 500);
    }
  },
};
