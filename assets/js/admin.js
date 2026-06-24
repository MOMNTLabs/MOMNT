(function () {
  const ACCESS_CODE = "momnt-admin";
  const SESSION_KEY = "momnt-admin-session-v1";
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
    status: document.querySelector("#admin-status"),
    toast: document.querySelector("#admin-toast"),
    tabs: document.querySelectorAll("[data-tab]"),
    panels: document.querySelectorAll("[data-panel]"),
    save: document.querySelector("#admin-save"),
    exportTop: document.querySelector("#admin-export-top"),
    productList: document.querySelector("#product-list"),
    productForm: document.querySelector("#product-form"),
    productNew: document.querySelector("#product-new"),
    productDuplicate: document.querySelector("#product-duplicate"),
    productRemove: document.querySelector("#product-remove"),
    productPreview: document.querySelector("#product-preview"),
    categoryList: document.querySelector("#category-list"),
    categoryForm: document.querySelector("#category-form"),
    categoryNew: document.querySelector("#category-new"),
    categoryRemove: document.querySelector("#category-remove"),
    categoryPreview: document.querySelector("#category-preview"),
    homeForm: document.querySelector("#home-form"),
    homePreview: document.querySelector("#home-preview"),
    exportOutput: document.querySelector("#export-output"),
    exportJson: document.querySelector("#export-json"),
    exportJs: document.querySelector("#export-js"),
    downloadExport: document.querySelector("#download-export"),
    copyExport: document.querySelector("#copy-export"),
    importJson: document.querySelector("#import-json"),
    resetCatalog: document.querySelector("#reset-catalog"),
  };

  const clone = (value) => JSON.parse(JSON.stringify(value));

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
    activeProductSlug: window.MOMNT_PRODUCTS?.[0]?.slug ?? "",
    activeCategoryKey: "all",
    dirty: false,
    exportMode: "json",
  };

  const escapeHtml = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

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

  const setDirty = (dirty = true) => {
    state.dirty = dirty;

    if (elements.status) {
      elements.status.textContent = dirty
        ? "Alteracoes nao salvas"
        : "Alteracoes salvas";
    }
  };

  const getCategoryKeys = () =>
    Object.keys(state.catalog.categoryMeta).filter(Boolean);

  const getProduct = () =>
    state.catalog.products.find(
      (product) => product.slug === state.activeProductSlug,
    ) ?? null;

  const getCategory = () =>
    state.catalog.categoryMeta[state.activeCategoryKey] ?? null;

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
          String(product.availability ?? "").trim() || "Em preparacao",
        dimensions: String(product.dimensions ?? "").trim(),
        highlights: Array.isArray(product.highlights)
          ? product.highlights.map(String).filter(Boolean)
          : [],
        images:
          Array.isArray(product.images) && product.images.length
            ? product.images.map(String).filter(Boolean)
            : ["assets/images/product-placeholder-modern.svg"],
        whatsappText: String(product.whatsappText ?? "").trim(),
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
        return `O slug "${product.slug}" esta duplicado.`;
      }

      usedSlugs.add(product.slug);

      if (!state.catalog.categoryMeta[product.category]) {
        return `O produto "${product.name}" usa uma categoria que nao existe.`;
      }
    }

    if (!state.catalog.categoryMeta.all) {
      return "A categoria base Todos nao pode ser removida.";
    }

    return "";
  };

  const saveCatalog = () => {
    const error = validateCatalog();

    if (error) {
      showToast(error);
      return false;
    }

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(state.catalog));
      setDirty(false);
      showToast("Catalogo salvo neste navegador.");
      return true;
    } catch (error) {
      showToast(
        "Nao foi possivel salvar. Tente imagens menores ou exporte o catalogo.",
      );
      return false;
    }
  };

  const renderProductList = () => {
    if (!elements.productList) {
      return;
    }

    elements.productList.innerHTML =
      state.catalog.products
        .map(
          (product) => `
            <button
              class="${product.slug === state.activeProductSlug ? "is-active" : ""}"
              type="button"
              data-product="${escapeHtml(product.slug)}"
            >
              <span class="list-title">${escapeHtml(product.name)}</span>
              <span class="list-meta">${escapeHtml(product.categoryLabel || product.category)} | ${escapeHtml(product.price)}</span>
            </button>
          `,
        )
        .join("") || '<p class="admin-empty">Nenhum produto cadastrado.</p>';

    elements.productList.querySelectorAll("[data-product]").forEach((button) => {
      button.addEventListener("click", () => {
        state.activeProductSlug = button.getAttribute("data-product") ?? "";
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
      .filter((key) => key !== "all")
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
      return;
    }

    form.elements.slug.value = product.slug;
    form.elements.name.value = product.name;
    form.elements.category.value = product.category;
    form.elements.price.value = product.price;
    form.elements.badge.value = product.badge;
    form.elements.badgeTone.value = product.badgeTone;
    form.elements.availability.value = product.availability;
    form.elements.materials.value = product.materials;
    form.elements.shortDescription.value = product.shortDescription;
    form.elements.description.value = product.description;
    form.elements.dimensions.value = product.dimensions;
    form.elements.whatsappText.value = product.whatsappText;
    form.elements.images.value = arrayToLines(product.images);
    form.elements.highlights.value = arrayToLines(product.highlights);

    renderImagePreview(elements.productPreview, product.images);
  };

  const readProductForm = () => {
    const form = elements.productForm;
    const currentSlug = state.activeProductSlug;

    if (!form) {
      return;
    }

    const nextSlug = normalizeSlug(form.elements.slug.value);
    const nextProduct = {
      slug: nextSlug,
      name: form.elements.name.value.trim(),
      category: form.elements.category.value,
      categoryLabel:
        state.catalog.categoryMeta[form.elements.category.value]?.label ?? "",
      price: form.elements.price.value.trim(),
      badge: form.elements.badge.value.trim(),
      badgeTone: form.elements.badgeTone.value,
      availability: form.elements.availability.value.trim(),
      materials: form.elements.materials.value.trim(),
      shortDescription: form.elements.shortDescription.value.trim(),
      description: form.elements.description.value.trim(),
      dimensions: form.elements.dimensions.value.trim(),
      whatsappText: form.elements.whatsappText.value.trim(),
      images: linesToArray(form.elements.images.value),
      highlights: linesToArray(form.elements.highlights.value),
    };

    const index = state.catalog.products.findIndex(
      (product) => product.slug === currentSlug,
    );

    if (index >= 0) {
      state.catalog.products[index] = nextProduct;
    }

    state.activeProductSlug = nextSlug;
    setDirty();
    renderProductList();
    renderImagePreview(elements.productPreview, nextProduct.images);
  };

  const renderProducts = () => {
    syncCategoryLabels();
    updateCategorySelect();

    if (!getProduct() && state.catalog.products[0]) {
      state.activeProductSlug = state.catalog.products[0].slug;
    }

    renderProductList();
    fillProductForm();
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
          state.activeCategoryKey = button.getAttribute("data-category") ?? "all";
          renderCategories();
        });
      });
  };

  const fillCategoryForm = () => {
    const form = elements.categoryForm;
    const category = getCategory();

    if (!form || !category) {
      return;
    }

    form.elements.key.value = state.activeCategoryKey;
    form.elements.key.disabled = state.activeCategoryKey === "all";
    form.elements.label.value = category.label;
    form.elements.eyebrow.value = category.eyebrow;
    form.elements.title.value = category.title;
    form.elements.description.value = category.description;
    form.elements.heroImage.value = category.heroImage;
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
  };

  const fillHomeForm = () => {
    const form = elements.homeForm;
    const home = state.catalog.siteContent.home ?? {};

    if (!form) {
      return;
    }

    form.elements.heroImage.value = home.heroImage ?? "";
    form.elements.heroKicker.value = home.heroKicker ?? "";
    form.elements.heroTitle.value = home.heroTitle ?? "";
    form.elements.heroText.value = home.heroText ?? "";
    form.elements.featuredProductSlugs.value = arrayToLines(
      home.featuredProductSlugs,
    );
    form.elements.featuredCategoryKeys.value = arrayToLines(
      home.featuredCategoryKeys,
    );
    renderImagePreview(elements.homePreview, [home.heroImage]);
  };

  const readHomeForm = () => {
    const form = elements.homeForm;

    if (!form) {
      return;
    }

    state.catalog.siteContent.home = {
      ...(state.catalog.siteContent.home ?? {}),
      heroImage: form.elements.heroImage.value.trim(),
      heroKicker: form.elements.heroKicker.value.trim(),
      heroTitle: form.elements.heroTitle.value.trim(),
      heroText: form.elements.heroText.value.trim(),
      featuredProductSlugs: linesToArray(form.elements.featuredProductSlugs.value),
      featuredCategoryKeys: linesToArray(form.elements.featuredCategoryKeys.value),
    };

    setDirty();
    renderImagePreview(elements.homePreview, [
      state.catalog.siteContent.home.heroImage,
    ]);
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

  const appendImageFromFile = (file, target) => {
    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.addEventListener("load", () => {
      const dataUrl = String(reader.result ?? "");

      if (!dataUrl) {
        return;
      }

      if (target === "product" && elements.productForm) {
        const input = elements.productForm.elements.images;
        input.value = [input.value.trim(), dataUrl].filter(Boolean).join("\n");
        readProductForm();
      }

      if (target === "category" && elements.categoryForm) {
        elements.categoryForm.elements.heroImage.value = dataUrl;
        readCategoryForm();
      }

      if (target === "home" && elements.homeForm) {
        elements.homeForm.elements.heroImage.value = dataUrl;
        readHomeForm();
      }
    });

    reader.readAsDataURL(file);
  };

  const createProduct = () => {
    const baseSlug = normalizeSlug("novo-produto");
    let nextSlug = baseSlug;
    let count = 2;

    while (state.catalog.products.some((product) => product.slug === nextSlug)) {
      nextSlug = `${baseSlug}-${count}`;
      count += 1;
    }

    const categoryKey = getCategoryKeys().find((key) => key !== "all") ?? "modern";
    const category = state.catalog.categoryMeta[categoryKey];

    state.catalog.products.push({
      slug: nextSlug,
      name: "Novo produto",
      category: categoryKey,
      categoryLabel: category?.label ?? categoryKey,
      price: "Sob consulta",
      badge: "Novo",
      badgeTone: "neutral",
      shortDescription: "Descricao curta do produto.",
      description: "Descricao completa do produto.",
      materials: "A definir",
      availability: "Em preparacao",
      dimensions: "A definir",
      highlights: ["Produto criado no admin"],
      images: ["assets/images/product-placeholder-modern.svg"],
      whatsappText: "Oi, quero saber mais detalhes deste produto da MOMNT.",
    });

    state.activeProductSlug = nextSlug;
    setDirty();
    renderProducts();
  };

  const duplicateProduct = () => {
    const product = getProduct();

    if (!product) {
      return;
    }

    const copy = clone(product);
    let nextSlug = `${copy.slug}-copia`;
    let count = 2;

    while (state.catalog.products.some((item) => item.slug === nextSlug)) {
      nextSlug = `${copy.slug}-copia-${count}`;
      count += 1;
    }

    copy.slug = nextSlug;
    copy.name = `${copy.name} copia`;
    state.catalog.products.push(copy);
    state.activeProductSlug = nextSlug;
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
    state.activeProductSlug = state.catalog.products[0]?.slug ?? "";
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
      eyebrow: "Colecao MOMNT",
      title: "Titulo da categoria",
      description: "Descricao da categoria.",
      heroImage: "assets/images/collection-placeholder-modern.svg",
    };
    state.activeCategoryKey = nextKey;
    setDirty();
    renderCategories();
    renderProducts();
  };

  const removeCategory = () => {
    const category = getCategory();

    if (
      !category ||
      state.activeCategoryKey === "all" ||
      !window.confirm(`Remover a categoria ${category.label}?`)
    ) {
      return;
    }

    const fallbackKey =
      getCategoryKeys().find(
        (key) => key !== "all" && key !== state.activeCategoryKey,
      ) ?? "all";

    delete state.catalog.categoryMeta[state.activeCategoryKey];
    state.catalog.products = state.catalog.products.map((product) =>
      product.category === state.activeCategoryKey
        ? { ...product, category: fallbackKey }
        : product,
    );
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
      state.activeProductSlug = state.catalog.products[0]?.slug ?? "";
      state.activeCategoryKey = "all";
      setDirty();
      renderAll();
      showToast("JSON importado. Salve para aplicar neste navegador.");
    } catch {
      showToast("JSON invalido.");
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
    if (!window.confirm("Restaurar o catalogo original e apagar edicoes locais?")) {
      return;
    }

    window.localStorage.removeItem(storageKey);
    state.catalog = sanitizeCatalog(clone(defaultCatalog));
    state.activeProductSlug = state.catalog.products[0]?.slug ?? "";
    state.activeCategoryKey = "all";
    setDirty(false);
    renderAll();
    showToast("Catalogo original restaurado.");
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
    syncCategoryLabels();
    renderProducts();
    renderCategories();
    fillHomeForm();
    renderExport();
  };

  elements.loginForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(elements.loginForm);
    const accessCode = String(formData.get("accessCode") ?? "").trim();

    if (accessCode !== ACCESS_CODE) {
      if (elements.loginFeedback) {
        elements.loginFeedback.hidden = false;
        elements.loginFeedback.textContent = "Codigo incorreto.";
      }
      return;
    }

    window.localStorage.setItem(SESSION_KEY, "ok");
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
      showToast("Exportacao copiada.");
    } catch {
      showToast("Nao foi possivel copiar automaticamente.");
    }
  });

  elements.productForm?.addEventListener("input", readProductForm);
  elements.categoryForm?.addEventListener("input", readCategoryForm);
  elements.homeForm?.addEventListener("input", readHomeForm);

  document.querySelectorAll("[data-image-picker]").forEach((input) => {
    input.addEventListener("change", () => {
      if (!(input instanceof HTMLInputElement)) {
        return;
      }

      appendImageFromFile(input.files?.[0], input.dataset.imagePicker);
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

  if (window.localStorage.getItem(SESSION_KEY) === "ok") {
    unlock();
  }
})();
