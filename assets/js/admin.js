(function () {
  const start = () => {
  const ACCESS_CODE = "momnt-admin";
  const ACCESS_CODE_KEY = "momnt-admin-access-code-v1";
  const SESSION_KEY = "momnt-admin-session-v1";
  const HEIC_CONVERTER_SRC =
    "https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js";
  const storageKey = window.MOMNT_ADMIN_STORAGE_KEY ?? "momnt-admin-catalog-v1";
  const defaultCatalog = window.MOMNT_DEFAULT_CATALOG ?? {
    products: window.MOMNT_PRODUCTS ?? [],
    categoryMeta: window.MOMNT_CATEGORY_META ?? {},
    siteContent: window.MOMNT_SITE_CONTENT ?? {},
  };

  const elements = {
    app: document.querySelector("#admin-app"),
    lock: document.querySelector("#admin-lock"),
    loginForm: document.querySelector("#admin-login-form"),
    loginFeedback: document.querySelector("#admin-login-feedback"),
    toast: document.querySelector("#admin-toast"),
    tabs: document.querySelectorAll("[data-tab]"),
    panels: document.querySelectorAll("[data-panel]"),
    save: document.querySelector("#admin-save"),
    exportTop: document.querySelector("#admin-export-top"),
    productDrawer: document.querySelector("#product-drawer"),
    productClose: document.querySelector("#product-close"),
    productCloseSecondary: document.querySelector("#product-close-secondary"),
    productList: document.querySelector("#product-list"),
    productForm: document.querySelector("#product-form"),
    productNew: document.querySelector("#product-new"),
    productDuplicate: document.querySelector("#product-duplicate"),
    productRemove: document.querySelector("#product-remove"),
    productSave: document.querySelector("#product-save"),
    productPreview: document.querySelector("#product-preview"),
    categoryList: document.querySelector("#category-list"),
    categoryForm: document.querySelector("#category-form"),
    categoryNew: document.querySelector("#category-new"),
    categoryRemove: document.querySelector("#category-remove"),
    categoryPreview: document.querySelector("#category-preview"),
    homeForm: document.querySelector("#home-form"),
    homePreview: document.querySelector("#home-preview"),
    featuredProductsSelect: document.querySelector("#featured-products-select"),
    featuredCategoriesSelect: document.querySelector("#featured-categories-select"),
    themeForm: document.querySelector("#theme-form"),
    themeFields: document.querySelector("#theme-fields"),
    exportOutput: document.querySelector("#export-output"),
    exportJson: document.querySelector("#export-json"),
    exportJs: document.querySelector("#export-js"),
    downloadExport: document.querySelector("#download-export"),
    copyExport: document.querySelector("#copy-export"),
    importJson: document.querySelector("#import-json"),
    resetCatalog: document.querySelector("#reset-catalog"),
    imageEditor: document.querySelector("#image-editor"),
    imageEditorTitle: document.querySelector("#image-editor-title"),
    imageEditorClose: document.querySelector("#image-editor-close"),
    imageEditorStatus: document.querySelector("#image-editor-status"),
    imageEditorStatusText: document.querySelector("#image-editor-status-text"),
    imageEditorProgressBar: document.querySelector("#image-editor-progress-bar"),
    imageEditorProgress: document.querySelector("#image-editor-progress"),
    imageChoice: document.querySelector("#image-choice"),
    imageChoicePreview: document.querySelector("#image-choice-preview"),
    imageUseOriginal: document.querySelector("#image-use-original"),
    imageOpenCrop: document.querySelector("#image-open-crop"),
    cropStage: document.querySelector("#crop-stage"),
    cropCanvas: document.querySelector("#crop-canvas"),
    cropZoom: document.querySelector("#crop-zoom"),
    cropSnap: document.querySelector("#crop-snap"),
    cropApply: document.querySelector("#crop-apply"),
    cropReset: document.querySelector("#crop-reset"),
    cropControls: document.querySelector("#image-editor-controls"),
    cropActions: document.querySelector("#crop-actions"),
  };

  const clone = (value) => JSON.parse(JSON.stringify(value));

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

  const themeFields = [
    ["background", "Fundo"],
    ["surface", "Superfície"],
    ["surfaceSoft", "Superfície suave"],
    ["ink", "Texto"],
    ["textLight", "Texto claro"],
    ["muted", "Neutro"],
    ["line", "Linha"],
    ["accent", "Destaque"],
    ["success", "Sucesso"],
    ["danger", "Alerta"],
    ["dark", "Escuro"],
  ];

  const state = {
    catalog: {
      products: clone(window.MOMNT_PRODUCTS ?? defaultCatalog.products ?? []),
      categoryMeta: clone(
        window.MOMNT_CATEGORY_META ?? defaultCatalog.categoryMeta ?? {},
      ),
      siteContent: clone(
        window.MOMNT_SITE_CONTENT ?? defaultCatalog.siteContent ?? {},
      ),
    },
    activeProductSlug: "",
    activeCategoryKey: "",
    dirty: false,
    productFormDirty: false,
    exportMode: "json",
    imageEditor: {
      fileTarget: "",
      image: null,
      imageDataUrl: "",
      mode: "choice",
      scale: 1,
      minScale: 1,
      offsetX: 0,
      offsetY: 0,
      dragging: false,
      dragX: 0,
      dragY: 0,
      startOffsetX: 0,
      startOffsetY: 0,
    },
  };

  const escapeHtml = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const isCssColor = (value) =>
    Boolean(value) &&
    window.CSS &&
    typeof window.CSS.supports === "function" &&
    window.CSS.supports("color", value);

  const sanitizeColor = (value, fallback) => {
    const nextValue = String(value ?? "").trim();

    return isCssColor(nextValue) ? nextValue : fallback;
  };

  const colorToHex = (value, fallback = "#000000") => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      return fallback;
    }

    context.fillStyle = fallback;
    context.fillStyle = value;

    return /^#[0-9a-f]{6}$/i.test(context.fillStyle)
      ? context.fillStyle
      : fallback;
  };

  const normalizeSlug = (value) =>
    String(value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 64);

  const linesToArray = (value) =>
    String(value ?? "")
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

  const arrayToLines = (value) =>
    Array.isArray(value) ? value.join("\n") : "";

  const priceDigits = (value) => String(value ?? "").replace(/\D/g, "");

  const formatPriceLabel = (value) => {
    const digits = priceDigits(value);

    if (!digits) {
      return "";
    }

    const amount = Number.parseInt(digits, 10) / 100;

    return amount
      .toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      })
      .replace(/\u00a0/g, " ");
  };

  const normalizePriceField = (field) => {
    if (!(field instanceof HTMLInputElement)) {
      return "";
    }

    const formattedPrice = formatPriceLabel(field.value);

    if (field.value !== formattedPrice) {
      field.value = formattedPrice;
    }

    return formattedPrice;
  };

  const parseStockQuantity = (value) => {
    const digits = String(value ?? "").replace(/\D/g, "");

    if (!digits) {
      return "";
    }

    return Math.max(0, Number.parseInt(digits, 10));
  };

  const normalizeStockField = (field) => {
    if (!(field instanceof HTMLInputElement)) {
      return "";
    }

    const quantity = parseStockQuantity(field.value);
    const nextValue = quantity === "" ? "" : String(quantity);

    if (field.value !== nextValue) {
      field.value = nextValue;
    }

    return quantity;
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

  const buildWhatsappText = (product = {}) =>
    `Oi, quero saber mais detalhes do ${product.name || "produto"} da MOMNT.`;

  const buildProductHighlights = (product = {}) =>
    [
      getStockLabel(product.stockQuantity),
      product.availability,
      product.materials,
      product.dimensions,
    ]
      .map((item) => String(item ?? "").trim())
      .filter(Boolean);

  const showToast = (message) => {
    if (!elements.toast) {
      return;
    }

    elements.toast.textContent = message;
    elements.toast.hidden = false;

    window.clearTimeout(showToast.timeout);
    showToast.timeout = window.setTimeout(() => {
      elements.toast.hidden = true;
    }, 3200);
  };

  const getAccessCode = () =>
    window.localStorage.getItem(ACCESS_CODE_KEY) || ACCESS_CODE;

  const canUseLocalFallback =
    window.location.protocol === "file:" ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  const apiRequest = async (path, options = {}, accessCode = getAccessCode()) => {
    const headers = new Headers(options.headers || {});
    headers.set("Accept", "application/json");
    headers.set("X-Admin-Code", accessCode);

    if (options.body && !(options.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    const response = await fetch(path, {
      ...options,
      headers,
    });
    const contentType = response.headers.get("content-type") || "";
    const body = contentType.includes("application/json")
      ? await response.json()
      : null;

    if (!response.ok) {
      throw new Error(body?.error || "Erro na API.");
    }

    return body;
  };

  const dataUrlToBlob = async (dataUrl) => {
    const response = await fetch(dataUrl);
    return response.blob();
  };

  const uploadImageDataUrl = async (dataUrl, target) => {
    if (!String(dataUrl).startsWith("data:image/")) {
      return dataUrl;
    }

    const blob = await dataUrlToBlob(dataUrl);
    const formData = new FormData();
    const fileExtension = blob.type === "image/png" ? "png" : "jpg";

    formData.append("target", target || "product");
    formData.append("image", blob, `momnt-${Date.now()}.${fileExtension}`);

    const result = await apiRequest("/api/uploads/image", {
      method: "POST",
      body: formData,
    });

    return result.url;
  };

  const setDirty = (dirty = true) => {
    state.dirty = dirty;
  };

  const normalizeTheme = (theme = {}) =>
    Object.fromEntries(
      themeFields.map(([key]) => [
        key,
        sanitizeColor(theme[key], defaultTheme[key]),
      ]),
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

  const openProductEditor = (slug) => {
    state.activeProductSlug = slug;
    state.productFormDirty = false;
    elements.productDrawer?.classList.add("is-open");
    elements.productDrawer?.setAttribute("aria-hidden", "false");
  };

  const closeProductEditor = (options = {}) => {
    if (state.productFormDirty && !options.force) {
      return false;
    }

    state.activeProductSlug = "";
    state.productFormDirty = false;
    elements.productDrawer?.classList.remove("is-open");
    elements.productDrawer?.setAttribute("aria-hidden", "true");
    renderProductList();
    return true;
  };

  const getCategoryKeys = () =>
    Object.keys(state.catalog.categoryMeta).filter((key) => key !== "all");

  const getProduct = () =>
    state.catalog.products.find(
      (product) => product.slug === state.activeProductSlug,
    ) ?? null;

  const getCategory = () =>
    state.catalog.categoryMeta[state.activeCategoryKey] ?? null;

  const getCategoryProducts = () =>
    state.activeCategoryKey
      ? state.catalog.products.filter(
          (product) => product.category === state.activeCategoryKey,
        )
      : [];

  const syncCategoryLabels = () => {
    state.catalog.products = state.catalog.products.map((product) => ({
      ...product,
      categoryLabel:
        state.catalog.categoryMeta[product.category]?.label ||
        product.categoryLabel ||
        product.category,
    }));
  };

  const sanitizeCatalog = (catalog) => {
    const nextCatalog = {
      products: Array.isArray(catalog.products) ? catalog.products : [],
      categoryMeta:
        catalog.categoryMeta && typeof catalog.categoryMeta === "object"
          ? catalog.categoryMeta
          : {},
      siteContent:
        catalog.siteContent && typeof catalog.siteContent === "object"
          ? catalog.siteContent
          : {},
    };

    if (!nextCatalog.categoryMeta.all) {
      nextCatalog.categoryMeta.all = clone(defaultCatalog.categoryMeta.all);
    }

    nextCatalog.products = nextCatalog.products
      .map((product) => ({
        slug: normalizeSlug(product.slug),
        name: String(product.name ?? "").trim(),
        category: String(product.category ?? "modern").trim() || "modern",
        categoryLabel: String(product.categoryLabel ?? "").trim(),
        price: String(product.price ?? "").trim() || "Sob consulta",
        badge: String(product.badge ?? "").trim() || "Novo",
        badgeTone: String(product.badgeTone ?? "neutral").trim() || "neutral",
        shortDescription: String(product.shortDescription ?? "").trim(),
        description: String(product.description ?? "").trim(),
        materials: String(product.materials ?? "").trim(),
        availability:
          String(product.availability ?? "").trim() || "Em preparação",
        dimensions: String(product.dimensions ?? "").trim(),
        stockQuantity: parseStockQuantity(product.stockQuantity),
        highlights: Array.isArray(product.highlights)
          ? product.highlights.map(String).filter(Boolean)
          : [],
        images:
          Array.isArray(product.images) && product.images.length
            ? product.images.map(String).filter(Boolean)
            : ["assets/images/product-placeholder-modern.svg"],
        whatsappText: String(product.whatsappText ?? "").trim(),
      }))
      .map((product) => ({
        ...product,
        badgeTone: inferBadgeTone(product),
        highlights: buildProductHighlights(product),
        whatsappText: buildWhatsappText(product),
      }))
      .filter((product, index, products) => {
        if (!product.slug || !product.name) {
          return false;
        }

        return products.findIndex((item) => item.slug === product.slug) === index;
      });

    nextCatalog.siteContent.home = {
      ...(defaultCatalog.siteContent?.home ?? {}),
      ...(nextCatalog.siteContent.home ?? {}),
    };
    nextCatalog.siteContent.theme = normalizeTheme({
      ...defaultTheme,
      ...(defaultCatalog.siteContent?.theme ?? {}),
      ...(nextCatalog.siteContent.theme ?? {}),
    });

    return nextCatalog;
  };

  const validateCatalog = () => {
    syncCategoryLabels();

    const usedSlugs = new Set();

    for (const product of state.catalog.products) {
      if (!product.slug || !product.name) {
        return "Todo produto precisa de slug e nome.";
      }

      if (usedSlugs.has(product.slug)) {
        return `O slug "${product.slug}" está duplicado.`;
      }

      usedSlugs.add(product.slug);

      if (!state.catalog.categoryMeta[product.category]) {
        return `O produto "${product.name}" usa uma categoria que não existe.`;
      }
    }

    if (!state.catalog.categoryMeta.all) {
      return "A categoria base Todos não pode ser removida.";
    }

    return "";
  };

  const saveCatalog = async () => {
    const error = validateCatalog();

    if (error) {
      showToast(error);
      return false;
    }

    try {
      const savedCatalog = await apiRequest("/api/catalog", {
        method: "PUT",
        body: JSON.stringify(state.catalog),
      });
      state.catalog = sanitizeCatalog(savedCatalog);
      window.localStorage.removeItem(storageKey);
      setDirty(false);
      state.productFormDirty = false;
      renderAll();
      showToast("Catálogo salvo no Postgres.");
      return true;
    } catch (error) {
      if (!canUseLocalFallback) {
        showToast(`Não salvou no Postgres: ${error.message}`);
        return false;
      }
    }

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(state.catalog));
      setDirty(false);
      state.productFormDirty = false;
      showToast("Catálogo salvo.");
      return true;
    } catch (error) {
      showToast(
        "Não foi possível salvar. Tente imagens menores ou exporte o catálogo.",
      );
      return false;
    }
  };

  const renderProductList = () => {
    if (!elements.productList) {
      return;
    }

    const category = getCategory();
    const products = getCategoryProducts();

    if (!category) {
      elements.productList.innerHTML =
        '<p class="admin-empty">Selecione uma categoria.</p>';
      return;
    }

    elements.productList.innerHTML =
      products
        .map((product) => {
          const thumbnail =
            Array.isArray(product.images) && product.images[0]
              ? product.images[0]
              : "assets/images/product-placeholder-modern.svg";
          const stockLabel = getStockLabel(product.stockQuantity);
          const meta = [
            product.categoryLabel || product.category,
            product.price,
            stockLabel,
          ]
            .filter(Boolean)
            .join(" | ");

          return `
            <button
              class="${product.slug === state.activeProductSlug ? "is-active" : ""}"
              type="button"
              data-product="${escapeHtml(product.slug)}"
            >
              <span class="product-list-thumb" aria-hidden="true">
                <img src="${escapeHtml(thumbnail)}" alt="" loading="lazy" />
              </span>
              <span class="product-list-copy">
                <span class="list-title">${escapeHtml(product.name)}</span>
                <span class="list-meta">${escapeHtml(meta)}</span>
              </span>
            </button>
          `;
        })
        .join("") || '<p class="admin-empty">Nenhum produto.</p>';

    elements.productList.querySelectorAll("[data-product]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        openProductEditor(button.getAttribute("data-product") ?? "");
        renderProducts();
      });
    });
  };

  const updateCategorySelect = () => {
    const select = elements.productForm?.elements.category;

    if (!(select instanceof HTMLSelectElement)) {
      return;
    }

    select.innerHTML = getCategoryKeys()
      .map(
        (key) => `
          <option value="${escapeHtml(key)}">
            ${escapeHtml(state.catalog.categoryMeta[key].label)}
          </option>
        `,
      )
      .join("");
  };

  const fillProductForm = () => {
    const product = getProduct();
    const form = elements.productForm;

    if (!form || !product) {
      elements.productDrawer?.classList.remove("is-open");
      elements.productDrawer?.setAttribute("aria-hidden", "true");
      return;
    }

    form.elements.slug.value = product.slug;
    form.elements.name.value = product.name;
    form.elements.category.value = product.category;
    form.elements.price.value = formatPriceLabel(product.price);
    form.elements.stockQuantity.value =
      product.stockQuantity === "" || product.stockQuantity === undefined
        ? ""
        : String(product.stockQuantity);
    form.elements.badge.value = product.badge;
    form.elements.availability.value = product.availability;
    form.elements.materials.value = product.materials;
    form.elements.shortDescription.value = product.shortDescription;
    form.elements.description.value = product.description;
    form.elements.dimensions.value = product.dimensions;
    form.elements.images.value = arrayToLines(product.images);

    renderProductImageList(product.images);
  };

  const syncCatalogButtons = () => {
    const hasCategory = Boolean(getCategory());
    const hasProduct = Boolean(getProduct());

    if (elements.categoryRemove instanceof HTMLButtonElement) {
      elements.categoryRemove.disabled = !hasCategory;
      elements.categoryRemove.hidden = !hasCategory;
    }

    if (elements.productNew instanceof HTMLButtonElement) {
      elements.productNew.disabled = !hasCategory;
      elements.productNew.hidden = !hasCategory;
    }

    if (elements.productDuplicate instanceof HTMLButtonElement) {
      elements.productDuplicate.disabled = !hasProduct;
      elements.productDuplicate.hidden = !hasProduct;
    }

    if (elements.productRemove instanceof HTMLButtonElement) {
      elements.productRemove.disabled = !hasProduct;
      elements.productRemove.hidden = !hasProduct;
    }
  };

  const readProductForm = () => {
    const form = elements.productForm;
    const currentSlug = state.activeProductSlug;

    if (!form) {
      return;
    }

    const formattedPrice = normalizePriceField(form.elements.price);
    const stockQuantity = normalizeStockField(form.elements.stockQuantity);
    const nextSlug = normalizeSlug(form.elements.slug.value);
    const nextProduct = {
      slug: nextSlug,
      name: form.elements.name.value.trim(),
      category: form.elements.category.value,
      categoryLabel:
        state.catalog.categoryMeta[form.elements.category.value]?.label ?? "",
      price: formattedPrice || "Sob consulta",
      badge: form.elements.badge.value.trim(),
      availability: form.elements.availability.value.trim(),
      materials: form.elements.materials.value.trim(),
      shortDescription: form.elements.shortDescription.value.trim(),
      description: form.elements.description.value.trim(),
      dimensions: form.elements.dimensions.value.trim(),
      stockQuantity,
      images: linesToArray(form.elements.images.value),
    };

    nextProduct.badgeTone = inferBadgeTone(nextProduct);
    nextProduct.whatsappText = buildWhatsappText(nextProduct);
    nextProduct.highlights = buildProductHighlights(nextProduct);

    const index = state.catalog.products.findIndex(
      (product) => product.slug === currentSlug,
    );

    if (index >= 0) {
      state.catalog.products[index] = nextProduct;
    }

    state.activeProductSlug = nextSlug;
    state.productFormDirty = true;
    setDirty();
    renderProductList();
    renderProductImageList(nextProduct.images);
  };

  const renderProducts = () => {
    syncCategoryLabels();
    updateCategorySelect();

    renderProductList();
    fillProductForm();
    syncCatalogButtons();
  };

  const renderCategoryList = () => {
    if (!elements.categoryList) {
      return;
    }

    elements.categoryList.innerHTML = getCategoryKeys()
      .map((key) => {
        const category = state.catalog.categoryMeta[key];

        return `
          <button
            class="${key === state.activeCategoryKey ? "is-active" : ""}"
            type="button"
            data-category="${escapeHtml(key)}"
          >
            <span class="list-title">${escapeHtml(category.label)}</span>
            <span class="list-meta">${escapeHtml(key)}</span>
          </button>
        `;
      })
      .join("");

    elements.categoryList
      .querySelectorAll("[data-category]")
      .forEach((button) => {
        button.addEventListener("click", () => {
          const nextCategoryKey = button.getAttribute("data-category") ?? "";

          if (
            nextCategoryKey !== state.activeCategoryKey &&
            !closeProductEditor()
          ) {
            showToast("Salve as alterações antes de trocar de categoria.");
            return;
          }

          state.activeCategoryKey = nextCategoryKey;
          state.activeProductSlug = "";
          renderCategories();
          renderProducts();
        });
      });
  };

  const fillCategoryForm = () => {
    const form = elements.categoryForm;
    const category = getCategory();

    if (!form || !category) {
      if (form) {
        form.hidden = true;
      }
      return;
    }

    form.hidden = false;
    form.elements.key.value = state.activeCategoryKey;
    form.elements.key.disabled = false;
    form.elements.label.value = category.label;
    form.elements.eyebrow.value = category.eyebrow;
    form.elements.title.value = category.title;
    form.elements.description.value = category.description;
    form.elements.heroImage.value = category.heroImage;
    form.elements.highlightInNav.checked = Boolean(category.highlightInNav);
    renderImagePreview(elements.categoryPreview, [category.heroImage]);
  };

  const readCategoryForm = () => {
    const form = elements.categoryForm;

    if (!form) {
      return;
    }

    const previousKey = state.activeCategoryKey;
    const nextKey =
      previousKey === "all" ? "all" : normalizeSlug(form.elements.key.value);

    if (!nextKey) {
      showToast("A categoria precisa de uma chave.");
      fillCategoryForm();
      return;
    }

    const nextCategory = {
      label: form.elements.label.value.trim() || nextKey,
      eyebrow: form.elements.eyebrow.value.trim(),
      title: form.elements.title.value.trim(),
      description: form.elements.description.value.trim(),
      heroImage: form.elements.heroImage.value.trim(),
      highlightInNav: Boolean(form.elements.highlightInNav.checked),
    };

    if (previousKey !== nextKey) {
      delete state.catalog.categoryMeta[previousKey];
      state.catalog.products = state.catalog.products.map((product) =>
        product.category === previousKey
          ? { ...product, category: nextKey }
          : product,
      );
    }

    state.catalog.categoryMeta[nextKey] = nextCategory;
    state.activeCategoryKey = nextKey;
    setDirty();
    renderCategories();
    renderProducts();
  };

  const renderCategories = () => {
    renderCategoryList();
    fillCategoryForm();
    syncCatalogButtons();
  };

  const getHomeFieldValues = () => {
    const form = elements.homeForm;
    const fallbackHome = state.catalog.siteContent.home ?? {};

    if (!form) {
      return fallbackHome;
    }

    return {
      ...fallbackHome,
      heroKicker: form.elements.heroKicker.value.trim(),
      heroTitle: form.elements.heroTitle.value.trim(),
      heroText: form.elements.heroText.value.trim(),
      featuredProductSlugs: linesToArray(form.elements.featuredProductSlugs.value),
      featuredCategoryKeys: linesToArray(form.elements.featuredCategoryKeys.value),
    };
  };

  const renderMultiSelect = (
    root,
    { emptyLabel, options, placeholder, selected, type },
  ) => {
    if (!root) {
      return;
    }

    const selectedSet = new Set(selected);
    const selectedOptions = options.filter((option) =>
      selectedSet.has(option.value),
    );
    const summary =
      selectedOptions.length > 0
        ? selectedOptions.map((option) => option.label).join(", ")
        : placeholder;

    root.innerHTML = `
      <details>
        <summary><span>${escapeHtml(summary)}</span></summary>
        <div class="admin-multi-panel">
          ${
            options.length
              ? options
                  .map(
                    (option) => `
                      <label class="admin-multi-option">
                        <input
                          type="checkbox"
                          value="${escapeHtml(option.value)}"
                          data-multi-select="${escapeHtml(type)}"
                          ${selectedSet.has(option.value) ? "checked" : ""}
                        />
                        <span>
                          ${escapeHtml(option.label)}
                          <small>${escapeHtml(option.meta)}</small>
                        </span>
                      </label>
                    `,
                  )
                  .join("")
              : `<div class="admin-multi-empty">${escapeHtml(emptyLabel)}</div>`
          }
        </div>
      </details>
    `;
  };

  const renderHomeMultiSelects = () => {
    const home = getHomeFieldValues();
    const productOptions = state.catalog.products.map((product) => ({
      value: product.slug,
      label: product.name,
      meta: `${product.slug} | ${product.categoryLabel || product.category || "Sem categoria"}`,
    }));
    const categoryOptions = getCategoryKeys().map((key) => ({
      value: key,
      label: state.catalog.categoryMeta[key]?.label || key,
      meta: key,
    }));

    renderMultiSelect(elements.featuredProductsSelect, {
      emptyLabel: "Nenhum produto cadastrado.",
      options: productOptions,
      placeholder: "Selecione os produtos recomendados",
      selected: home.featuredProductSlugs ?? [],
      type: "products",
    });
    renderMultiSelect(elements.featuredCategoriesSelect, {
      emptyLabel: "Nenhuma categoria cadastrada.",
      options: categoryOptions,
      placeholder: "Selecione as categorias em destaque",
      selected: home.featuredCategoryKeys ?? [],
      type: "categories",
    });
  };

  const updateHomeSelection = (fieldName, root) => {
    const form = elements.homeForm;

    if (!form || !root) {
      return;
    }

    const keepOpen = Boolean(root.querySelector("details")?.open);
    const values = Array.from(root.querySelectorAll("input:checked")).map(
      (input) => input.value,
    );

    form.elements[fieldName].value = arrayToLines(values);
    readHomeForm();
    renderHomeMultiSelects();

    if (keepOpen) {
      root.querySelector("details")?.setAttribute("open", "");
    }
  };

  const fillHomeForm = () => {
    const form = elements.homeForm;
    const home = state.catalog.siteContent.home ?? {};
    const heroImages = getHomeHeroImages(home);

    if (!form) {
      return;
    }

    form.elements.heroImages.value = arrayToLines(heroImages);
    form.elements.heroKicker.value = home.heroKicker ?? "";
    form.elements.heroTitle.value = home.heroTitle ?? "";
    form.elements.heroText.value = home.heroText ?? "";
    form.elements.featuredProductSlugs.value = arrayToLines(
      home.featuredProductSlugs,
    );
    form.elements.featuredCategoryKeys.value = arrayToLines(
      home.featuredCategoryKeys,
    );
    renderHomeHeroImageList(heroImages);
    renderHomeMultiSelects();
  };

  const readHomeForm = () => {
    const form = elements.homeForm;

    if (!form) {
      return;
    }

    const heroImages = linesToArray(form.elements.heroImages.value);

    state.catalog.siteContent.home = {
      ...(state.catalog.siteContent.home ?? {}),
      heroImage: heroImages[0] ?? "",
      heroImages,
      heroKicker: form.elements.heroKicker.value.trim(),
      heroTitle: form.elements.heroTitle.value.trim(),
      heroText: form.elements.heroText.value.trim(),
      featuredProductSlugs: linesToArray(form.elements.featuredProductSlugs.value),
      featuredCategoryKeys: linesToArray(form.elements.featuredCategoryKeys.value),
    };

    setDirty();
    renderHomeHeroImageList(heroImages);
  };

  const getTheme = () =>
    normalizeTheme({
      ...defaultTheme,
      ...(state.catalog.siteContent.theme ?? {}),
    });

  const fillThemeForm = () => {
    if (!elements.themeFields) {
      return;
    }

    const theme = getTheme();

    elements.themeFields.innerHTML = themeFields
      .map(([key, label]) => {
        const value = theme[key];
        const hexValue = colorToHex(value, defaultTheme[key]);

        return `
          <label class="color-field">
            <span>${escapeHtml(label)}</span>
            <div class="color-control">
              <input type="color" value="${escapeHtml(hexValue)}" data-theme-color="${escapeHtml(key)}" />
              <input type="text" value="${escapeHtml(value)}" data-theme-text="${escapeHtml(key)}" spellcheck="false" />
            </div>
          </label>
        `;
      })
      .join("");
  };

  const readThemeForm = (event) => {
    if (!elements.themeFields) {
      return;
    }

    const target = event?.target;

    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    const colorKey =
      target.getAttribute("data-theme-color") ??
      target.getAttribute("data-theme-text");

    if (!colorKey || !defaultTheme[colorKey]) {
      return;
    }

    const textInput = elements.themeFields.querySelector(
      `[data-theme-text="${colorKey}"]`,
    );
    const colorInput = elements.themeFields.querySelector(
      `[data-theme-color="${colorKey}"]`,
    );
    const isColorInput = target.hasAttribute("data-theme-color");
    const nextValue = isColorInput
      ? target.value
      : sanitizeColor(target.value, getTheme()[colorKey]);

    state.catalog.siteContent.theme = {
      ...getTheme(),
      [colorKey]: nextValue,
    };

    if (textInput instanceof HTMLInputElement) {
      textInput.value = nextValue;
    }

    if (colorInput instanceof HTMLInputElement) {
      colorInput.value = colorToHex(nextValue, defaultTheme[colorKey]);
    }

    applyTheme(state.catalog.siteContent.theme);
    setDirty();
  };

  const renderImagePreview = (root, images) => {
    if (!root) {
      return;
    }

    const visibleImages = (Array.isArray(images) ? images : [])
      .map((image) => String(image ?? "").trim())
      .filter(Boolean)
      .slice(0, 6);

    root.innerHTML = visibleImages
      .map(
        (image) => `
          <img src="${escapeHtml(image)}" alt="Preview da imagem" loading="lazy" />
        `,
      )
      .join("");
  };

  const renderProductImageList = (images) => {
    if (!elements.productPreview) {
      return;
    }

    const visibleImages = (Array.isArray(images) ? images : [])
      .map((image) => String(image ?? "").trim())
      .filter(Boolean);

    elements.productPreview.innerHTML = visibleImages
      .map(
        (image, index) => `
          <article
            class="product-image-card${index === 0 ? " is-main" : ""}"
            data-image-index="${index}"
            draggable="true"
          >
            <div class="product-image-media">
              <img src="${escapeHtml(image)}" alt="Imagem ${index + 1} do produto" loading="lazy" />
              <span class="product-image-drag" aria-label="Arraste para ordenar" title="Arraste para ordenar">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M9 5h.01M15 5h.01M9 12h.01M15 12h.01M9 19h.01M15 19h.01"></path>
                </svg>
              </span>
              ${
                index === 0
                  ? `<span class="product-image-main" aria-label="Imagem principal" title="Imagem principal">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2 7.5 14 3 9.6l6.2-.9L12 3Z"></path>
                      </svg>
                    </span>`
                  : ""
              }
              <button class="product-image-remove" type="button" data-image-action="remove" aria-label="Remover imagem" title="Remover imagem">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3"></path>
                </svg>
              </button>
            </div>
          </article>
        `,
      )
      .join("");
  };

  const getProductFormImages = () =>
    elements.productForm ? linesToArray(elements.productForm.elements.images.value) : [];

  const setProductFormImages = (images) => {
    if (!elements.productForm) {
      return;
    }

    const cleanImages = (Array.isArray(images) ? images : [])
      .map((image) => String(image ?? "").trim())
      .filter(Boolean);

    elements.productForm.elements.images.value = arrayToLines(cleanImages);
    readProductForm();
  };

  const getHomeHeroImages = (home = {}) => {
    const heroImages = Array.isArray(home.heroImages)
      ? home.heroImages
      : linesToArray(home.heroImages);
    const fallbackImage = String(home.heroImage ?? "").trim();

    return [...heroImages, fallbackImage]
      .map((image) => String(image ?? "").trim())
      .filter(Boolean)
      .filter((image, index, images) => images.indexOf(image) === index);
  };

  const getHomeFormHeroImages = () =>
    elements.homeForm
      ? linesToArray(elements.homeForm.elements.heroImages.value)
      : [];

  const setHomeFormHeroImages = (images) => {
    if (!elements.homeForm) {
      return;
    }

    const cleanImages = (Array.isArray(images) ? images : [])
      .map((image) => String(image ?? "").trim())
      .filter(Boolean);

    elements.homeForm.elements.heroImages.value = arrayToLines(cleanImages);
    readHomeForm();
  };

  const renderHomeHeroImageList = (images) => {
    if (!elements.homePreview) {
      return;
    }

    const home = getHomeFieldValues();
    const visibleImages = (Array.isArray(images) ? images : [])
      .map((image) => String(image ?? "").trim())
      .filter(Boolean);

    elements.homePreview.innerHTML = visibleImages
      .map(
        (image, index) => `
          <article
            class="product-image-card${index === 0 ? " is-main" : ""}"
            data-home-image-index="${index}"
            draggable="true"
          >
            <div class="product-image-media home-hero-preview">
              <img src="${escapeHtml(image)}" alt="Banner ${index + 1} do hero" loading="lazy" />
              <div class="home-hero-preview-ui" aria-hidden="true">
                <span class="home-hero-preview-logo">MOMNT</span>
                <span class="home-hero-preview-nav">
                  <span>Modern</span>
                  <span>Classic</span>
                  <span>Sport</span>
                </span>
              </div>
              <div class="home-hero-preview-copy">
                <span class="home-hero-preview-kicker">${escapeHtml(home.heroKicker || "MOMNT")}</span>
                <strong>${escapeHtml(home.heroTitle || "nova colecao")}</strong>
                <p>${escapeHtml(home.heroText || "")}</p>
              </div>
              <span class="product-image-drag" aria-label="Arraste para ordenar" title="Arraste para ordenar">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M9 5h.01M15 5h.01M9 12h.01M15 12h.01M9 19h.01M15 19h.01"></path>
                </svg>
              </span>
              ${
                index === 0
                  ? `<span class="product-image-main" aria-label="Banner principal" title="Banner principal">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2 7.5 14 3 9.6l6.2-.9L12 3Z"></path>
                      </svg>
                    </span>`
                  : ""
              }
              <button class="product-image-remove" type="button" data-home-image-action="remove" aria-label="Remover banner" title="Remover banner">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3"></path>
                </svg>
              </button>
            </div>
          </article>
        `,
      )
      .join("");
  };

  const cropPresets = {
    home: {
      label: "Banner 16:9",
      width: 1280,
      height: 720,
      aspectRatio: "16 / 9",
    },
    product: {
      label: "Produto 4:5",
      width: 1200,
      height: 1500,
      aspectRatio: "4 / 5",
    },
    category: {
      label: "Categoria 4:3",
      width: 1200,
      height: 900,
      aspectRatio: "4 / 3",
    },
  };

  const getCropPreset = (target) => cropPresets[target] ?? cropPresets.product;

  const writeImageToTarget = async (dataUrl, target) => {
    const imageUrl = await uploadImageDataUrl(dataUrl, target);

    if (target === "product" && elements.productForm) {
      setProductFormImages([...getProductFormImages(), imageUrl]);
    }

    if (target === "category" && elements.categoryForm) {
      elements.categoryForm.elements.heroImage.value = imageUrl;
      readCategoryForm();
    }

    if (target === "home" && elements.homeForm) {
      setHomeFormHeroImages([...getHomeFormHeroImages(), imageUrl]);
    }
  };

  const getExportPayload = () => ({
    products: state.catalog.products,
    categoryMeta: state.catalog.categoryMeta,
    siteContent: state.catalog.siteContent,
  });

  const buildCatalogDataJs = () => {
    const payload = getExportPayload();

    return [
      `window.MOMNT_PRODUCTS = ${JSON.stringify(payload.products, null, 2)};`,
      "",
      `window.MOMNT_CATEGORY_META = ${JSON.stringify(payload.categoryMeta, null, 2)};`,
      "",
      `window.MOMNT_SITE_CONTENT = ${JSON.stringify(payload.siteContent, null, 2)};`,
      "",
      "(function () {",
      `  const STORAGE_KEY = ${JSON.stringify(storageKey)};`,
      "  const clone = (value) => JSON.parse(JSON.stringify(value));",
      "  const defaultCatalog = {",
      "    products: window.MOMNT_PRODUCTS,",
      "    categoryMeta: window.MOMNT_CATEGORY_META,",
      "    siteContent: window.MOMNT_SITE_CONTENT,",
      "  };",
      `  const defaultTheme = ${JSON.stringify(defaultTheme, null, 4)};`,
      "  const isCssColor = (value) =>",
      "    Boolean(value) &&",
      "    window.CSS &&",
      "    typeof window.CSS.supports === 'function' &&",
      "    window.CSS.supports('color', value);",
      "  const normalizeTheme = (theme = {}) =>",
      "    Object.fromEntries(",
      "      Object.entries(defaultTheme).map(([key, fallback]) => {",
      "        const value = String(theme[key] ?? '').trim();",
      "        return [key, isCssColor(value) ? value : fallback];",
      "      }),",
      "    );",
      "  const applyTheme = (theme = {}) => {",
      "    const normalizedTheme = normalizeTheme(theme);",
      "    const rootStyle = document.documentElement.style;",
      "    const pairs = {",
      "      '--black': normalizedTheme.dark,",
      "      '--ink': normalizedTheme.ink,",
      "      '--text': normalizedTheme.textLight,",
      "      '--muted': normalizedTheme.muted,",
      "      '--line': normalizedTheme.line,",
      "      '--surface': normalizedTheme.surface,",
      "      '--surface-soft': normalizedTheme.surfaceSoft,",
      "      '--gold': normalizedTheme.accent,",
      "      '--green': normalizedTheme.success,",
      "      '--red': normalizedTheme.danger,",
      "      '--shop-bg': normalizedTheme.background,",
      "      '--shop-surface': normalizedTheme.surface,",
      "      '--shop-surface-soft': normalizedTheme.surfaceSoft,",
      "      '--shop-line': normalizedTheme.line,",
      "      '--shop-muted': normalizedTheme.muted,",
      "      '--shop-dark': normalizedTheme.dark,",
      "      '--shop-accent': normalizedTheme.accent,",
      "      '--shop-green': normalizedTheme.success,",
      "      '--shop-red': normalizedTheme.danger,",
      "    };",
      "    Object.entries(pairs).forEach(([name, value]) => {",
      "      rootStyle.setProperty(name, value);",
      "    });",
      "  };",
      "  window.MOMNT_ADMIN_STORAGE_KEY = STORAGE_KEY;",
      "  window.MOMNT_DEFAULT_CATALOG = clone(defaultCatalog);",
      "  try {",
      "    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null');",
      "    if (saved && Array.isArray(saved.products) && saved.categoryMeta) {",
      "      window.MOMNT_PRODUCTS = saved.products;",
      "      window.MOMNT_CATEGORY_META = saved.categoryMeta;",
      "      window.MOMNT_SITE_CONTENT = saved.siteContent || window.MOMNT_SITE_CONTENT;",
      "    }",
      "  } catch {}",
      "  window.MOMNT_SITE_CONTENT.theme = normalizeTheme(window.MOMNT_SITE_CONTENT.theme);",
      "  applyTheme(window.MOMNT_SITE_CONTENT.theme);",
      "})();",
      "",
    ].join("\n");
  };

  const renderExport = (mode = state.exportMode) => {
    state.exportMode = mode;

    if (!elements.exportOutput) {
      return;
    }

    if (mode === "js") {
      elements.exportOutput.value = buildCatalogDataJs();
      return;
    }

    elements.exportOutput.value = JSON.stringify(getExportPayload(), null, 2);
  };

  const setActiveTab = (tabName) => {
    elements.tabs.forEach((tab) => {
      tab.classList.toggle("is-active", tab.getAttribute("data-tab") === tabName);
    });

    elements.panels.forEach((panel) => {
      panel.hidden = panel.getAttribute("data-panel") !== tabName;
    });

    if (tabName === "export") {
      renderExport();
    }
  };

  const getCropContext = () => {
    const canvas = elements.cropCanvas;

    if (!(canvas instanceof HTMLCanvasElement)) {
      return null;
    }

    return canvas.getContext("2d");
  };

  const getCropCanvas = () =>
    elements.cropCanvas instanceof HTMLCanvasElement
      ? elements.cropCanvas
      : null;

  const waitForPaint = () =>
    new Promise((resolve) => {
      window.requestAnimationFrame(() => window.requestAnimationFrame(resolve));
    });

  const setImageEditorStatus = (type = "", message = "", progress = 0) => {
    if (!elements.imageEditorStatus) {
      return;
    }

    elements.imageEditorStatus.hidden = !type;
    elements.imageEditorStatus.classList.toggle("is-error", type === "error");

    if (elements.imageEditorStatusText) {
      elements.imageEditorStatusText.textContent = message;
    }

    if (elements.imageEditorProgressBar instanceof HTMLElement) {
      elements.imageEditorProgressBar.hidden = type !== "loading";
      elements.imageEditorProgressBar.classList.toggle(
        "is-indeterminate",
        progress === null,
      );
    }

    if (elements.imageEditorProgress instanceof HTMLElement) {
      const nextProgress =
        typeof progress === "number" ? Math.max(0, Math.min(100, progress)) : 0;
      elements.imageEditorProgress.style.width = `${nextProgress}%`;
    }
  };

  const showImageEditorError = (message) => {
    setImageEditorStatus("error", message);
    showToast(message);
  };

  const setEditorMode = (mode) => {
    state.imageEditor.mode = mode;

    if (elements.imageChoice) {
      elements.imageChoice.hidden = mode !== "choice";
    }

    if (elements.cropStage) {
      elements.cropStage.hidden = mode !== "crop";
    }

    if (elements.cropControls) {
      elements.cropControls.hidden = mode !== "crop";
    }

    if (elements.cropActions) {
      elements.cropActions.hidden = mode !== "crop";
    }
  };

  const clampCrop = () => {
    const canvas = getCropCanvas();
    const editor = state.imageEditor;

    if (!canvas || !editor.image) {
      return;
    }

    const imageWidth = editor.image.naturalWidth * editor.scale;
    const imageHeight = editor.image.naturalHeight * editor.scale;
    const minX = canvas.width - imageWidth;
    const minY = canvas.height - imageHeight;

    editor.offsetX = Math.min(0, Math.max(minX, editor.offsetX));
    editor.offsetY = Math.min(0, Math.max(minY, editor.offsetY));
  };

  const applySmartSnap = () => {
    const canvas = getCropCanvas();
    const editor = state.imageEditor;
    const snapInput = elements.cropSnap;

    if (
      !canvas ||
      !editor.image ||
      !(snapInput instanceof HTMLInputElement) ||
      !snapInput.checked
    ) {
      return;
    }

    const imageWidth = editor.image.naturalWidth * editor.scale;
    const imageHeight = editor.image.naturalHeight * editor.scale;
    const imageCenterX = editor.offsetX + imageWidth / 2;
    const imageCenterY = editor.offsetY + imageHeight / 2;
    const snapPointsX = [canvas.width / 3, canvas.width / 2, (canvas.width * 2) / 3];
    const snapPointsY = [
      canvas.height / 3,
      canvas.height / 2,
      (canvas.height * 2) / 3,
    ];
    const threshold = 18;

    snapPointsX.some((point) => {
      const distance = point - imageCenterX;

      if (Math.abs(distance) > threshold) {
        return false;
      }

      editor.offsetX += distance;
      return true;
    });

    snapPointsY.some((point) => {
      const distance = point - imageCenterY;

      if (Math.abs(distance) > threshold) {
        return false;
      }

      editor.offsetY += distance;
      return true;
    });
  };

  const renderCrop = () => {
    const canvas = getCropCanvas();
    const context = getCropContext();
    const editor = state.imageEditor;

    if (!canvas || !context || !editor.image) {
      return;
    }

    applySmartSnap();
    clampCrop();
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#171512";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(
      editor.image,
      editor.offsetX,
      editor.offsetY,
      editor.image.naturalWidth * editor.scale,
      editor.image.naturalHeight * editor.scale,
    );
  };

  const centerCropImage = () => {
    const canvas = getCropCanvas();
    const editor = state.imageEditor;

    if (!canvas || !editor.image) {
      return;
    }

    const fitScale = Math.max(
      canvas.width / editor.image.naturalWidth,
      canvas.height / editor.image.naturalHeight,
    );

    editor.minScale = fitScale;
    editor.scale = Math.max(editor.scale, fitScale);
    editor.offsetX = (canvas.width - editor.image.naturalWidth * editor.scale) / 2;
    editor.offsetY =
      (canvas.height - editor.image.naturalHeight * editor.scale) / 2;

    if (elements.cropZoom instanceof HTMLInputElement) {
      elements.cropZoom.min = String(fitScale);
      elements.cropZoom.max = String(fitScale * 3);
      elements.cropZoom.value = String(editor.scale);
    }

    renderCrop();
  };

  const getOriginalExportLimit = (target) => {
    if (target === "home") {
      return 1920;
    }

    if (target === "product") {
      return 1800;
    }

    return 1600;
  };

  const canvasToOptimizedDataUrl = (canvas) => {
    const webpDataUrl = canvas.toDataURL("image/webp", 0.82);

    if (webpDataUrl.startsWith("data:image/webp")) {
      return webpDataUrl;
    }

    return canvas.toDataURL("image/jpeg", 0.82);
  };

  const getSourceSize = (image) => ({
    width: image.naturalWidth || image.width,
    height: image.naturalHeight || image.height,
  });

  const isHeicFile = (file) =>
    /image\/hei[cf]/i.test(file.type) || /\.(hei[cf])$/i.test(file.name);

  const isImageFile = (file) =>
    file.type.startsWith("image/") ||
    /\.(avif|gif|hei[cf]|jpe?g|png|webp)$/i.test(file.name);

  let heicConverterPromise = null;

  const loadHeicConverter = () => {
    if (typeof window.heic2any === "function") {
      return Promise.resolve(window.heic2any);
    }

    if (heicConverterPromise) {
      return heicConverterPromise;
    }

    heicConverterPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.async = true;
      script.src = HEIC_CONVERTER_SRC;

      script.addEventListener(
        "load",
        () => {
          if (typeof window.heic2any === "function") {
            resolve(window.heic2any);
            return;
          }

          reject(new Error("HEIC converter unavailable."));
        },
        { once: true },
      );

      script.addEventListener(
        "error",
        () => reject(new Error("HEIC converter failed to load.")),
        { once: true },
      );

      document.head.append(script);
    });

    return heicConverterPromise;
  };

  const convertHeicFile = async (file) => {
    const heic2any = await loadHeicConverter();
    const output = await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: 0.86,
    });
    const blob = Array.isArray(output) ? output[0] : output;

    if (!(blob instanceof Blob)) {
      throw new Error("HEIC conversion failed.");
    }

    return new File(
      [blob],
      file.name.replace(/\.(hei[cf])$/i, ".jpg") || "imagem-convertida.jpg",
      { type: "image/jpeg" },
    );
  };

  const loadImageElement = (src) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.decoding = "async";

      image.addEventListener("load", () => resolve(image), { once: true });
      image.addEventListener(
        "error",
        () => reject(new Error("Image load failed.")),
        { once: true },
      );

      image.src = src;
    });

  const readFileAsDataImageElement = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.addEventListener("error", () => {
        reject(new Error("File read failed."));
      });

      reader.addEventListener("abort", () => {
        reject(new Error("File read aborted."));
      });

      reader.addEventListener("load", async () => {
        try {
          const dataUrl = String(reader.result ?? "");

          if (!dataUrl) {
            reject(new Error("Empty image data."));
            return;
          }

          resolve(await loadImageElement(dataUrl));
        } catch (error) {
          reject(error);
        }
      });

      reader.readAsDataURL(file);
    });

  const readFileAsImageElement = (file) =>
    new Promise((resolve, reject) => {
      if (!window.URL || typeof window.URL.createObjectURL !== "function") {
        readFileAsDataImageElement(file).then(resolve).catch(reject);
        return;
      }

      const objectUrl = window.URL.createObjectURL(file);

      loadImageElement(objectUrl)
        .then(resolve)
        .catch(() => readFileAsDataImageElement(file).then(resolve).catch(reject))
        .finally(() => window.URL.revokeObjectURL(objectUrl));
    });

  const readImageSize = async (file) => {
    const buffer = await file.slice(0, 524288).arrayBuffer();
    const view = new DataView(buffer);

    if (
      view.byteLength >= 24 &&
      view.getUint32(0) === 0x89504e47 &&
      view.getUint32(4) === 0x0d0a1a0a
    ) {
      return {
        width: view.getUint32(16),
        height: view.getUint32(20),
      };
    }

    if (
      view.byteLength >= 12 &&
      view.getUint32(0, true) === 0x46464952 &&
      view.getUint32(8, true) === 0x50424557
    ) {
      let offset = 12;

      while (offset + 8 <= view.byteLength) {
        const chunk = view.getUint32(offset, true);
        const size = view.getUint32(offset + 4, true);

        if (chunk === 0x58385056 && offset + 30 <= view.byteLength) {
          return {
            width:
              1 +
              view.getUint8(offset + 12) +
              (view.getUint8(offset + 13) << 8) +
              (view.getUint8(offset + 14) << 16),
            height:
              1 +
              view.getUint8(offset + 15) +
              (view.getUint8(offset + 16) << 8) +
              (view.getUint8(offset + 17) << 16),
          };
        }

        if (chunk === 0x20385056 && offset + 30 <= view.byteLength) {
          return {
            width: view.getUint16(offset + 26, true) & 0x3fff,
            height: view.getUint16(offset + 28, true) & 0x3fff,
          };
        }

        offset += 8 + size + (size % 2);
      }
    }

    if (view.byteLength >= 4 && view.getUint16(0) === 0xffd8) {
      let offset = 2;

      while (offset + 9 < view.byteLength) {
        if (view.getUint8(offset) !== 0xff) {
          offset += 1;
          continue;
        }

        const marker = view.getUint8(offset + 1);
        const size = view.getUint16(offset + 2);

        if (
          marker >= 0xc0 &&
          marker <= 0xcf &&
          ![0xc4, 0xc8, 0xcc].includes(marker)
        ) {
          return {
            width: view.getUint16(offset + 7),
            height: view.getUint16(offset + 5),
          };
        }

        if (!size) {
          break;
        }

        offset += 2 + size;
      }
    }

    return null;
  };

  const getResizeOptions = async (file, target) => {
    const size = await readImageSize(file).catch(() => null);

    if (!size || !size.width || !size.height) {
      return {};
    }

    const maxEdge = getOriginalExportLimit(target);
    const longestEdge = Math.max(size.width, size.height);

    if (longestEdge <= maxEdge) {
      return {};
    }

    const scale = maxEdge / longestEdge;

    return {
      resizeWidth: Math.max(1, Math.round(size.width * scale)),
      resizeHeight: Math.max(1, Math.round(size.height * scale)),
      resizeQuality: "high",
    };
  };

  const withTimeout = (promise, timeoutMs, message) =>
    new Promise((resolve, reject) => {
      const timeout = window.setTimeout(() => {
        reject(new Error(message));
      }, timeoutMs);

      promise
        .then(resolve)
        .catch(reject)
        .finally(() => window.clearTimeout(timeout));
    });

  const decodeImageFile = async (file, target) => {
    if ("createImageBitmap" in window) {
      const resizeOptions = await getResizeOptions(file, target);

      try {
        return await window.createImageBitmap(file, {
          imageOrientation: "from-image",
          ...resizeOptions,
        });
      } catch (error) {
        try {
          return await window.createImageBitmap(file, resizeOptions);
        } catch (resizeError) {}
      }

      try {
        return await window.createImageBitmap(file);
      } catch (error) {
        // Falls back to the FileReader path below.
      }
    }

    return readFileAsImageElement(file);
  };

  const exportOriginalImage = (image, target) => {
    const maxEdge = getOriginalExportLimit(target);
    const { width: sourceWidth, height: sourceHeight } = getSourceSize(image);
    const longestEdge = Math.max(sourceWidth, sourceHeight);
    const scale = longestEdge > maxEdge ? maxEdge / longestEdge : 1;
    const width = Math.max(1, Math.round(sourceWidth * scale));
    const height = Math.max(1, Math.round(sourceHeight * scale));
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Canvas indisponível.");
    }

    canvas.width = width;
    canvas.height = height;
    context.drawImage(image, 0, 0, width, height);
    return canvasToOptimizedDataUrl(canvas);
  };

  const openImageEditor = async (file, target) => {
    if (!file || !elements.imageEditor) {
      return;
    }

    if (!isImageFile(file)) {
      showImageEditorError("Selecione um arquivo de imagem.");
      return;
    }

    const shouldConvertHeic = isHeicFile(file);
    const preset = getCropPreset(target);

    state.imageEditor = {
      ...state.imageEditor,
      fileTarget: String(target ?? ""),
      image: null,
      imageDataUrl: "",
      mode: "loading",
      scale: 1,
      minScale: 1,
      offsetX: 0,
      offsetY: 0,
      dragging: false,
    };

    if (elements.imageEditorTitle) {
      elements.imageEditorTitle.textContent = `Imagem | ${preset.label}`;
    }

    if (elements.imageChoicePreview instanceof HTMLImageElement) {
      elements.imageChoicePreview.removeAttribute("src");
    }

    elements.imageEditor.hidden = false;
    setEditorMode("loading");
    setImageEditorStatus("loading", "Carregando imagem...", 0);
    await waitForPaint();

    let decodedImage = null;

    try {
      let imageFile = file;

      if (shouldConvertHeic) {
        setImageEditorStatus("loading", "Convertendo HEIC...", null);
        imageFile = await withTimeout(
          convertHeicFile(file),
          60000,
          "HEIC conversion timeout.",
        );
      }

      setImageEditorStatus("loading", "Preparando imagem...", null);
      decodedImage = await withTimeout(
        decodeImageFile(imageFile, target),
        30000,
        "Image processing timeout.",
      );
      setImageEditorStatus("loading", "Otimizando imagem...", null);
      await waitForPaint();

      const dataUrl = exportOriginalImage(decodedImage, target);
      const image = await loadImageElement(dataUrl);
      const canvas = getCropCanvas();

      if (canvas) {
        canvas.width = preset.width;
        canvas.height = preset.height;
        canvas.style.setProperty("--crop-aspect-ratio", preset.aspectRatio);
      }

      state.imageEditor = {
        ...state.imageEditor,
        image,
        imageDataUrl: dataUrl,
        mode: "choice",
        scale: 1,
        minScale: 1,
        offsetX: 0,
        offsetY: 0,
        dragging: false,
      };

      if (elements.imageChoicePreview instanceof HTMLImageElement) {
        elements.imageChoicePreview.src = dataUrl;
      }

      setImageEditorStatus();
      setEditorMode("choice");
    } catch (error) {
      setEditorMode("loading");
      showImageEditorError(
        shouldConvertHeic
          ? "Não foi possível converter este HEIC. Tente exportar como JPG ou PNG."
          : "Não foi possível abrir esta imagem.",
      );
    } finally {
      if (decodedImage && typeof decodedImage.close === "function") {
        decodedImage.close();
      }
    }
  };

  const closeImageEditor = () => {
    state.imageEditor.image = null;
    state.imageEditor.imageDataUrl = "";
    state.imageEditor.mode = "choice";
    setImageEditorStatus();

    if (elements.imageEditor) {
      elements.imageEditor.hidden = true;
    }

    if (elements.imageChoicePreview instanceof HTMLImageElement) {
      elements.imageChoicePreview.removeAttribute("src");
    }
  };

  const applyEditedImage = async () => {
    const canvas = getCropCanvas();
    const target = state.imageEditor.fileTarget;

    if (!canvas) {
      return;
    }

    setEditorMode("loading");
    setImageEditorStatus("loading", "Convertendo imagem...", null);
    await waitForPaint();

    try {
      const dataUrl = canvasToOptimizedDataUrl(canvas);

      await writeImageToTarget(dataUrl, target);
      closeImageEditor();
    } catch (error) {
      setEditorMode("crop");
      showImageEditorError("Não foi possível converter a imagem.");
    }
  };

  const useOriginalImage = async () => {
    if (!state.imageEditor.image) {
      return;
    }

    setEditorMode("loading");
    setImageEditorStatus("loading", "Convertendo imagem...", null);
    await waitForPaint();

    try {
      const dataUrl = exportOriginalImage(
        state.imageEditor.image,
        state.imageEditor.fileTarget,
      );

      await writeImageToTarget(dataUrl, state.imageEditor.fileTarget);
      closeImageEditor();
    } catch (error) {
      setEditorMode("choice");
      showImageEditorError("Não foi possível converter a imagem.");
    }
  };

  const openCropEditor = () => {
    if (!state.imageEditor.image) {
      return;
    }

    setEditorMode("crop");
    centerCropImage();
  };

  const createProduct = () => {
    if (!getCategory()) {
      showToast("Selecione uma categoria.");
      return;
    }

    const baseSlug = normalizeSlug("novo-produto");
    let nextSlug = baseSlug;
    let count = 2;

    while (state.catalog.products.some((product) => product.slug === nextSlug)) {
      nextSlug = `${baseSlug}-${count}`;
      count += 1;
    }

    const categoryKey = state.activeCategoryKey;
    const category = state.catalog.categoryMeta[categoryKey];

    state.catalog.products.push({
      slug: nextSlug,
      name: "Novo produto",
      category: categoryKey,
      categoryLabel: category?.label ?? categoryKey,
      price: "Sob consulta",
      badge: "Última unidade",
      badgeTone: "soft",
      shortDescription: "Descrição curta do produto.",
      description: "Descrição completa do produto.",
      materials: "A definir",
      availability: "Em preparação",
      dimensions: "A definir",
      stockQuantity: 1,
      highlights: ["1 unidade disponível", "Em preparação"],
      images: ["assets/images/product-placeholder-modern.svg"],
      whatsappText: "Oi, quero saber mais detalhes do Novo produto da MOMNT.",
    });

    state.activeProductSlug = nextSlug;
    state.productFormDirty = false;
    elements.productDrawer?.classList.add("is-open");
    elements.productDrawer?.setAttribute("aria-hidden", "false");
    setDirty();
    renderProducts();
  };

  const duplicateProduct = () => {
    const product = getProduct();

    if (!product) {
      return;
    }

    const copy = clone(product);
    let nextSlug = `${copy.slug}-cópia`;
    let count = 2;

    while (state.catalog.products.some((item) => item.slug === nextSlug)) {
      nextSlug = `${copy.slug}-cópia-${count}`;
      count += 1;
    }

    copy.slug = nextSlug;
    copy.name = `${copy.name} cópia`;
    copy.badgeTone = inferBadgeTone(copy);
    copy.whatsappText = buildWhatsappText(copy);
    copy.highlights = buildProductHighlights(copy);
    state.catalog.products.push(copy);
    state.activeProductSlug = nextSlug;
    state.productFormDirty = false;
    elements.productDrawer?.classList.add("is-open");
    elements.productDrawer?.setAttribute("aria-hidden", "false");
    setDirty();
    renderProducts();
  };

  const removeProduct = () => {
    const product = getProduct();

    if (!product || !window.confirm(`Remover ${product.name}?`)) {
      return;
    }

    state.catalog.products = state.catalog.products.filter(
      (item) => item.slug !== product.slug,
    );
    closeProductEditor({ force: true });
    setDirty();
    renderProducts();
  };

  const createCategory = () => {
    let nextKey = "nova-categoria";
    let count = 2;

    while (state.catalog.categoryMeta[nextKey]) {
      nextKey = `nova-categoria-${count}`;
      count += 1;
    }

    state.catalog.categoryMeta[nextKey] = {
      label: "Nova categoria",
      eyebrow: "Coleção MOMNT",
      title: "Título da categoria",
      description: "Descrição da categoria.",
      heroImage: "assets/images/collection-placeholder-modern.svg",
      highlightInNav: false,
    };
    closeProductEditor({ force: true });
    state.activeCategoryKey = nextKey;
    setDirty();
    renderCategories();
    renderProducts();
  };

  const removeCategory = () => {
    const category = getCategory();

    if (
      !category ||
      getCategoryKeys().length <= 1 ||
      !window.confirm(`Remover a categoria ${category.label}?`)
    ) {
      if (category && getCategoryKeys().length <= 1) {
        showToast("Mantenha ao menos uma categoria.");
      }
      return;
    }

    const fallbackKey =
      getCategoryKeys().find((key) => key !== state.activeCategoryKey) ?? "";

    delete state.catalog.categoryMeta[state.activeCategoryKey];
    state.catalog.products = state.catalog.products.map((product) =>
      product.category === state.activeCategoryKey
        ? { ...product, category: fallbackKey }
        : product,
    );
    closeProductEditor({ force: true });
    state.activeCategoryKey = fallbackKey;
    setDirty();
    renderCategories();
    renderProducts();
  };

  const importJson = () => {
    if (!elements.exportOutput) {
      return;
    }

    try {
      state.catalog = sanitizeCatalog(JSON.parse(elements.exportOutput.value));
      state.activeProductSlug = "";
      state.activeCategoryKey = "";
      state.productFormDirty = false;
      elements.productDrawer?.classList.remove("is-open");
      elements.productDrawer?.setAttribute("aria-hidden", "true");
      setDirty();
      renderAll();
      showToast("JSON importado. Salve para aplicar.");
    } catch {
      showToast("JSON inválido.");
    }
  };

  const downloadExport = () => {
    renderExport(state.exportMode);

    if (!elements.exportOutput) {
      return;
    }

    const filename =
      state.exportMode === "js" ? "catalog-data.js" : "momnt-catalog.json";
    const blob = new Blob([elements.exportOutput.value], {
      type: state.exportMode === "js" ? "text/javascript" : "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const resetCatalog = () => {
    if (!window.confirm("Restaurar o catálogo original e apagar edições salvas?")) {
      return;
    }

    window.localStorage.removeItem(storageKey);
    state.catalog = sanitizeCatalog(clone(defaultCatalog));
    state.activeProductSlug = "";
    state.activeCategoryKey = "";
    state.productFormDirty = false;
    elements.productDrawer?.classList.remove("is-open");
    elements.productDrawer?.setAttribute("aria-hidden", "true");
    setDirty(false);
    renderAll();
    showToast("Catálogo original restaurado.");
  };

  const unlock = () => {
    if (elements.lock) {
      elements.lock.hidden = true;
    }

    if (elements.app) {
      elements.app.hidden = false;
    }

    renderAll();
  };

  const renderAll = () => {
    state.catalog.siteContent.theme = getTheme();
    applyTheme(state.catalog.siteContent.theme);
    syncCategoryLabels();
    renderProducts();
    renderCategories();
    fillHomeForm();
    fillThemeForm();
    renderExport();
  };

  elements.loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(elements.loginForm);
    const accessCode = String(formData.get("accessCode") ?? "").trim();
    let isValid = false;

    if (accessCode) {
      try {
        await apiRequest("/api/admin/verify", { method: "POST" }, accessCode);
        isValid = true;
      } catch {
        isValid = accessCode === ACCESS_CODE;
      }
    }

    if (!isValid) {
      if (elements.loginFeedback) {
        elements.loginFeedback.hidden = false;
        elements.loginFeedback.textContent = "Código incorreto.";
      }
      return;
    }

    window.localStorage.setItem(SESSION_KEY, "ok");
    window.localStorage.setItem(ACCESS_CODE_KEY, accessCode);
    unlock();
  });

  elements.tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      setActiveTab(tab.getAttribute("data-tab") ?? "products");
    });
  });

  elements.save?.addEventListener("click", saveCatalog);
  elements.exportTop?.addEventListener("click", () => setActiveTab("export"));
  elements.productNew?.addEventListener("click", createProduct);
  elements.productDuplicate?.addEventListener("click", duplicateProduct);
  elements.productRemove?.addEventListener("click", removeProduct);
  elements.productSave?.addEventListener("click", saveCatalog);
  elements.productPreview?.addEventListener("click", (event) => {
    const actionButton = event.target?.closest?.("[data-image-action]");

    if (!(actionButton instanceof HTMLButtonElement)) {
      return;
    }

    const card = actionButton.closest("[data-image-index]");
    const action = actionButton.getAttribute("data-image-action");
    const index = Number.parseInt(card?.getAttribute("data-image-index") ?? "", 10);
    const images = getProductFormImages();

    if (!Number.isFinite(index) || !images[index]) {
      return;
    }

    if (action === "remove") {
      images.splice(index, 1);
    }

    setProductFormImages(images);
  });
  elements.productPreview?.addEventListener("dragstart", (event) => {
    const card = event.target?.closest?.("[data-image-index]");

    if (!(card instanceof HTMLElement)) {
      return;
    }

    card.classList.add("is-dragging");
    event.dataTransfer?.setData(
      "text/plain",
      card.getAttribute("data-image-index") ?? "",
    );
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
    }
  });
  elements.productPreview?.addEventListener("dragend", () => {
    elements.productPreview
      ?.querySelectorAll(".product-image-card")
      .forEach((card) => card.classList.remove("is-dragging", "is-drop-target"));
  });
  elements.productPreview?.addEventListener("dragover", (event) => {
    const card = event.target?.closest?.("[data-image-index]");

    if (!(card instanceof HTMLElement)) {
      return;
    }

    event.preventDefault();
    elements.productPreview
      ?.querySelectorAll(".product-image-card")
      .forEach((item) => item.classList.toggle("is-drop-target", item === card));
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "move";
    }
  });
  elements.productPreview?.addEventListener("drop", (event) => {
    const targetCard = event.target?.closest?.("[data-image-index]");

    if (!(targetCard instanceof HTMLElement)) {
      return;
    }

    event.preventDefault();

    const fromIndex = Number.parseInt(
      event.dataTransfer?.getData("text/plain") ?? "",
      10,
    );
    const toIndex = Number.parseInt(
      targetCard.getAttribute("data-image-index") ?? "",
      10,
    );
    const images = getProductFormImages();

    if (
      !Number.isFinite(fromIndex) ||
      !Number.isFinite(toIndex) ||
      fromIndex === toIndex ||
      !images[fromIndex] ||
      !images[toIndex]
    ) {
      return;
    }

    const [image] = images.splice(fromIndex, 1);
    images.splice(toIndex, 0, image);
    setProductFormImages(images);
  });
  elements.homePreview?.addEventListener("click", (event) => {
    const actionButton = event.target?.closest?.("[data-home-image-action]");

    if (!(actionButton instanceof HTMLButtonElement)) {
      return;
    }

    const card = actionButton.closest("[data-home-image-index]");
    const action = actionButton.getAttribute("data-home-image-action");
    const index = Number.parseInt(
      card?.getAttribute("data-home-image-index") ?? "",
      10,
    );
    const images = getHomeFormHeroImages();

    if (!Number.isFinite(index) || !images[index]) {
      return;
    }

    if (action === "remove") {
      images.splice(index, 1);
      setHomeFormHeroImages(images);
    }
  });
  elements.homePreview?.addEventListener("dragstart", (event) => {
    const card = event.target?.closest?.("[data-home-image-index]");

    if (!(card instanceof HTMLElement)) {
      return;
    }

    card.classList.add("is-dragging");
    event.dataTransfer?.setData(
      "text/plain",
      card.getAttribute("data-home-image-index") ?? "",
    );
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
    }
  });
  elements.homePreview?.addEventListener("dragend", () => {
    elements.homePreview
      ?.querySelectorAll(".product-image-card")
      .forEach((card) => card.classList.remove("is-dragging", "is-drop-target"));
  });
  elements.homePreview?.addEventListener("dragover", (event) => {
    const card = event.target?.closest?.("[data-home-image-index]");

    if (!(card instanceof HTMLElement)) {
      return;
    }

    event.preventDefault();
    elements.homePreview
      ?.querySelectorAll(".product-image-card")
      .forEach((item) => item.classList.toggle("is-drop-target", item === card));
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "move";
    }
  });
  elements.homePreview?.addEventListener("drop", (event) => {
    const targetCard = event.target?.closest?.("[data-home-image-index]");

    if (!(targetCard instanceof HTMLElement)) {
      return;
    }

    event.preventDefault();

    const fromIndex = Number.parseInt(
      event.dataTransfer?.getData("text/plain") ?? "",
      10,
    );
    const toIndex = Number.parseInt(
      targetCard.getAttribute("data-home-image-index") ?? "",
      10,
    );
    const images = getHomeFormHeroImages();

    if (
      !Number.isFinite(fromIndex) ||
      !Number.isFinite(toIndex) ||
      fromIndex === toIndex ||
      !images[fromIndex] ||
      !images[toIndex]
    ) {
      return;
    }

    const [image] = images.splice(fromIndex, 1);
    images.splice(toIndex, 0, image);
    setHomeFormHeroImages(images);
  });
  elements.featuredProductsSelect?.addEventListener("change", (event) => {
    if (!(event.target instanceof HTMLInputElement)) {
      return;
    }

    if (event.target.dataset.multiSelect !== "products") {
      return;
    }

    updateHomeSelection("featuredProductSlugs", elements.featuredProductsSelect);
  });
  elements.featuredCategoriesSelect?.addEventListener("change", (event) => {
    if (!(event.target instanceof HTMLInputElement)) {
      return;
    }

    if (event.target.dataset.multiSelect !== "categories") {
      return;
    }

    updateHomeSelection(
      "featuredCategoryKeys",
      elements.featuredCategoriesSelect,
    );
  });
  elements.productClose?.addEventListener("click", () => {
    closeProductEditor();
  });
  elements.productCloseSecondary?.addEventListener("click", () => {
    closeProductEditor();
  });
  elements.categoryNew?.addEventListener("click", createCategory);
  elements.categoryRemove?.addEventListener("click", removeCategory);
  elements.exportJson?.addEventListener("click", () => renderExport("json"));
  elements.exportJs?.addEventListener("click", () => renderExport("js"));
  elements.downloadExport?.addEventListener("click", downloadExport);
  elements.importJson?.addEventListener("click", importJson);
  elements.resetCatalog?.addEventListener("click", resetCatalog);

  elements.copyExport?.addEventListener("click", async () => {
    renderExport(state.exportMode);

    try {
      await navigator.clipboard.writeText(elements.exportOutput?.value ?? "");
      showToast("Exportação copiada.");
    } catch {
      showToast("Não foi possível copiar automaticamente.");
    }
  });

  elements.productForm?.addEventListener("input", readProductForm);
  elements.productForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    saveCatalog();
  });
  elements.categoryForm?.addEventListener("input", readCategoryForm);
  elements.homeForm?.addEventListener("input", readHomeForm);
  elements.themeFields?.addEventListener("input", readThemeForm);

  elements.imageEditorClose?.addEventListener("click", closeImageEditor);
  elements.imageUseOriginal?.addEventListener("click", useOriginalImage);
  elements.imageOpenCrop?.addEventListener("click", openCropEditor);
  elements.cropApply?.addEventListener("click", applyEditedImage);
  elements.cropReset?.addEventListener("click", centerCropImage);

  elements.cropZoom?.addEventListener("input", () => {
    const zoomInput = elements.cropZoom;
    const canvas = getCropCanvas();
    const editor = state.imageEditor;

    if (
      !(zoomInput instanceof HTMLInputElement) ||
      !canvas ||
      !editor.image
    ) {
      return;
    }

    const previousScale = editor.scale;
    const nextScale = Number.parseFloat(zoomInput.value);
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    editor.scale = Number.isFinite(nextScale)
      ? Math.max(editor.minScale, nextScale)
      : editor.scale;
    editor.offsetX = centerX - ((centerX - editor.offsetX) / previousScale) * editor.scale;
    editor.offsetY = centerY - ((centerY - editor.offsetY) / previousScale) * editor.scale;
    renderCrop();
  });

  elements.cropSnap?.addEventListener("change", renderCrop);

  elements.cropStage?.addEventListener("pointerdown", (event) => {
    const editor = state.imageEditor;

    if (!editor.image) {
      return;
    }

    editor.dragging = true;
    editor.dragX = event.clientX;
    editor.dragY = event.clientY;
    editor.startOffsetX = editor.offsetX;
    editor.startOffsetY = editor.offsetY;
    elements.cropStage?.classList.add("is-dragging");
    elements.cropStage?.setPointerCapture(event.pointerId);
  });

  elements.cropStage?.addEventListener("pointermove", (event) => {
    const editor = state.imageEditor;

    if (!editor.dragging) {
      return;
    }

    const canvas = getCropCanvas();
    const stage = elements.cropStage;

    if (!canvas || !(stage instanceof HTMLElement)) {
      return;
    }

    const rect = stage.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    editor.offsetX = editor.startOffsetX + (event.clientX - editor.dragX) * scaleX;
    editor.offsetY = editor.startOffsetY + (event.clientY - editor.dragY) * scaleY;
    renderCrop();
  });

  const stopCropDrag = (event) => {
    const editor = state.imageEditor;

    if (!editor.dragging) {
      return;
    }

    editor.dragging = false;
    elements.cropStage?.classList.remove("is-dragging");
    elements.cropStage?.releasePointerCapture(event.pointerId);
    renderCrop();
  };

  elements.cropStage?.addEventListener("pointerup", stopCropDrag);
  elements.cropStage?.addEventListener("pointercancel", stopCropDrag);

  document.addEventListener("click", (event) => {
    const target = event.target;

    if (
      !(target instanceof Node) ||
      !elements.productDrawer?.classList.contains("is-open")
    ) {
      return;
    }

    if (
      elements.productDrawer.contains(target) ||
      elements.productList?.contains(target) ||
      elements.productNew?.contains(target) ||
      elements.productDuplicate?.contains(target) ||
      elements.productRemove?.contains(target)
    ) {
      return;
    }

    closeProductEditor();
  });

  document.querySelectorAll("[data-image-picker]").forEach((input) => {
    input.addEventListener("change", () => {
      if (!(input instanceof HTMLInputElement)) {
        return;
      }

      openImageEditor(input.files?.[0], input.dataset.imagePicker);
      input.value = "";
    });
  });

  window.addEventListener("beforeunload", (event) => {
    if (!state.dirty) {
      return;
    }

    event.preventDefault();
    event.returnValue = "";
  });

  const hasSession = window.localStorage.getItem(SESSION_KEY) === "ok";
  const hasStoredAccessCode = Boolean(window.localStorage.getItem(ACCESS_CODE_KEY));

  if (hasSession && (hasStoredAccessCode || canUseLocalFallback)) {
    unlock();
  } else if (hasSession) {
    window.localStorage.removeItem(SESSION_KEY);
  }
  };

  if (window.MOMNT_CATALOG_READY) {
    window.MOMNT_CATALOG_READY.finally(start);
  } else {
    start();
  }
})();
