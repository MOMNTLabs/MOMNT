const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const revealItems = document.querySelectorAll(".reveal");

const isHomePage =
  window.location.pathname.endsWith("/") ||
  window.location.pathname.endsWith("/index.html") ||
  window.location.pathname.endsWith("index.html");

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const renderSiteNav = () => {
  if (!siteNav) {
    return;
  }

  const categoryMeta = window.MOMNT_CATEGORY_META ?? {};
  const categories = Object.entries(categoryMeta).filter(
    ([categoryKey]) => categoryKey !== "all",
  );

  if (!categories.length) {
    return;
  }

  const categoryLinks = categories
    .map(([categoryKey, category]) => {
      const highlightClass = category.highlightInNav
        ? ' class="nav-link-highlight"'
        : "";

      return `<a${highlightClass} href="produtos.html?categoria=${encodeURIComponent(categoryKey)}">${escapeHtml(category.label)}</a>`;
    })
    .join("");
  const contactHref = isHomePage ? "#contato" : "index.html#contato";

  siteNav.innerHTML = `${categoryLinks}<a href="${contactHref}">Contato</a>`;
};

const closeNav = () => {
  if (!siteNav || !menuToggle) {
    return;
  }

  siteNav.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
};

renderSiteNav();

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  siteNav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      closeNav();
    }
  });

  document.addEventListener("click", (event) => {
    if (!siteNav.classList.contains("is-open")) {
      return;
    }

    const target = event.target;

    if (!(target instanceof Node)) {
      return;
    }

    if (siteNav.contains(target) || menuToggle.contains(target)) {
      return;
    }

    closeNav();
  });
}

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.14,
      rootMargin: "0px 0px -40px 0px",
    },
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeNav();
  }
});
