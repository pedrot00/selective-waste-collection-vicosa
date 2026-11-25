
document.addEventListener("DOMContentLoaded", () => {
    const accessibilityButton = document.getElementById("accessibility-button");
    const accessibilityPanel = document.getElementById("accessibility-panel");
    const closeAccessibility = document.getElementById("close-accessibility");

    const fontToggle = document.getElementById("font-toggle");
    const colorToggle = document.getElementById("color-toggle");
    const readerToggle = document.getElementById("reader-toggle");

    const root = document.documentElement;

    const savePreference = (key, value) => {
        localStorage.setItem(key, String(value));
    };

    const getPreference = (key) => {
        return localStorage.getItem(key) === "true";
    };

    const openPanel = () => {
        accessibilityPanel.hidden = false;
        accessibilityButton.setAttribute("aria-expanded", "true");
    };

    const closePanel = () => {
        accessibilityPanel.hidden = true;
        accessibilityButton.setAttribute("aria-expanded", "false");
        accessibilityButton.focus();
    };

    accessibilityButton?.addEventListener("click", () => {
        if (accessibilityPanel.hidden) {
            openPanel();
        } else {
            closePanel();
        }
    });

    closeAccessibility?.addEventListener("click", closePanel);

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !accessibilityPanel.hidden) {
            closePanel();
        }
    });

    const fontEnabled = getPreference("largeFont");
    root.classList.toggle("large-font", fontEnabled);

    if (fontToggle) {
        fontToggle.checked = fontEnabled;

        fontToggle.addEventListener("change", () => {
            root.classList.toggle("large-font", fontToggle.checked);
            savePreference("largeFont", fontToggle.checked);
        });
    }

    const colorEnabled = getPreference("colorblindMode");
    document.body.classList.toggle("colorblind-mode", colorEnabled);

    if (colorToggle) {
        colorToggle.checked = colorEnabled;

        colorToggle.addEventListener("change", () => {
            document.body.classList.toggle("colorblind-mode", colorToggle.checked);
            savePreference("colorblindMode", colorToggle.checked);
        });
    }

    let readerEnabled = getPreference("readerEnabled");

    if (readerToggle) {
        readerToggle.checked = readerEnabled;

        readerToggle.addEventListener("change", () => {
            readerEnabled = readerToggle.checked;
            savePreference("readerEnabled", readerEnabled);

            if (!readerEnabled && "speechSynthesis" in window) {
                window.speechSynthesis.cancel();
            }
        });
    }

    const readText = (text) => {
        if (!readerEnabled || !("speechSynthesis" in window) || !text.trim()) {
            return;
        }

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "pt-BR";
        utterance.rate = 0.95;

        window.speechSynthesis.speak(utterance);
    };

    document.addEventListener("click", (event) => {
        if (!readerEnabled) return;

        const target = event.target.closest(
            "h1, h2, h3, p, label, button, a, li, .profile-name, .profile-description"
        );

        if (target && !target.closest(".accessibility-panel")) {
            readText(target.innerText || target.textContent);
        }
    });
});
