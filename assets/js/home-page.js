(function () {
  const start = () => {
  const products = Array.isArray(window.MOMNT_PRODUCTS)
    ? window.MOMNT_PRODUCTS
    : [];
  const categoryMeta = window.MOMNT_CATEGORY_META ?? {};
  const homeContent = window.MOMNT_SITE_CONTENT?.home ?? {};

  const heroImage = document.querySelector(".hero-media img");
  const heroKicker = document.querySelector(".hero-kicker");
  const heroTitle = document.querySelector(".hero-content h1");
  const heroText = document.querySelector(".hero-text");
  const productGrid = document.querySelector(".recommendations .product-grid");
  const featureGrid = document.querySelector(".categories .feature-grid");

  const escapeHtml = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const getBadgeClass = (tone) => {
    if (tone === "green") {
      return "product-badge-green";
    }

    if (tone === "soft") {
      return "product-badge-soft";
    }

    return "";
  };

  const updateHero = () => {
    if (heroImage && homeContent.heroImage) {
      heroImage.src = homeContent.heroImage;
      heroImage.alt = "Campanha MOMNT em destaque";
    }

    if (heroKicker && homeContent.heroKicker) {
      heroKicker.textContent = homeContent.heroKicker;
    }

    if (heroTitle && homeContent.heroTitle) {
      heroTitle.textContent = homeContent.heroTitle;
    }

    if (heroText && homeContent.heroText) {
      heroText.textContent = homeContent.heroText;
    }
  };

  const renderProducts = () => {
    if (!productGrid || !products.length) {
      return;
    }

    const featuredSlugs = Array.isArray(homeContent.featuredProductSlugs)
      ? homeContent.featuredProductSlugs
      : [];
    const featuredProducts = featuredSlugs
      .map((slug) => products.find((product) => product.slug === slug))
      .filter(Boolean);
    const fallbackProducts = products.filter(
      (product) =>
        product.availability === "Pronta entrega" &&
        !featuredProducts.some((featured) => featured.slug === product.slug),
    );
    const visibleProducts = [...featuredProducts, ...fallbackProducts].slice(
      0,
      4,
    );

    productGrid.innerHTML = visibleProducts
      .map(
        (product) => `
          <article class="product-card reveal is-visible">
            <div class="product-media">
              <span class="product-badge ${getBadgeClass(product.badgeTone)}">
                ${escapeHtml(product.badge)}
              </span>
              <button
                class="wishlist-button"
                type="button"
                aria-label="Salvar ${escapeHtml(product.name)}"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M12 20.5L4.8 13.6A4.7 4.7 0 1 1 12 7.9a4.7 4.7 0 1 1 7.2 5.7L12 20.5Z"
                  ></path>
                </svg>
              </button>
              <img
                src="${escapeHtml(product.images[0])}"
                alt="${escapeHtml(product.name)}"
                loading="lazy"
              />
            </div>
            <div class="product-copy">
              <p class="product-category">
                ${escapeHtml(product.categoryLabel)} collection
              </p>
              <h2>${escapeHtml(product.name)}</h2>
              <p class="product-price">${escapeHtml(product.price)}</p>
              <a class="product-link" href="produto.html?slug=${encodeURIComponent(product.slug)}">
                Ver produto
              </a>
            </div>
          </article>
        `,
      )
      .join("");
  };

  const renderCategories = () => {
    if (!featureGrid) {
      return;
    }

    const featuredCategoryKeys = Array.isArray(
      homeContent.featuredCategoryKeys,
    )
      ? homeContent.featuredCategoryKeys
      : [];
    const categoryKeys = [
      ...featuredCategoryKeys,
      ...Object.keys(categoryMeta).filter((key) => key !== "all"),
    ].filter((key, index, list) => key !== "all" && list.indexOf(key) === index);

    if (!categoryKeys.length) {
      return;
    }

    featureGrid.innerHTML = categoryKeys
      .slice(0, 3)
      .map((categoryKey, index) => {
        const category = categoryMeta[categoryKey];

        if (!category) {
          return "";
        }

        return `
          <article class="feature-card${index === 0 ? " feature-card-large" : ""} reveal is-visible">
            <img
              src="${escapeHtml(category.heroImage)}"
              alt="${escapeHtml(category.label)} MOMNT"
              loading="lazy"
            />
            <div class="feature-overlay">
              <p class="section-label">${escapeHtml(category.label)}</p>
              <h3>${escapeHtml(category.title)}</h3>
              <a href="produtos.html?categoria=${encodeURIComponent(categoryKey)}">
                Ver categoria
              </a>
            </div>
          </article>
        `;
      })
      .join("");
  };

  updateHero();
  renderProducts();
  renderCategories();
  };

  if (window.MOMNT_CATALOG_READY) {
    window.MOMNT_CATALOG_READY.finally(start);
  } else {
    start();
  }
})();
