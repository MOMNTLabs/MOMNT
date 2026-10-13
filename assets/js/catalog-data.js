window.MOMNT_PRODUCTS = [
  {
    slug: "wave-2",
    name: "Wave 2.0",
    category: "modern",
    categoryLabel: "Modern",
    price: "R$ 150,00",
    badge: "Destaque",
    badgeTone: "green",
    shortDescription:
      "Frente translúcida com linhas marcantes e visual contemporâneo.",
    description:
      "Wave 2.0 combina um shape protagonista com linhas versáteis para quem busca presença no visual sem abrir mão do uso diário.",
    materials: "Acetato leve com lente UV400",
    availability: "Pronta entrega",
    dimensions: "Lente 53mm | Ponte 20mm | Haste 145mm",
    highlights: [
      "Shape marcante da coleção Modern",
      "Visual urbano com acabamento limpo",
      "Compra assistida e entrega local rápida",
    ],
    images: [
      "assets/images/product-wave-2.png",
      "assets/images/hero-banner.png",
      "assets/images/lifestyle-01.jpg",
    ],
    whatsappText: "Oi, quero saber mais detalhes do Wave 2.0 da MOMNT.",
  },
  {
    slug: "groove",
    name: "Groove",
    category: "modern",
    categoryLabel: "Modern",
    price: "R$ 150,00",
    badge: "Modern",
    badgeTone: "green",
    shortDescription:
      "Frente marcante e encaixe versátil para diferentes estilos.",
    description:
      "Groove combina frente marcante e encaixe versátil em uma proposta atual para acompanhar diferentes estilos e ocasiões.",
    materials: "Acetato polido com lente UV400",
    availability: "Pronta entrega",
    dimensions: "Lente 51mm | Ponte 22mm | Haste 145mm",
    highlights: [
      "Silhueta marcante e contemporânea",
      "Combina com produções casuais ou mais expressivas",
      "Compra assistida diretamente com a MOMNT",
    ],
    images: [
      "assets/images/product-groove.png",
      "assets/images/lifestyle-02.jpg",
      "assets/images/lifestyle-04.jpg",
    ],
    whatsappText: "Oi, quero saber mais detalhes do Groove da MOMNT.",
  },
  {
    slug: "phase",
    name: "Phase",
    category: "classic",
    categoryLabel: "Classic",
    price: "R$ 150,00",
    badge: "Classic",
    badgeTone: "green",
    shortDescription: "Visual limpo e elegante para uso diário.",
    description:
      "Phase apresenta uma proposta mais atemporal dentro da MOMNT, com linhas refinadas, versatilidade e presença equilibrada.",
    materials: "Acetato leve com lente UV400",
    availability: "Pronta entrega",
    dimensions: "Lente 50mm | Ponte 21mm | Haste 143mm",
    highlights: [
      "Categoria Classic com encaixe versátil",
      "Elegância com presença equilibrada",
      "Versátil para diferentes ocasiões",
    ],
    images: [
      "assets/images/product-phase.png",
      "assets/images/lifestyle-04.jpg",
      "assets/images/lifestyle-03.jpg",
    ],
    whatsappText: "Oi, quero saber mais detalhes do Phase da MOMNT.",
  },
  {
    slug: "loop",
    name: "Loop",
    category: "sport",
    categoryLabel: "Sport",
    price: "R$ 150,00",
    badge: "Sport",
    badgeTone: "green",
    shortDescription: "Perfil versátil para energia urbana e uso diário.",
    description:
      "Loop traz uma proposta leve e dinâmica para quem busca movimento, personalidade e um shape fácil de combinar.",
    materials: "Acetato leve com lente UV400",
    availability: "Pronta entrega",
    dimensions: "Lente 54mm | Ponte 19mm | Haste 145mm",
    highlights: [
      "Categoria Sport com visual mais versátil",
      "Funciona bem em look casual e solar",
      "Entrega local e suporte por WhatsApp",
    ],
    images: [
      "assets/images/product-loop.png",
      "assets/images/lifestyle-03.jpg",
      "assets/images/lifestyle-02.jpg",
    ],
    whatsappText: "Oi, quero saber mais detalhes do Loop da MOMNT.",
  },
];

