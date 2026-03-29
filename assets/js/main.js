const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const pageLinks = document.querySelectorAll(".site-nav a");
const revealItems = document.querySelectorAll(".reveal");
const videoModal = document.querySelector("[data-video-modal]");
const openVideoButtons = document.querySelectorAll("[data-open-video]");
const closeVideoButtons = document.querySelectorAll("[data-close-video]");
const videoElement = videoModal?.querySelector("video");
const currentYear = document.querySelector("#current-year");
const filterButtons = Array.from(document.querySelectorAll("[data-filter]"));
const productCards = Array.from(document.querySelectorAll(".product-card"));
const filterSummary = document.querySelector("[data-filter-summary]");

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}

const closeNav = () => {
  if (!siteNav || !menuToggle) {
    return;
  }

  siteNav.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
};

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  pageLinks.forEach((link) => {
    link.addEventListener("click", closeNav);
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

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) {
      closeNav();
    }
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

const openVideo = () => {
  if (!videoModal) {
    return;
  }

  videoModal.hidden = false;
  document.body.classList.add("modal-open");

  if (videoElement) {
    videoElement.currentTime = 0;
    void videoElement.play().catch(() => {});
  }
};

const closeVideo = () => {
  if (!videoModal) {
    return;
  }

  videoModal.hidden = true;
  document.body.classList.remove("modal-open");

  if (videoElement) {
    videoElement.pause();
    videoElement.currentTime = 0;
  }
};

openVideoButtons.forEach((button) => {
  button.addEventListener("click", openVideo);
});

closeVideoButtons.forEach((button) => {
  button.addEventListener("click", closeVideo);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeNav();
    closeVideo();
  }
});

const applyFilter = (filter) => {
  if (!productCards.length) {
    return;
  }

  let visibleCount = 0;

  productCards.forEach((card) => {
    const matches = filter === "all" || card.dataset.category === filter;
    card.classList.toggle("is-hidden", !matches);

    if (matches) {
      visibleCount += 1;
    }
  });

  if (!filterSummary) {
    return;
  }

  if (filter === "all") {
    filterSummary.textContent = `${visibleCount} modelos visiveis entre pronta entrega e preview.`;
    return;
  }

  const activeButton = filterButtons.find(
    (button) => button.dataset.filter === filter,
  );
  const activeLabel = activeButton?.textContent?.trim() || "Colecao";
  const noun = visibleCount === 1 ? "modelo visivel" : "modelos visiveis";

  filterSummary.textContent = `${visibleCount} ${noun} em ${activeLabel}.`;
};

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((item) => {
      item.classList.toggle("is-active", item === button);
      item.setAttribute("aria-pressed", String(item === button));
    });

    applyFilter(button.dataset.filter || "all");
  });
});

if (filterButtons.length) {
  applyFilter("all");
}
