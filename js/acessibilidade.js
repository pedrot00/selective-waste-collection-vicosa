/* ==========================================================================
   Acessibilidade — Coleta Seletiva de Viçosa
   - Aumentar fonte
   - Modo para daltonismo (paleta + ícones/formatos; ver style.css)
   - Leitura em voz alta (Web Speech API, 100% no navegador, sem backend)
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    /* ---------- Armazenamento seguro (localStorage pode falhar) ---------- */
    const store = {
        get(key) {
            try { return localStorage.getItem(key); } catch (error) { return null; }
        },
        set(key, value) {
            try { localStorage.setItem(key, String(value)); } catch (error) { /* ignora */ }
        }
    };

    const getBool = (key) => store.get(key) === "true";

    /* ---------- Elementos já existentes no HTML ---------- */
    const accessibilityButton = document.getElementById("accessibility-button");
    const accessibilityPanel = document.getElementById("accessibility-panel");
    const closeAccessibility = document.getElementById("close-accessibility");

    const fontToggle = document.getElementById("font-toggle");
    const colorToggle = document.getElementById("color-toggle");
    const readerToggle = document.getElementById("reader-toggle");

    const root = document.documentElement;

    /* ---------- Link "Pular para o conteúdo" ---------- */
    const mainElement = document.querySelector("main");

    if (mainElement) {
        if (!mainElement.id) mainElement.id = "main-content";
        mainElement.setAttribute("tabindex", "-1");

        const skipLink = document.createElement("a");
        skipLink.className = "skip-link";
        skipLink.href = `#${mainElement.id}`;
        skipLink.textContent = "Pular para o conteúdo principal";
        skipLink.addEventListener("click", (event) => {
            event.preventDefault();
            mainElement.focus();
            mainElement.scrollIntoView();
        });
        document.body.prepend(skipLink);
    }

    /* ---------- Painel de acessibilidade ---------- */
    /* Controles de acessibilidade não passam pela regra "toque 2x" da leitura */
    accessibilityPanel?.setAttribute("data-reader-ui", "");
    accessibilityButton?.setAttribute("data-reader-ui", "");

    const openPanel = () => {
        accessibilityPanel.hidden = false;
        accessibilityButton.setAttribute("aria-expanded", "true");
        (fontToggle || closeAccessibility)?.focus();
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

    /* ---------- Aumentar fonte ---------- */
    const fontEnabled = getBool("largeFont");
    root.classList.toggle("large-font", fontEnabled);

    if (fontToggle) {
        fontToggle.checked = fontEnabled;
        fontToggle.addEventListener("change", () => {
            root.classList.toggle("large-font", fontToggle.checked);
            store.set("largeFont", fontToggle.checked);
        });
    }

    /* ---------- Modo para daltonismo ---------- */
    const colorEnabled = getBool("colorblindMode");
    document.body.classList.toggle("colorblind-mode", colorEnabled);

    if (colorToggle) {
        colorToggle.checked = colorEnabled;
        colorToggle.addEventListener("change", () => {
            document.body.classList.toggle("colorblind-mode", colorToggle.checked);
            store.set("colorblindMode", colorToggle.checked);
        });
    }

    /* ======================================================================
       LEITURA EM VOZ ALTA
       ====================================================================== */
    const supportsSpeech =
        "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;

    let readerEnabled = supportsSpeech && getBool("readerEnabled");
    let rate = parseFloat(store.get("readerRate")) || 0.95;
    let ptVoice = null;
    let speakToken = 0;
    let highlighted = null;
    let armedElement = null;
    let armedTimer = null;
    let hintCount = 0;

    const RATE_OPTIONS = [
        ["0.75", "Lenta"],
        ["0.95", "Normal"],
        ["1.2", "Rápida"]
    ];

    /* Elementos que podem ser lidos ao clicar/tocar */
    const READABLE_SELECTOR = [
        "h1", "h2", "h3", "h4", "h5", "legend", "label", "p", "li", "td", "th",
        "dt", "dd", "summary", "button", "a[href]", "[role='button']",
        ".profile-name", ".profile-description", ".section-tag",
        ".material-status", ".pev-status", ".request-status",
        ".collection-status", ".empty-message", "[data-tts]"
    ].join(",");

    const ACTIONABLE_SELECTOR = "a[href], button, [role='button']";

    /* ---------- Voz em português ---------- */
    const pickVoice = () => {
        if (!supportsSpeech) return;

        const voices = window.speechSynthesis.getVoices();
        const normalize = (voice) => voice.lang.replace("_", "-").toLowerCase();

        ptVoice =
            voices.find((voice) => normalize(voice) === "pt-br") ||
            voices.find((voice) => normalize(voice).startsWith("pt")) ||
            null;
    };

    if (supportsSpeech) {
        pickVoice();
        window.speechSynthesis.addEventListener?.("voiceschanged", pickVoice);
    }

    /* ---------- Limpeza e extração de texto ---------- */
    const clean = (text) =>
        text
            .replace(/[\p{Extended_Pictographic}\uFE0F\u200D]/gu, " ")
            .replace(/[←→↑↓×✓✕✔✖]/g, " ")
            .replace(/\s+/g, " ")
            .trim();

    const textOf = (element) => {
        const ariaLabel = element.getAttribute("aria-label");
        if (ariaLabel) return clean(ariaLabel);

        const text = clean(element.innerText || element.textContent || "");
        return text || clean(element.getAttribute("title") || "");
    };

    const describeField = (field) => {
        const parts = [];
        const labelElement = field.labels && field.labels[0];
        const label = labelElement
            ? textOf(labelElement)
            : clean(field.getAttribute("aria-label") || "");

        if (label) parts.push(label);

        const type = (field.type || "").toLowerCase();

        if (field.tagName === "SELECT") {
            const option = field.selectedOptions && field.selectedOptions[0];
            parts.push("lista de opções");
            if (option) parts.push(`selecionado: ${clean(option.textContent)}`);
        } else if (type === "checkbox") {
            parts.push(field.checked ? "marcado" : "não marcado");
        } else if (type === "radio") {
            parts.push(field.checked ? "selecionado" : "não selecionado");
        } else if (type === "password") {
            parts.push("campo de senha");
        } else if (type === "file") {
            parts.push("seleção de arquivo");
        } else if (field.value) {
            parts.push(`preenchido com ${clean(field.value)}`);
        } else if (field.placeholder) {
            parts.push(`campo de texto. Dica: ${clean(field.placeholder)}`);
        } else {
            parts.push("campo de texto");
        }

        if (field.required) parts.push("obrigatório");

        return parts.join(". ");
    };

    /* ---------- Destaque do trecho lido ---------- */
    const clearHighlight = () => {
        highlighted?.classList.remove("tts-reading");
        highlighted = null;
    };

    const highlight = (element) => {
        clearHighlight();

        if (element) {
            highlighted = element;
            element.classList.add("tts-reading");
        }
    };

    /* ---------- Divide em frases (evita corte em textos longos no Chrome) ---------- */
    const splitText = (text) => {
        const normalized = text.replace(/\s+/g, " ").trim();
        const sentences = normalized.match(/[^.!?;:]+[.!?;:]?\s*/g) || [normalized];
        const chunks = [];
        let current = "";

        sentences.forEach((sentence) => {
            if (current && (current + sentence).length > 160) {
                chunks.push(current.trim());
                current = sentence;
            } else {
                current += sentence;
            }
        });

        if (current.trim()) chunks.push(current.trim());

        return chunks;
    };

    /* ---------- Falar / parar ---------- */
    const stopSpeaking = () => {
        speakToken += 1;
        if (supportsSpeech) window.speechSynthesis.cancel();
        clearHighlight();
    };

    const speak = (rawText, options = {}) => {
        const { element = null, force = false } = options;

        if (!supportsSpeech || (!readerEnabled && !force)) return;

        const chunks = splitText(clean(rawText));
        if (!chunks.length) return;

        const synth = window.speechSynthesis;
        const token = ++speakToken;
        const wasBusy = synth.speaking || synth.pending;

        synth.cancel();

        const start = () => {
            if (token !== speakToken) return;

            highlight(element);

            chunks.forEach((chunk, index) => {
                const utterance = new SpeechSynthesisUtterance(chunk);
                utterance.lang = "pt-BR";
                utterance.rate = rate;
                if (ptVoice) utterance.voice = ptVoice;

                if (index === chunks.length - 1) {
                    const finish = () => {
                        if (token === speakToken) clearHighlight();
                    };
                    utterance.onend = finish;
                    utterance.onerror = finish;
                }

                synth.speak(utterance);
            });
        };

        /* Pequena pausa só quando havia fala em andamento (cancel + speak imediato falha em alguns navegadores) */
        if (wasBusy) {
            setTimeout(start, 60);
        } else {
            start();
        }
    };

    /* ---------- Barra de controle da leitura ---------- */
    let toolbar = null;

    const buildToolbar = () => {
        toolbar = document.createElement("div");
        toolbar.className = "reader-toolbar";
        toolbar.setAttribute("role", "region");
        toolbar.setAttribute("aria-label", "Controles da leitura em voz alta");
        toolbar.setAttribute("data-reader-ui", "");
        toolbar.hidden = true;

        toolbar.innerHTML = `
            <button type="button" data-reader-action="page">
                <span aria-hidden="true">🔊</span> Ler a página
            </button>
            <button type="button" data-reader-action="stop">
                <span aria-hidden="true">⏹</span> Parar
            </button>
            <label for="reader-rate">
                Velocidade
                <select id="reader-rate">
                    ${RATE_OPTIONS.map(([value, label]) =>
                        `<option value="${value}">${label}</option>`).join("")}
                </select>
            </label>
        `;

        document.body.appendChild(toolbar);

        const rateSelect = toolbar.querySelector("#reader-rate");
        const closest = RATE_OPTIONS.reduce((best, option) =>
            Math.abs(parseFloat(option[0]) - rate) < Math.abs(parseFloat(best[0]) - rate)
                ? option : best);
        rateSelect.value = closest[0];
        rate = parseFloat(closest[0]);

        rateSelect.addEventListener("change", () => {
            rate = parseFloat(rateSelect.value);
            store.set("readerRate", rate);
            const label = RATE_OPTIONS.find(([value]) => value === rateSelect.value)[1];
            speak(`Velocidade ${label.toLowerCase()}.`);
        });

        toolbar.addEventListener("click", (event) => {
            const action = event.target.closest("[data-reader-action]")?.dataset.readerAction;

            if (action === "stop") {
                stopSpeaking();
            } else if (action === "page") {
                const area = mainElement || document.body;
                speak(area.innerText || area.textContent || "");
            }
        });
    };

    const syncReaderUi = () => {
        root.classList.toggle("reader-on", readerEnabled);
        if (toolbar) toolbar.hidden = !readerEnabled;
    };

    if (supportsSpeech) {
        buildToolbar();
    }

    /* ---------- Opção no painel ---------- */
    if (readerToggle) {
        const description = readerToggle
            .closest(".accessibility-option")
            ?.querySelector("p");

        if (!supportsSpeech) {
            readerToggle.disabled = true;
            readerToggle.checked = false;
            if (description) {
                description.textContent =
                    "Seu navegador não oferece leitura em voz alta. Tente o Chrome, Edge, Firefox ou Safari atualizados.";
            }
        } else {
            readerToggle.checked = readerEnabled;

            if (description) {
                description.textContent =
                    "Toque ou clique em um texto para ouvi-lo. Em links e botões, o primeiro toque lê e o segundo abre.";
            }

            readerToggle.addEventListener("change", () => {
                readerEnabled = readerToggle.checked;
                store.set("readerEnabled", readerEnabled);
                syncReaderUi();

                if (readerEnabled) {
                    speak(
                        "Leitura em voz alta ativada. Toque em um texto para ouvi-lo. " +
                        "Em links e botões, toque uma vez para ouvir e outra para abrir.",
                        { force: true }
                    );
                } else {
                    speak("Leitura em voz alta desativada.", { force: true });
                }
            });
        }
    }

    syncReaderUi();

    /* ---------- Clique / toque ---------- */
    const arm = (element) => {
        armedElement = element;
        clearTimeout(armedTimer);
        armedTimer = setTimeout(() => { armedElement = null; }, 8000);
    };

    document.addEventListener("click", (event) => {
        if (!readerEnabled) return;
        if (event.target.closest("[data-reader-ui]")) return;

        /* Texto selecionado tem prioridade */
        const selected = String(window.getSelection ? window.getSelection() : "").trim();
        if (selected) {
            speak(selected);
            return;
        }

        /* Campos e labels de campos: tratados por focus/change */
        if (event.target.closest("input, select, textarea")) return;

        const label = event.target.closest("label");
        if (label && label.control) return;

        const actionable = event.target.closest(ACTIONABLE_SELECTOR);
        const target = actionable || event.target.closest(READABLE_SELECTOR);

        if (!target) return;

        if (actionable) {
            /* 1º clique: lê e bloqueia a ação. 2º clique no mesmo item: executa. */
            if (armedElement !== actionable) {
                event.preventDefault();
                event.stopPropagation();
                arm(actionable);

                const hint = hintCount < 2 ? " Toque novamente para abrir." : "";
                hintCount += 1;

                speak(textOf(actionable) + "." + hint, { element: actionable });
                return;
            }

            armedElement = null;
            return;
        }

        speak(textOf(target), { element: target });
    }, true);

    /* ---------- Teclado: lê o item ao receber foco ---------- */
    document.addEventListener("focusin", (event) => {
        if (!readerEnabled) return;

        const element = event.target;

        if (!(element instanceof HTMLElement) || element === document.body) return;
        if (!element.matches(":focus-visible")) return;

        if (element.matches("input, select, textarea")) {
            speak(describeField(element), { element });
            return;
        }

        if (element.matches(ACTIONABLE_SELECTOR + ", summary")) {
            arm(element);
            speak(textOf(element), { element });
        }
    }, true);

    /* ---------- Mudança de estado em checkbox, radio e select ---------- */
    document.addEventListener("change", (event) => {
        const element = event.target;

        if (!readerEnabled || element.id === "reader-toggle") return;

        if (element.matches("input[type='checkbox'], input[type='radio'], select")) {
            speak(describeField(element));
        }
    });

    /* ---------- Lê avisos e resultados que aparecem na tela ---------- */
    if (supportsSpeech && "MutationObserver" in window) {
        const LIVE_SELECTOR = "[aria-live], [role='status'], [role='alert']";
        let liveTimer = null;

        const observer = new MutationObserver((mutations) => {
            if (!readerEnabled) return;

            const regions = new Set();

            mutations.forEach((mutation) => {
                /* Ignora a classe de destaque da própria leitura (evita laço) */
                if (
                    mutation.type === "attributes" &&
                    mutation.attributeName === "class" &&
                    mutation.target.id !== "system-toast"
                ) {
                    return;
                }

                const node = mutation.target.nodeType === 1
                    ? mutation.target
                    : mutation.target.parentElement;

                const region = node && node.closest(LIVE_SELECTOR);
                if (region) regions.add(region);
            });

            regions.forEach((region) => {
                if (region.hidden || region.closest("[hidden]")) return;

                if (region.id === "system-toast" && !region.classList.contains("visible")) {
                    return;
                }

                const text = textOf(region);
                if (!text) return;

                clearTimeout(liveTimer);
                liveTimer = setTimeout(() => speak(text), 120);
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true,
            attributes: true,
            attributeFilter: ["hidden", "class"]
        });
    }

    /* ---------- Esc: fecha o painel ou interrompe a fala ---------- */
    document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") return;

        if (accessibilityPanel && !accessibilityPanel.hidden) {
            closePanel();
        } else {
            stopSpeaking();
        }
    });

    /* ---------- Ao sair da página, para a fala ---------- */
    window.addEventListener("pagehide", () => {
        if (supportsSpeech) window.speechSynthesis.cancel();
    });
});