window.MOMNT_CATEGORY_META = {
  all: {
    label: "Todos",
    eyebrow: "Catálogo completo",
    title: "Encontre o seu próximo MOMNT",
    description:
      "Explore os modelos disponíveis e encontre o shape que combina com o seu estilo.",
    heroImage: "assets/images/lifestyle-04.jpg",
  },
  modern: {
    label: "Modern",
    eyebrow: "Coleção Modern",
    title: "Shapes marcantes para uma presença contemporânea",
    description:
      "A linha Modern reúne formas expressivas e uma leitura urbana para quem gosta de um visual protagonista.",
    heroImage: "assets/images/lifestyle-02.jpg",
    highlightInNav: false,
  },
  classic: {
    label: "Classic",
    eyebrow: "Coleção Classic",
    title: "Silhuetas leves para acompanhar todos os dias",
    description:
      "A linha Classic combina versatilidade, elegância e formas equilibradas para diferentes ocasiões.",
    heroImage: "assets/images/lifestyle-03.jpg",
    highlightInNav: false,
  },
  sport: {
    label: "Sport",
    eyebrow: "Coleção Sport",
    title: "Energia urbana em formas dinâmicas",
    description:
      "A linha Sport traz uma leitura mais dinâmica para quem busca movimento e personalidade no visual.",
    heroImage: "assets/images/lifestyle-01.jpg",
    highlightInNav: false,
  },
};

window.MOMNT_SITE_CONTENT = {
  home: {
    heroImage: "assets/images/lifestyle-04.jpg",
    heroImages: ["assets/images/lifestyle-04.jpg"],
    featuredProductSlugs: ["wave-2", "groove", "phase", "loop"],
    featuredCategoryKeys: ["modern", "classic", "sport"],
  },
  theme: {
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
  },
};

