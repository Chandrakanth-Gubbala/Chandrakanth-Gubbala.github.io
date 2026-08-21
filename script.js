(() => {
    "use strict";

    function initNavigation() {
        const toggle = document.querySelector(".menu-toggle");
        const links = document.querySelector(".nav-links");

        if (!toggle || !links) return;

        const closeMenu = () => {
            links.classList.remove("is-open");
            toggle.setAttribute("aria-expanded", "false");
            toggle.setAttribute("aria-label", "Open navigation");
            document.body.classList.remove("nav-open");
        };

        toggle.addEventListener("click", () => {
            const opening = !links.classList.contains("is-open");
            links.classList.toggle("is-open", opening);
            toggle.setAttribute("aria-expanded", String(opening));
            toggle.setAttribute("aria-label", opening ? "Close navigation" : "Open navigation");
            document.body.classList.toggle("nav-open", opening);
        });

        links.addEventListener("click", (event) => {
            if (event.target.closest("a")) closeMenu();
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && links.classList.contains("is-open")) {
                closeMenu();
                toggle.focus();
            }
        });

        window.matchMedia("(min-width: 901px)").addEventListener("change", (event) => {
            if (event.matches) closeMenu();
        });
    }

    function initFilters() {
        const controls = document.querySelector("[data-project-filters]");
        const cards = Array.from(document.querySelectorAll("[data-project-categories]"));
        const status = document.querySelector("[data-filter-status]");

        if (!controls || !cards.length) return;

        controls.addEventListener("click", (event) => {
            const button = event.target.closest("[data-filter]");
            if (!button) return;

            const filter = button.dataset.filter;
            const buttons = controls.querySelectorAll("[data-filter]");
            let visibleCount = 0;

            buttons.forEach((item) => {
                const selected = item === button;
                item.classList.toggle("is-active", selected);
                item.setAttribute("aria-pressed", String(selected));
            });

            cards.forEach((card) => {
                const categories = card.dataset.projectCategories.split(/\s+/);
                const visible = filter === "all" || categories.includes(filter);
                card.hidden = !visible;
                if (visible) visibleCount += 1;
            });

            if (status) {
                const label = button.textContent.trim();
                status.textContent = `${visibleCount} ${label.toLowerCase()} project${visibleCount === 1 ? "" : "s"} shown.`;
            }
        });
    }

    function initLightbox() {
        const lightbox = document.querySelector("#media-lightbox");
        const stage = lightbox?.querySelector("[data-media-stage]");
        const title = lightbox?.querySelector("[data-media-title]");
        const caption = lightbox?.querySelector("[data-media-caption]");
        const closeButtons = lightbox?.querySelectorAll("[data-close-media]");

        if (!lightbox || !stage || !title || !caption || !closeButtons?.length) return;

        let lastTrigger = null;

        const clearStage = () => {
            const video = stage.querySelector("video");
            if (video) {
                video.pause();
                video.removeAttribute("src");
                video.load();
            }
            stage.replaceChildren();
        };

        const closeLightbox = () => {
            clearStage();
            lightbox.classList.remove("is-open");
            lightbox.setAttribute("hidden", "");
            document.body.classList.remove("no-scroll");
            if (lastTrigger) lastTrigger.focus();
        };

        const openLightbox = (trigger) => {
            clearStage();
            lastTrigger = trigger;
            title.textContent = trigger.dataset.mediaTitle || "Project evidence";
            caption.textContent = trigger.dataset.mediaCaption || "";

            if (trigger.dataset.mediaType === "video") {
                const video = document.createElement("video");
                video.controls = true;
                video.playsInline = true;
                video.preload = "none";
                video.src = trigger.dataset.mediaSrc;
                if (trigger.dataset.mediaPoster) video.poster = trigger.dataset.mediaPoster;
                video.setAttribute("aria-label", title.textContent);
                stage.append(video);
            } else {
                const image = document.createElement("img");
                image.src = trigger.dataset.mediaSrc;
                image.alt = trigger.dataset.mediaAlt || title.textContent;
                stage.append(image);
            }

            lightbox.removeAttribute("hidden");
            lightbox.classList.add("is-open");
            document.body.classList.add("no-scroll");
            lightbox.querySelector(".lightbox-close")?.focus();
        };

        document.addEventListener("click", (event) => {
            const trigger = event.target.closest("[data-open-media]");
            if (trigger) openLightbox(trigger);
        });

        closeButtons.forEach((button) => button.addEventListener("click", closeLightbox));

        document.addEventListener("keydown", (event) => {
            if (!lightbox.classList.contains("is-open")) return;

            if (event.key === "Escape") {
                closeLightbox();
                return;
            }

            if (event.key !== "Tab") return;
            const focusable = Array.from(lightbox.querySelectorAll("button, video, [href], [tabindex]:not([tabindex='-1'])"))
                .filter((element) => !element.hasAttribute("disabled"));
            if (!focusable.length) return;

            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        });
    }

    function initCaseNavigation() {
        const links = Array.from(document.querySelectorAll(".case-toc a"));
        if (!links.length || !("IntersectionObserver" in window)) return;

        const sections = links
            .map((link) => document.querySelector(link.getAttribute("href")))
            .filter(Boolean);

        const observer = new IntersectionObserver((entries) => {
            const active = entries
                .filter((entry) => entry.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
            if (!active) return;

            links.forEach((link) => {
                link.classList.toggle("is-active", link.getAttribute("href") === `#${active.target.id}`);
            });
        }, { rootMargin: "-20% 0px -65%", threshold: [0, 0.25, 0.6] });

        sections.forEach((section) => observer.observe(section));
    }

    document.addEventListener("DOMContentLoaded", () => {
        document.documentElement.classList.add("js-ready");
        initNavigation();
        initFilters();
        initLightbox();
        initCaseNavigation();
    });
})();
