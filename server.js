import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import express from "express";
import multer from "multer";
import pg from "pg";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
});

const port = Number(process.env.PORT || 3000);
const adminAccessCode = process.env.ADMIN_ACCESS_CODE || "momnt-admin";
const databaseUrl = process.env.DATABASE_URL || "";
const pool = databaseUrl
  ? new pg.Pool({
      connectionString: databaseUrl,
      ssl: databaseUrl.includes("localhost")
        ? false
        : { rejectUnauthorized: false },
    })
  : null;

const r2Config = {
  accountId: process.env.R2_ACCOUNT_ID || "",
  accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  bucket: process.env.R2_BUCKET || "",
  publicBaseUrl: (process.env.R2_PUBLIC_BASE_URL || "").replace(/\/+$/, ""),
};

const s3 =
  r2Config.accountId && r2Config.accessKeyId && r2Config.secretAccessKey
    ? new S3Client({
        region: "auto",
        endpoint: `https://${r2Config.accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: r2Config.accessKeyId,
          secretAccessKey: r2Config.secretAccessKey,
        },
      })
    : null;

app.disable("x-powered-by");
app.use(express.json({ limit: "2mb" }));

const clone = (value) => JSON.parse(JSON.stringify(value));

const loadDefaultCatalog = async () => {
  const source = await fs.readFile(
    path.join(__dirname, "assets", "js", "catalog-data.js"),
    "utf8",
  );
  const staticAssignments = source.split("(function ()")[0];
  const sandbox = { window: {} };

  vm.createContext(sandbox);
  vm.runInContext(staticAssignments, sandbox);

  return {
    products: clone(sandbox.window.MOMNT_PRODUCTS || []),
    categoryMeta: clone(sandbox.window.MOMNT_CATEGORY_META || {}),
    siteContent: clone(sandbox.window.MOMNT_SITE_CONTENT || {}),
  };
};

let defaultCatalogPromise = null;
const getDefaultCatalog = () => {
  defaultCatalogPromise ??= loadDefaultCatalog();
  return defaultCatalogPromise;
};

const defaultTheme = {
  background: "#ffffff",
  surface: "#ffffff",
  surfaceSoft: "#f5efe7",
  ink: "#121212",
  textLight: "#f7f2eb",
  muted: "#5f564f",
  line: "#ece6dd",
  accent: "#d2ad7b",
  success: "#10b86b",
  danger: "#d72b38",
  dark: "#080808",
};

const cssVariableMap = {
  "--black": "dark",
  "--ink": "ink",
  "--text": "textLight",
  "--muted": "muted",
  "--line": "line",
  "--surface": "surface",
  "--surface-soft": "surfaceSoft",
  "--gold": "accent",
  "--green": "success",
  "--red": "danger",
  "--shop-bg": "background",
  "--shop-surface": "surface",
  "--shop-surface-soft": "surfaceSoft",
  "--shop-line": "line",
  "--shop-muted": "muted",
  "--shop-dark": "dark",
  "--shop-accent": "accent",
  "--shop-green": "success",
  "--shop-red": "danger",
};

const normalizeTheme = (theme = {}) =>
  Object.fromEntries(
    Object.entries(defaultTheme).map(([key, fallback]) => {
      const value = String(theme?.[key] ?? "").trim();
      return [key, value || fallback];
    }),
  );

const escapeCssValue = (value) =>
  String(value)
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "")
    .replace(/[{}]/g, "");

const escapeHtmlAttribute = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const buildThemeStyle = (theme = {}) => {
  const normalizedTheme = normalizeTheme(theme);
  const declarations = Object.entries(cssVariableMap)
    .map(([variable, themeKey]) => {
      return `${variable}:${escapeCssValue(normalizedTheme[themeKey])}`;
    })
    .join(";");

  return `<style id="momnt-theme-vars">:root{${declarations}}</style>`;
};

const readSiteContentForHtml = async () => {
  try {
    if (pool) {
      await ensureSchema();
      const result = await pool.query(
        "SELECT payload FROM site_content WHERE id = TRUE LIMIT 1",
      );
      const siteContent = result.rows[0]?.payload || {};

      return {
        theme: normalizeTheme(siteContent.theme || {}),
        home: siteContent.home || {},
      };
    }

    const defaultCatalog = await getDefaultCatalog();
    return {
      theme: normalizeTheme(defaultCatalog.siteContent?.theme || {}),
      home: defaultCatalog.siteContent?.home || {},
    };
  } catch (error) {
    console.error(error);
    return {
      theme: normalizeTheme(),
      home: {},
    };
  }
};

const injectThemeStyle = (html, theme) => {
  const style = buildThemeStyle(theme);

  if (html.includes('id="momnt-theme-vars"')) {
    return html;
  }

  if (html.includes("</head>")) {
    return html.replace("</head>", `    ${style}\n  </head>`);
  }

  return `${style}${html}`;
};

const getPrimaryHeroImage = (home = {}) => {
  const heroImages = Array.isArray(home.heroImages) ? home.heroImages : [];
  const fallbackImage = String(home.heroImage ?? "").trim();

  return [...heroImages, fallbackImage]
    .map((image) => String(image ?? "").trim())
    .find(Boolean);
};

const injectHomeHeroImage = (html, home = {}) => {
  const primaryHeroImage = getPrimaryHeroImage(home);

  if (!primaryHeroImage || !html.includes('class="hero-media"')) {
    return html;
  }

  return html.replace(
    /(<div class="hero-media">[\s\S]*?<img\b[\s\S]*?\bsrc=")[^"]*(")/,
    `$1${escapeHtmlAttribute(primaryHeroImage)}$2`,
  );
};

const injectHtmlData = (html, htmlPath, siteContent) => {
  const themedHtml = injectThemeStyle(html, siteContent.theme);

  if (path.basename(htmlPath) !== "index.html") {
    return themedHtml;
  }

  return injectHomeHeroImage(themedHtml, siteContent.home);
};

const resolveHtmlPath = (requestPath) => {
  const cleanPath = requestPath.replace(/^\/+/, "");
  const htmlPath = cleanPath
    ? path.extname(cleanPath)
      ? cleanPath
      : `${cleanPath}.html`
    : "index.html";
  const resolvedPath = path.resolve(__dirname, htmlPath);

  if (!resolvedPath.startsWith(__dirname) || path.extname(resolvedPath) !== ".html") {
    return null;
  }

  return resolvedPath;
};

const sendThemedHtml = async (request, response, next) => {
  if (request.method !== "GET") {
    next();
    return;
  }

  const htmlPath = resolveHtmlPath(request.path);

  if (!htmlPath) {
    next();
    return;
  }

  try {
    const [html, siteContent] = await Promise.all([
      fs.readFile(htmlPath, "utf8"),
      readSiteContentForHtml(),
    ]);

    response.set("Content-Type", "text/html; charset=utf-8");
    response.set("Cache-Control", "no-store");
    response.send(injectHtmlData(html, htmlPath, siteContent));
  } catch (error) {
    next();
  }
};

const sendError = (response, status, message) => {
  response.status(status).json({ error: message });
};

const getAdminCode = (request) => {
  const headerCode = request.get("x-admin-code") || "";
  const authorization = request.get("authorization") || "";
  const bearerCode = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : "";

  return String(headerCode || bearerCode).trim();
};

const requireAdmin = (request, response, next) => {
  if (getAdminCode(request) !== adminAccessCode) {
    sendError(response, 401, "Código de admin inválido.");
    return;
  }

  next();
};

const ensureDatabase = (response) => {
  if (!pool) {
    sendError(response, 503, "DATABASE_URL não configurada.");
    return false;
  }

  return true;
};

const ensureSchema = async (client = pool) => {
  const schema = await fs.readFile(
    path.join(__dirname, "db", "schema.sql"),
    "utf8",
  );
  await client.query(schema);
};

const normalizeStringList = (value) =>
  Array.isArray(value)
    ? value.map((item) => String(item ?? "").trim()).filter(Boolean)
    : [];

const parseStockQuantity = (value) => {
  const digits = String(value ?? "").replace(/\D/g, "");

  if (!digits) {
    return null;
  }

  return Math.max(0, Number.parseInt(digits, 10));
};

const getStockLabel = (stockQuantity) => {
  const quantity = parseStockQuantity(stockQuantity);

  if (quantity === null) {
    return "";
  }

  if (quantity === 0) {
    return "Esgotado";
  }

  return quantity === 1
    ? "1 unidade disponível"
    : `${quantity} unidades disponíveis`;
};

const inferBadgeTone = (product = {}) => {
  const label = `${product.badge ?? ""} ${product.availability ?? ""}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (label.includes("esgotado") || label.includes("preview")) {
    return "neutral";
  }

  if (
    label.includes("ultima") ||
    label.includes("off") ||
    label.includes("promo")
  ) {
    return "soft";
  }

  return "green";
};

const buildProductHighlights = (product = {}) =>
  [
    getStockLabel(product.stockQuantity),
    product.availability,
    product.materials,
    product.dimensions,
  ]
    .map((item) => String(item ?? "").trim())
    .filter(Boolean);

const buildWhatsappText = (product = {}) =>
  `Oi, quero saber mais detalhes do ${product.name || "produto"} da MOMNT.`;

const normalizeCatalog = (catalog) => {
  const products = Array.isArray(catalog?.products) ? catalog.products : [];
  const categoryMeta =
    catalog?.categoryMeta && typeof catalog.categoryMeta === "object"
      ? catalog.categoryMeta
      : {};

  if (!categoryMeta.all) {
    categoryMeta.all = {
      label: "Todos",
      eyebrow: "Catálogo completo",
      title: "Produtos MOMNT",
      description: "",
      heroImage: "assets/images/lifestyle-04.jpg",
    };
  }

  return {
    products: products
      .map((product) => ({
        slug: String(product?.slug ?? "").trim(),
        name: String(product?.name ?? "").trim(),
        category: String(product?.category ?? "modern").trim() || "modern",
        categoryLabel: String(product?.categoryLabel ?? "").trim(),
        price: String(product?.price ?? "").trim() || "Sob consulta",
        badge: String(product?.badge ?? "").trim() || "Novo",
        badgeTone: String(product?.badgeTone ?? "neutral").trim() || "neutral",
        shortDescription: String(product?.shortDescription ?? "").trim(),
        description: String(product?.description ?? "").trim(),
        materials: String(product?.materials ?? "").trim(),
        availability:
          String(product?.availability ?? "").trim() || "Em preparação",
        dimensions: String(product?.dimensions ?? "").trim(),
        stockQuantity: parseStockQuantity(product?.stockQuantity),
        highlights: normalizeStringList(product?.highlights),
        images: normalizeStringList(product?.images),
        whatsappText: String(product?.whatsappText ?? "").trim(),
      }))
      .map((product) => ({
        ...product,
        badgeTone: inferBadgeTone(product),
        highlights: product.highlights.length
          ? product.highlights
          : buildProductHighlights(product),
        whatsappText: product.whatsappText || buildWhatsappText(product),
      }))
      .filter((product) => product.slug && product.name),
    categoryMeta: Object.fromEntries(
      Object.entries(categoryMeta)
        .map(([key, category]) => [
          String(key).trim(),
          {
            label: String(category?.label ?? key).trim(),
            eyebrow: String(category?.eyebrow ?? "").trim(),
            title: String(category?.title ?? "").trim(),
            description: String(category?.description ?? "").trim(),
            heroImage: String(category?.heroImage ?? "").trim(),
            highlightInNav: Boolean(category?.highlightInNav),
          },
        ])
        .filter(([key]) => key),
    ),
    siteContent:
      catalog?.siteContent && typeof catalog.siteContent === "object"
        ? catalog.siteContent
        : {},
  };
};

const readCatalogFromDatabase = async () => {
  await ensureSchema();

  const [categoriesResult, productsResult, imagesResult, highlightsResult, siteResult] =
    await Promise.all([
      pool.query("SELECT * FROM categories ORDER BY sort_order, key"),
      pool.query("SELECT * FROM products ORDER BY sort_order, slug"),
      pool.query(
        "SELECT * FROM product_images ORDER BY product_slug, sort_order",
      ),
      pool.query(
        "SELECT * FROM product_highlights ORDER BY product_slug, sort_order",
      ),
      pool.query("SELECT payload FROM site_content WHERE id = TRUE LIMIT 1"),
    ]);

  if (!categoriesResult.rowCount || !productsResult.rowCount) {
    const fallbackCatalog = normalizeCatalog(await getDefaultCatalog());
    await writeCatalogToDatabase(fallbackCatalog);
    return fallbackCatalog;
  }

  const categoryMeta = {};
  categoriesResult.rows.forEach((category) => {
    categoryMeta[category.key] = {
      label: category.label,
      eyebrow: category.eyebrow,
      title: category.title,
      description: category.description,
      heroImage: category.hero_image,
      highlightInNav: category.highlight_in_nav,
    };
  });

  const imagesByProduct = new Map();
  imagesResult.rows.forEach((image) => {
    if (!imagesByProduct.has(image.product_slug)) {
      imagesByProduct.set(image.product_slug, []);
    }
    imagesByProduct.get(image.product_slug).push(image.url);
  });

  const highlightsByProduct = new Map();
  highlightsResult.rows.forEach((highlight) => {
    if (!highlightsByProduct.has(highlight.product_slug)) {
      highlightsByProduct.set(highlight.product_slug, []);
    }
    highlightsByProduct.get(highlight.product_slug).push(highlight.text);
  });

  return normalizeCatalog({
    products: productsResult.rows.map((product) => ({
      slug: product.slug,
      name: product.name,
      category: product.category,
      categoryLabel: product.category_label,
      price: product.price,
      badge: product.badge,
      badgeTone: product.badge_tone,
      shortDescription: product.short_description,
      description: product.description,
      materials: product.materials,
      availability: product.availability,
      dimensions: product.dimensions,
      stockQuantity: product.stock_quantity,
      whatsappText: product.whatsapp_text,
      images: imagesByProduct.get(product.slug) || [],
      highlights: highlightsByProduct.get(product.slug) || [],
    })),
    categoryMeta,
    siteContent: siteResult.rows[0]?.payload || {},
  });
};

const writeCatalogToDatabase = async (catalog) => {
  const normalizedCatalog = normalizeCatalog(catalog);
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await ensureSchema(client);
    await client.query("DELETE FROM product_highlights");
    await client.query("DELETE FROM product_images");
    await client.query("DELETE FROM products");
    await client.query("DELETE FROM categories");
    await client.query("DELETE FROM site_content");

    const categoryEntries = Object.entries(normalizedCatalog.categoryMeta);
    for (const [index, [key, category]] of categoryEntries.entries()) {
      await client.query(
        `INSERT INTO categories
          (key, label, eyebrow, title, description, hero_image, highlight_in_nav, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          key,
          category.label,
          category.eyebrow,
          category.title,
          category.description,
          category.heroImage,
          Boolean(category.highlightInNav),
          index,
        ],
      );
    }

    for (const [index, product] of normalizedCatalog.products.entries()) {
      if (!normalizedCatalog.categoryMeta[product.category]) {
        product.category = "all";
      }

      await client.query(
        `INSERT INTO products
          (slug, name, category, category_label, price, badge, badge_tone,
           short_description, description, materials, availability, dimensions,
           stock_quantity, whatsapp_text, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [
          product.slug,
          product.name,
          product.category,
          product.categoryLabel,
          product.price,
          product.badge,
          product.badgeTone,
          product.shortDescription,
          product.description,
          product.materials,
          product.availability,
          product.dimensions,
          product.stockQuantity,
          product.whatsappText,
          index,
        ],
      );

      for (const [imageIndex, image] of product.images.entries()) {
        await client.query(
          `INSERT INTO product_images (product_slug, url, alt, sort_order)
           VALUES ($1, $2, $3, $4)`,
          [product.slug, image, product.name, imageIndex],
        );
      }

      for (const [highlightIndex, highlight] of product.highlights.entries()) {
        await client.query(
          `INSERT INTO product_highlights (product_slug, text, sort_order)
           VALUES ($1, $2, $3)`,
          [product.slug, highlight, highlightIndex],
        );
      }
    }

    await client.query(
      `INSERT INTO site_content (id, payload, updated_at)
       VALUES (TRUE, $1::jsonb, NOW())`,
      [JSON.stringify(normalizedCatalog.siteContent)],
    );

    await client.query("COMMIT");
    return normalizedCatalog;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const extensionByMimeType = (mimeType) => {
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  if (mimeType === "image/gif") return "gif";
  if (mimeType === "image/svg+xml") return "svg";
  return "jpg";
};

app.get("/api/health", (request, response) => {
  response.json({
    ok: true,
    database: Boolean(pool),
    r2: Boolean(s3 && r2Config.bucket && r2Config.publicBaseUrl),
  });
});

app.post("/api/admin/verify", requireAdmin, (request, response) => {
  response.json({ ok: true });
});

app.get("/api/catalog", async (request, response) => {
  try {
    const catalog = pool
      ? await readCatalogFromDatabase()
      : normalizeCatalog(await getDefaultCatalog());

    response.set("Cache-Control", "no-store");
    response.json(catalog);
  } catch (error) {
    console.error(error);
    sendError(response, 500, "Não foi possível carregar o catálogo.");
  }
});

app.put("/api/catalog", requireAdmin, async (request, response) => {
  if (!ensureDatabase(response)) {
    return;
  }

  try {
    const catalog = await writeCatalogToDatabase(request.body);
    response.json(catalog);
  } catch (error) {
    console.error(error);
    sendError(response, 500, "Não foi possível salvar o catálogo.");
  }
});

app.post(
  "/api/uploads/image",
  requireAdmin,
  upload.single("image"),
  async (request, response) => {
    if (!s3 || !r2Config.bucket || !r2Config.publicBaseUrl) {
      sendError(response, 503, "Cloudflare R2 não configurado.");
      return;
    }

    if (!request.file || !request.file.mimetype.startsWith("image/")) {
      sendError(response, 400, "Envie um arquivo de imagem.");
      return;
    }

    const target = String(request.body?.target || "products")
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const now = new Date();
    const extension = extensionByMimeType(request.file.mimetype);
    const key = [
      target || "products",
      String(now.getUTCFullYear()),
      String(now.getUTCMonth() + 1).padStart(2, "0"),
      `${crypto.randomUUID()}.${extension}`,
    ].join("/");

    try {
      await s3.send(
        new PutObjectCommand({
          Bucket: r2Config.bucket,
          Key: key,
          Body: request.file.buffer,
          ContentType: request.file.mimetype,
          CacheControl: "public, max-age=31536000, immutable",
        }),
      );

      response.json({
        url: `${r2Config.publicBaseUrl}/${key}`,
        key,
      });
    } catch (error) {
      console.error(error);
      sendError(response, 500, "Não foi possível enviar a imagem.");
    }
  },
);

app.use(sendThemedHtml);

app.use(
  express.static(__dirname, {
    etag: true,
    maxAge: "1h",
    setHeaders(response, filePath) {
      if (filePath.includes(`${path.sep}assets${path.sep}images${path.sep}`)) {
        response.setHeader("Cache-Control", "public, max-age=31536000");
      }
    },
  }),
);

app.get("*", (request, response) => {
  response.sendFile(path.join(__dirname, "index.html"));
});

app.listen(port, () => {
  console.log(`MOMNT listening on :${port}`);
});