(function () {
  const STORAGE_KEY = "momnt-admin-catalog-v1";
  const defaultCatalog = {
    products: window.MOMNT_PRODUCTS,
    categoryMeta: window.MOMNT_CATEGORY_META,
    siteContent: window.MOMNT_SITE_CONTENT,
  };

  const clone = (value) => JSON.parse(JSON.stringify(value));

  const isPlainObject = (value) =>
    Boolean(value) &&
    typeof value === "object" &&
    !Array.isArray(value);

  const normalizeStringList = (value) =>
    Array.isArray(value)
      ? value.map((item) => String(item ?? "").trim()).filter(Boolean)
      : [];

  const parseStockQuantity = (value) => {
    const digits = String(value ?? "").replace(/\D/g, "");

    if (!digits) {
      return "";
    }

    return Math.max(0, Number.parseInt(digits, 10));
  };

  const getStockLabel = (stockQuantity) => {
    const quantity = parseStockQuantity(stockQuantity);

    if (quantity === "") {
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

  const isCssColor = (value) =>
    Boolean(value) &&
    window.CSS &&
    typeof window.CSS.supports === "function" &&
    window.CSS.supports("color", value);

  const normalizeTheme = (theme = {}) =>
    Object.fromEntries(
      Object.entries(defaultTheme).map(([key, fallback]) => {
        const value = String(theme[key] ?? "").trim();
        return [key, isCssColor(value) ? value : fallback];
      }),
    );

  const applyTheme = (theme = {}) => {
    const normalizedTheme = normalizeTheme(theme);
    const rootStyle = document.documentElement.style;
    const pairs = {
      "--black": normalizedTheme.dark,
      "--ink": normalizedTheme.ink,
      "--text": normalizedTheme.textLight,
      "--muted": normalizedTheme.muted,
      "--line": normalizedTheme.line,
      "--surface": normalizedTheme.surface,
      "--surface-soft": normalizedTheme.surfaceSoft,
      "--gold": normalizedTheme.accent,
      "--green": normalizedTheme.success,
      "--red": normalizedTheme.danger,
      "--shop-bg": normalizedTheme.background,
      "--shop-surface": normalizedTheme.surface,
      "--shop-surface-soft": normalizedTheme.surfaceSoft,
      "--shop-line": normalizedTheme.line,
      "--shop-muted": normalizedTheme.muted,
      "--shop-dark": normalizedTheme.dark,
      "--shop-accent": normalizedTheme.accent,
      "--shop-green": normalizedTheme.success,
      "--shop-red": normalizedTheme.danger,
    };

    Object.entries(pairs).forEach(([name, value]) => {
      rootStyle.setProperty(name, value);
    });
  };

  const normalizeProduct = (product) => {
    if (!isPlainObject(product)) {
      return null;
    }

    const slug = String(product.slug ?? "").trim();
    const name = String(product.name ?? "").trim();

    if (!slug || !name) {
      return null;
    }

    return {
      slug,
      name,
      category: String(product.category ?? "modern").trim() || "modern",
      categoryLabel: String(product.categoryLabel ?? "").trim(),
      price: String(product.price ?? "").trim() || "Sob consulta",
      badge: String(product.badge ?? "").trim() || "Novo",
      badgeTone: String(product.badgeTone ?? "neutral").trim() || "neutral",
      shortDescription: String(product.shortDescription ?? "").trim(),
      description: String(product.description ?? "").trim(),
      materials: String(product.materials ?? "").trim(),
      availability:
        String(product.availability ?? "").trim() ||
        "Consulte disponibilidade",
      dimensions: String(product.dimensions ?? "").trim(),
      stockQuantity: parseStockQuantity(product.stockQuantity),
      highlights: normalizeStringList(product.highlights),
      images: normalizeStringList(product.images),
      whatsappText: String(product.whatsappText ?? "").trim(),
    };
  };

  const normalizeCategory = (category, fallbackLabel) => {
    if (!isPlainObject(category)) {
      return null;
    }

    return {
      label: String(category.label ?? fallbackLabel ?? "").trim(),
      eyebrow: String(category.eyebrow ?? "").trim(),
      title: String(category.title ?? "").trim(),
      description: String(category.description ?? "").trim(),
      heroImage: String(category.heroImage ?? "").trim(),
      highlightInNav: Boolean(category.highlightInNav),
    };
  };

  const normalizeCatalog = (catalog) => {
    if (!isPlainObject(catalog)) {
      return null;
    }

    const products = Array.isArray(catalog.products)
      ? catalog.products.map(normalizeProduct).filter(Boolean)
      : null;
    const categoryMeta = isPlainObject(catalog.categoryMeta)
      ? Object.fromEntries(
          Object.entries(catalog.categoryMeta)
            .map(([key, category]) => [
              String(key).trim(),
              normalizeCategory(category, key),
            ])
            .filter(([key, category]) => key && category),
        )
      : null;

    if (!products || !categoryMeta || !categoryMeta.all) {
      return null;
    }

    products.forEach((product) => {
      const category = categoryMeta[product.category];
      product.categoryLabel = category?.label || product.categoryLabel;
      product.images = product.images.length
        ? product.images
        : ["assets/images/category-modern.png"];
      product.badgeTone = inferBadgeTone(product);
      product.highlights = product.highlights.length
        ? product.highlights
        : buildProductHighlights(product);
      product.whatsappText =
        product.whatsappText ||
        `Oi, quero saber mais detalhes do ${product.name} da MOMNT.`;
    });

    return {
      products,
      categoryMeta,
      siteContent: {
        ...clone(defaultCatalog.siteContent),
        ...(isPlainObject(catalog.siteContent) ? catalog.siteContent : {}),
        home: {
          ...clone(defaultCatalog.siteContent.home),
          ...(isPlainObject(catalog.siteContent?.home)
            ? catalog.siteContent.home
            : {}),
        },
        theme: normalizeTheme({
          ...defaultTheme,
          ...(isPlainObject(defaultCatalog.siteContent?.theme)
            ? defaultCatalog.siteContent.theme
            : {}),
          ...(isPlainObject(catalog.siteContent?.theme)
            ? catalog.siteContent.theme
            : {}),
        }),
      },
    };
  };

  const readSavedCatalog = () => {
    try {
      const rawValue = window.localStorage.getItem(STORAGE_KEY);
      return normalizeCatalog(JSON.parse(rawValue ?? "null"));
    } catch {
      return null;
    }
  };

  const applyCatalog = (catalog) => {
    window.MOMNT_PRODUCTS = catalog.products;
    window.MOMNT_CATEGORY_META = catalog.categoryMeta;
    window.MOMNT_SITE_CONTENT = catalog.siteContent;
    applyTheme(window.MOMNT_SITE_CONTENT.theme);
  };

  const readRemoteCatalog = async () => {
    const response = await fetch("/api/catalog", {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    const contentType = response.headers.get("content-type") ?? "";

    if (!response.ok || !contentType.includes("application/json")) {
      return null;
    }

    return normalizeCatalog(await response.json());
  };

  const dispatchCatalogReady = () => {
    window.dispatchEvent(
      new CustomEvent("momnt:catalog-ready", {
        detail: {
          products: window.MOMNT_PRODUCTS,
          categoryMeta: window.MOMNT_CATEGORY_META,
          siteContent: window.MOMNT_SITE_CONTENT,
        },
      }),
    );
  };

  window.MOMNT_ADMIN_STORAGE_KEY = STORAGE_KEY;
  window.MOMNT_DEFAULT_CATALOG = clone(defaultCatalog);

  const isAdminPage = document.body?.classList.contains("admin-page");
  const savedCatalog = isAdminPage ? readSavedCatalog() : null;

  if (savedCatalog) {
    applyCatalog(savedCatalog);
  } else if (!document.querySelector("#momnt-theme-vars")) {
    applyTheme(window.MOMNT_SITE_CONTENT.theme);
  }

  window.MOMNT_CATALOG_READY = readRemoteCatalog()
    .then((remoteCatalog) => {
      if (remoteCatalog) {
        applyCatalog(remoteCatalog);
      }

      return {
        products: window.MOMNT_PRODUCTS,
        categoryMeta: window.MOMNT_CATEGORY_META,
        siteContent: window.MOMNT_SITE_CONTENT,
      };
    })
    .catch(() => ({
      products: window.MOMNT_PRODUCTS,
      categoryMeta: window.MOMNT_CATEGORY_META,
      siteContent: window.MOMNT_SITE_CONTENT,
    }))
    .finally(dispatchCatalogReady);
})();
