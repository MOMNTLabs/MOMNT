(function () {
  const start = () => {
  const products = Array.isArray(window.MOMNT_PRODUCTS)
    ? window.MOMNT_PRODUCTS
    : [];
  const categoryMeta = window.MOMNT_CATEGORY_META ?? {};

  const heroImage = document.querySelector("#catalog-hero-image");
  const filtersRoot = document.querySelector("#catalog-filters");
  const summaryText = document.querySelector("#catalog-summary-text");
  const gridRoot = document.querySelector("#catalog-grid");
  const emptyState = document.querySelector("#catalog-empty");
  const searchInput = document.querySelector("#catalog-search");
  const searchForm = document.querySelector(".catalog-search-form");

  if (
    !heroImage ||
    !filtersRoot ||
    !summaryText ||
    !gridRoot ||
    !emptyState ||
    !searchInput
  ) {
    return;
  }

  const categoryKeys = Object.keys(categoryMeta);
  const params = new URLSearchParams(window.location.search);

  const normalizeText = (value) =>
    String(value ?? "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  const sanitizeCategory = (value) =>
    categoryKeys.includes(value) ? value : "all";

  const state = {
    category: sanitizeCategory(params.get("categoria") ?? "all"),
    search: String(params.get("busca") ?? "").trim(),
  };

  const buildProductUrl = (slug) =>
    `produto.html?slug=${encodeURIComponent(slug)}`;

  const buildWhatsappUrl = (text) =>
    `https://wa.me/5511963238610?text=${encodeURIComponent(text)}`;

  const getFilteredProducts = () => {
    const normalizedSearch = normalizeText(state.search);

    return products.filter((product) => {
      const matchesCategory =
        state.category === "all" || product.category === state.category;

      if (!matchesCategory) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const haystack = normalizeText(
        `${product.name} ${product.categoryLabel} ${product.shortDescription} ${product.description}`,
      );

      return haystack.includes(normalizedSearch);
    });
  };

  const updateUrl = () => {
    const nextParams = new URLSearchParams();

    if (state.category !== "all") {
      nextParams.set("categoria", state.category);
    }

    if (state.search) {
      nextParams.set("busca", state.search);
    }

    const query = nextParams.toString();
    const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}`;
    window.history.replaceState({}, "", nextUrl);
  };

  const renderFilters = () => {
    filtersRoot.innerHTML = categoryKeys
      .map((categoryKey) => {
        const category = categoryMeta[categoryKey];
        const isActive = categoryKey === state.category ? " is-active" : "";

        return `
          <button
            class="catalog-chip${isActive}"
            type="button"
            data-category="${categoryKey}"
          >
            ${category.label}
          </button>
        `;
      })
      .join("");

    filtersRoot.querySelectorAll("[data-category]").forEach((button) => {
      button.addEventListener("click", () => {
        const nextCategory = button.getAttribute("data-category");

        if (!nextCategory) {
          return;
        }

        state.category = sanitizeCategory(nextCategory);
        render();
      });
    });
  };

  const renderHero = () => {
    const meta = categoryMeta[state.category] ?? categoryMeta.all;

    heroImage.src = meta.heroImage;
    heroImage.alt = `${meta.label} MOMNT`;
    document.title = `MOMNT | ${
      meta.label === "Todos" ? "Produtos" : meta.label
    }`;
  };

  const renderSummary = (filteredProducts) => {
    const totalByCategory =
      state.category === "all"
        ? products.length
        : products.filter((product) => product.category === state.category)
            .length;

    if (!filteredProducts.length) {
      summaryText.innerHTML =
        "<strong>0 modelos</strong> para este filtro. Ajuste a busca ou troque a categoria.";
      return;
    }

    if (state.search) {
      summaryText.innerHTML = `<strong>${filteredProducts.length} modelos</strong> encontrados para "${state.search}".`;
      return;
    }

    summaryText.innerHTML = `<strong>${filteredProducts.length} de ${totalByCategory}</strong> modelos exibidos nesta categoria.`;
  };

  const renderGrid = (filteredProducts) => {
    if (!filteredProducts.length) {
      gridRoot.innerHTML = "";
      emptyState.hidden = false;
      emptyState.classList.add("is-visible");
      return;
    }

    emptyState.hidden = true;
    gridRoot.innerHTML = filteredProducts
      .map((product) => {
        const secondaryLabel =
          product.availability === "Pronta entrega"
            ? "Comprar no WhatsApp"
            : "Receber aviso";

        return `
          <article class="catalog-card reveal is-visible">
            <div class="catalog-card-media">
              <span class="catalog-card-badge badge-${product.badgeTone}">
                ${product.badge}
              </span>
              <img src="${product.images[0]}" alt="${product.name}" loading="lazy" />
            </div>
            <div class="catalog-card-copy">
              <p class="catalog-card-meta">${product.categoryLabel} collection</p>
              <h2>${product.name}</h2>
              <p class="catalog-card-description">${product.shortDescription}</p>
              <p class="catalog-card-price">${product.price}</p>
              <div class="catalog-card-actions">
                <a class="shop-button shop-button-primary" href="${buildProductUrl(product.slug)}">
                  Ver produto
                </a>
                <a
                  class="shop-button shop-button-secondary"
                  href="${buildWhatsappUrl(product.whatsappText)}"
                  target="_blank"
                  rel="noreferrer"
                >
                  ${secondaryLabel}
                </a>
              </div>
            </div>
          </article>
        `;
      })
      .join("");
  };

  const render = () => {
    const filteredProducts = getFilteredProducts();

    searchInput.value = state.search;
    renderFilters();
    renderHero(filteredProducts);
    renderSummary(filteredProducts);
    renderGrid(filteredProducts);
    updateUrl();
  };

  searchInput.addEventListener("input", (event) => {
    const target = event.target;

    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    state.search = target.value.trim();
    render();
  });

  searchForm?.addEventListener("submit", (event) => {
    event.preventDefault();
  });

  render();
  };

  if (window.MOMNT_CATALOG_READY) {
    window.MOMNT_CATALOG_READY.finally(start);
  } else {
    start();
  }
})();
