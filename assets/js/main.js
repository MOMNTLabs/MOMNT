const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const pageLinks = document.querySelectorAll(".site-nav a");
const revealItems = document.querySelectorAll(".reveal");
const videoModal = document.querySelector("[data-video-modal]");
const openVideoButtons = document.querySelectorAll("[data-open-video]");
const closeVideoButtons = document.querySelectorAll("[data-close-video]");
const videoElement = videoModal?.querySelector("video");
const currentYear = document.querySelector("#current-year");

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  pageLinks.forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
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
      threshold: 0.15,
      rootMargin: "0px 0px -40px 0px",
    }
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
    closeVideo();
  }
});
