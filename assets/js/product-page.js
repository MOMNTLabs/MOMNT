(function () {
  const start = () => {
  const products = Array.isArray(window.MOMNT_PRODUCTS)
    ? window.MOMNT_PRODUCTS
    : [];
  const categoryMeta = window.MOMNT_CATEGORY_META ?? {};
  const cart = window.MOMNT_CART ?? null;
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
        <span class="breadcrumb">Produto não encontrado</span>
        <h1>Esta página ainda não existe no catálogo.</h1>
        <p>
          O slug informado não está cadastrado. Volte para a vitrine e escolha um dos
          modelos disponíveis ou ajuste o link que gerou esta URL.
        </p>
        <div class="catalog-card-actions">
          <a class="shop-button shop-button-primary" href="produtos.html">Ir para produtos</a>
          <a class="shop-button shop-button-secondary" href="index.html#colecoes">Voltar para a home</a>
        </div>
      </article>
    `;
    document.title = "MOMNT | Produto não encontrado";
    return;
  }

  const category = categoryMeta[product.category] ?? categoryMeta.all;
  const relatedProducts = buildRelatedProducts(product);
  const isPurchasable = Boolean(cart?.canSellProduct(product));

  const renderPurchaseBlock = () => {
    if (!isPurchasable) {
      return `
        <section class="pdp-purchase-box">
          <span class="breadcrumb">Disponibilidade</span>
          <p class="pdp-purchase-copy">
            Este modelo ainda não está pronto para checkout. Deixe seu contato para
            receber aviso ou finalizar com atendimento assistido.
          </p>
          <div class="pdp-actions">
            <a
              class="shop-button shop-button-primary"
              href="${buildWhatsappUrl(product.whatsappText)}"
              target="_blank"
              rel="noreferrer"
            >
              Receber aviso
            </a>
            <a
              class="shop-button shop-button-secondary"
              href="${buildCatalogUrl(product.category)}"
            >
              Ver categoria
            </a>
          </div>
        </section>
      `;
    }

    return `
      <section class="pdp-purchase-box">
        <div class="pdp-purchase-top">
          <div>
            <span class="breadcrumb">Comprar agora</span>
            <p class="pdp-purchase-copy">
              Adicione ao carrinho ou siga direto para o checkout com este modelo.
            </p>
          </div>

          <div class="quantity-stepper" aria-label="Quantidade">
            <button type="button" data-quantity-decrease aria-label="Diminuir quantidade">
              -
            </button>
            <input
              type="number"
              min="1"
              step="1"
              value="1"
              inputmode="numeric"
              data-quantity-input
              aria-label="Quantidade de ${product.name}"
            />
            <button type="button" data-quantity-increase aria-label="Aumentar quantidade">
              +
            </button>
          </div>
        </div>

        <div class="pdp-actions">
          <button class="shop-button shop-button-primary" type="button" data-add-to-cart>
            Adicionar ao carrinho
          </button>
          <button class="shop-button shop-button-secondary" type="button" data-buy-now>
            Ir para checkout
          </button>
        </div>

        <div class="pdp-support-links">
          <a href="carrinho.html">Ver carrinho</a>
          <a
            href="${buildWhatsappUrl(product.whatsappText)}"
            target="_blank"
            rel="noreferrer"
          >
            Compra assistida no WhatsApp
          </a>
        </div>

        <p class="pdp-feedback" data-cart-feedback hidden></p>
      </section>
    `;
  };

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

            ${renderPurchaseBlock()}

            <div class="pdp-panels">
              <section class="pdp-panel">
                <span class="breadcrumb">Especificações</span>
                <div class="pdp-spec-list">
                  <div class="pdp-spec-row">
                    <span class="pdp-spec-label">Categoria</span>
                    <span class="pdp-spec-value">${product.categoryLabel}</span>
                  </div>
                  <div class="pdp-spec-row">
                    <span class="pdp-spec-label">Dimensões</span>
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
  const feedbackElement = document.querySelector("[data-cart-feedback]");
  const quantityInput = document.querySelector("[data-quantity-input]");
  const decreaseButton = document.querySelector("[data-quantity-decrease]");
  const increaseButton = document.querySelector("[data-quantity-increase]");
  const addToCartButton = document.querySelector("[data-add-to-cart]");
  const buyNowButton = document.querySelector("[data-buy-now]");

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

  if (isPurchasable && quantityInput instanceof HTMLInputElement && cart) {
    const readQuantity = () => {
      const quantity = Number.parseInt(quantityInput.value, 10);
      return Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
    };

    const syncQuantity = (nextQuantity) => {
      quantityInput.value = String(Math.max(1, nextQuantity));
    };

    const showFeedback = (message) => {
      if (!(feedbackElement instanceof HTMLElement)) {
        return;
      }

      feedbackElement.hidden = false;
      feedbackElement.textContent = message;
    };

    decreaseButton?.addEventListener("click", () => {
      syncQuantity(readQuantity() - 1);
    });

    increaseButton?.addEventListener("click", () => {
      syncQuantity(readQuantity() + 1);
    });

    quantityInput.addEventListener("change", () => {
      syncQuantity(readQuantity());
    });

    addToCartButton?.addEventListener("click", () => {
      cart.addItem(product.slug, readQuantity());
      showFeedback(`${product.name} foi adicionado ao carrinho.`);
    });

    buyNowButton?.addEventListener("click", () => {
      cart.addItem(product.slug, readQuantity());
      window.location.href = "checkout.html";
    });
  }

  document.title = `MOMNT | ${product.name}`;
  };

  if (window.MOMNT_CATALOG_READY) {
    window.MOMNT_CATALOG_READY.finally(start);
  } else {
    start();
  }
})();
