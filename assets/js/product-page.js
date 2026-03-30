(function () {
  const products = Array.isArray(window.MOMNT_PRODUCTS)
    ? window.MOMNT_PRODUCTS
    : [];
  const categoryMeta = window.MOMNT_CATEGORY_META ?? {};
  const root = document.querySelector("#product-page-root");

  if (!root) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const slug = String(params.get("slug") ?? "").trim();
  const product = products.find((item) => item.slug === slug);

  const buildCatalogUrl = (category) =>
    `produtos.html${category ? `?categoria=${encodeURIComponent(category)}` : ""}`;

  const buildProductUrl = (nextSlug) =>
    `produto.html?slug=${encodeURIComponent(nextSlug)}`;

  const buildWhatsappUrl = (text) =>
    `https://wa.me/5511963238610?text=${encodeURIComponent(text)}`;

  const buildRelatedProducts = (currentProduct) => {
    const sameCategory = products.filter(
      (item) =>
        item.category === currentProduct.category &&
        item.slug !== currentProduct.slug,
    );
    const fallbackProducts = products.filter(
      (item) =>
        item.category !== currentProduct.category &&
        item.slug !== currentProduct.slug,
    );

    return [...sameCategory, ...fallbackProducts].slice(0, 3);
  };

  if (!product) {
    root.innerHTML = `
      <article class="not-found-card reveal is-visible">
        <span class="breadcrumb">Produto nao encontrado</span>
        <h1>Esta pagina ainda nao existe no catalogo.</h1>
        <p>
          O slug informado nao esta cadastrado. Volte para a vitrine e escolha um dos
          modelos disponiveis ou ajuste o link que gerou esta URL.
        </p>
        <div class="catalog-card-actions">
          <a class="shop-button shop-button-primary" href="produtos.html">Ir para produtos</a>
          <a class="shop-button shop-button-secondary" href="index.html#colecoes">Voltar para a home</a>
        </div>
      </article>
    `;
    document.title = "MOMNT | Produto nao encontrado";
    return;
  }

  const category = categoryMeta[product.category] ?? categoryMeta.all;
  const relatedProducts = buildRelatedProducts(product);

  root.innerHTML = `
    <nav class="breadcrumb breadcrumb-row reveal is-visible" aria-label="Breadcrumb">
      <a href="index.html#top">Home</a>
      <span>/</span>
      <a href="${buildCatalogUrl(product.category)}">${product.categoryLabel}</a>
      <span>/</span>
      <span aria-current="page">${product.name}</span>
    </nav>

    <section class="pdp-shell">
      <div class="pdp-layout">
        <article class="pdp-card reveal is-visible">
          <div class="pdp-gallery">
            <div class="pdp-main-visual">
              <img
                id="pdp-main-image"
                src="${product.images[0]}"
                alt="${product.name}"
              />
            </div>
            <div class="pdp-thumbs">
              ${product.images
                .map(
                  (image, index) => `
                    <button
                      class="pdp-thumb${index === 0 ? " is-active" : ""}"
                      type="button"
                      data-image-index="${index}"
                      aria-label="Ver imagem ${index + 1} de ${product.name}"
                    >
                      <img src="${image}" alt="${product.name}" loading="lazy" />
                    </button>
                  `,
                )
                .join("")}
            </div>
          </div>
        </article>

        <article class="pdp-card reveal is-visible">
          <div class="pdp-info">
            <span class="pdp-meta">${product.categoryLabel} collection</span>
            <h1>${product.name}</h1>
            <p class="pdp-price">${product.price}</p>
            <p class="pdp-description">${product.description}</p>

            <div class="pdp-tags">
              <span class="pdp-tag">${product.badge}</span>
              <span class="pdp-tag">${product.availability}</span>
              <span class="pdp-tag">${product.materials}</span>
            </div>

            <div class="pdp-actions">
              <a
                class="shop-button shop-button-primary"
                href="${buildWhatsappUrl(product.whatsappText)}"
                target="_blank"
                rel="noreferrer"
              >
                ${
                  product.availability === "Pronta entrega"
                    ? "Comprar no WhatsApp"
                    : "Receber aviso"
                }
              </a>
              <a
                class="shop-button shop-button-secondary"
                href="${buildCatalogUrl(product.category)}"
              >
                Ver categoria
              </a>
            </div>

            <div class="pdp-panels">
              <section class="pdp-panel">
                <span class="breadcrumb">Especificacoes</span>
                <div class="pdp-spec-list">
                  <div class="pdp-spec-row">
                    <span class="pdp-spec-label">Categoria</span>
                    <span class="pdp-spec-value">${product.categoryLabel}</span>
                  </div>
                  <div class="pdp-spec-row">
                    <span class="pdp-spec-label">Dimensoes</span>
                    <span class="pdp-spec-value">${product.dimensions}</span>
                  </div>
                  <div class="pdp-spec-row">
                    <span class="pdp-spec-label">Materiais</span>
                    <span class="pdp-spec-value">${product.materials}</span>
                  </div>
                  <div class="pdp-spec-row">
                    <span class="pdp-spec-label">Disponibilidade</span>
                    <span class="pdp-spec-value">${product.availability}</span>
                  </div>
                </div>
              </section>

              <section class="pdp-panel">
                <span class="breadcrumb">Por que este modelo</span>
                <ul class="pdp-highlight-list">
                  ${product.highlights
                    .map((highlight) => `<li>${highlight}</li>`)
                    .join("")}
                </ul>
              </section>
            </div>
          </div>
        </article>
      </div>

      <section class="related-shell reveal is-visible">
        <div>
          <span class="related-title">${category.eyebrow}</span>
          <h2>${category.title}</h2>
          <p>${category.description}</p>
        </div>
        <div class="related-grid">
          ${relatedProducts
            .map(
              (relatedProduct) => `
                <article class="related-product-card">
                  <img
                    src="${relatedProduct.images[0]}"
                    alt="${relatedProduct.name}"
                    loading="lazy"
                  />
                  <span class="catalog-card-meta">${relatedProduct.categoryLabel} collection</span>
                  <h3>${relatedProduct.name}</h3>
                  <p>${relatedProduct.shortDescription}</p>
                  <strong class="catalog-card-price">${relatedProduct.price}</strong>
                  <a
                    class="shop-button shop-button-secondary"
                    href="${buildProductUrl(relatedProduct.slug)}"
                  >
                    Ver produto
                  </a>
                </article>
              `,
            )
            .join("")}
        </div>
      </section>
    </section>
  `;

  const mainImage = document.querySelector("#pdp-main-image");
  const thumbButtons = document.querySelectorAll("[data-image-index]");

  thumbButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const imageIndex = Number(button.getAttribute("data-image-index"));

      if (
        !mainImage ||
        Number.isNaN(imageIndex) ||
        !product.images[imageIndex]
      ) {
        return;
      }

      mainImage.setAttribute("src", product.images[imageIndex]);
      mainImage.setAttribute("alt", product.name);

      thumbButtons.forEach((thumbButton) => {
        thumbButton.classList.remove("is-active");
      });

      button.classList.add("is-active");
    });
  });

  document.title = `MOMNT | ${product.name}`;
})();
