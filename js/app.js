
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-back]").forEach((button) => {
        button.addEventListener("click", () => {
            const fallbackUrl = button.dataset.backUrl || "../../index.html";

            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.location.href = fallbackUrl;
            }
        });
    });

    window.showToast = (message, type = "success") => {
        let toast = document.getElementById("system-toast");

        if (!toast) {
            toast = document.createElement("div");
            toast.id = "system-toast";
            toast.className = "system-toast";
            toast.setAttribute("role", "status");
            toast.setAttribute("aria-live", "polite");
            document.body.appendChild(toast);
        }

        toast.textContent = message;
        toast.className = `system-toast visible ${type}`;

        clearTimeout(window.toastTimeout);

        window.toastTimeout = setTimeout(() => {
            toast.classList.remove("visible");
        }, 3500);
    };

    document.querySelectorAll("[data-mock-form]").forEach((form) => {
        form.addEventListener("submit", (event) => {
            event.preventDefault();

            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            const message = form.dataset.successMessage ||
                "Operação realizada com sucesso!";

            window.showToast(message);

            form.dispatchEvent(new CustomEvent("mock:success", {
                bubbles: true
            }));
        });
    });

    document.querySelectorAll("[data-confirm]").forEach((element) => {
        element.addEventListener("click", (event) => {
            const message = element.dataset.confirm;

            if (!window.confirm(message)) {
                event.preventDefault();
            }
        });
    });

    document.querySelectorAll("[data-uppercase]").forEach((input) => {
        input.addEventListener("input", () => {
            input.value = input.value.toUpperCase();
        });
    });

    document.querySelectorAll("[data-current-year]").forEach((element) => {
        element.textContent = new Date().getFullYear();
    });

    const loginForm = document.getElementById("login-form");

    if (loginForm) {
        loginForm.addEventListener("submit", (event) => {
            event.preventDefault();

            if (!loginForm.checkValidity()) {
                loginForm.reportValidity();
                return;
            }

            const perfil = new URLSearchParams(window.location.search)
                .get("perfil");

            const destinations = {
                morador: "../morador/inicio.html",
                comerciante: "../comerciante/inicio.html",
                associacao: "../associacao/inicio.html"
            };

            if (!destinations[perfil]) {
                window.showToast("Perfil de acesso inválido.", "error");
                return;
            }

            window.location.href = destinations[perfil];
        });
    }

    const registerForm = document.getElementById("register-form");

    if (registerForm) {
        const perfil = new URLSearchParams(window.location.search).get("perfil");

        const documentLabel = document.getElementById("document-label");
        const documentInput = document.getElementById("document");
        const businessGroup = document.getElementById("business-group");
        const cnpjGroup = document.getElementById("cnpj-group");
        const businessName = document.getElementById("business-name");
        const cnpjInput = document.getElementById("cnpj");

        if (perfil === "comerciante") {
            documentLabel.textContent = "Documento do responsável (CPF)";
            documentInput.placeholder = "Digite o CPF do responsável";
            businessGroup.hidden = false;
            cnpjGroup.hidden = false;
            businessName.required = true;
            cnpjInput.required = true;
        } else if (perfil === "associacao") {
            documentLabel.textContent = "CNPJ da associação";
            documentInput.placeholder = "Digite o CNPJ da associação";
        } else {
            documentLabel.textContent = "CPF";
            documentInput.placeholder = "Digite seu CPF";
        }

        registerForm.addEventListener("submit", (event) => {
            event.preventDefault();

            if (!registerForm.checkValidity()) {
                registerForm.reportValidity();
                return;
            }

            const password = document.getElementById("password").value;
            const confirmPassword = document.getElementById("confirm-password").value;

            if (password !== confirmPassword) {
                window.showToast("As senhas informadas não coincidem.", "error");
                return;
            }

            window.showToast("Cadastro realizado com sucesso!");

            setTimeout(() => {
                window.location.href = `login.html?perfil=${perfil || "morador"}`;
            }, 1200);
        });

        const loginLink = document.getElementById("login-link");
        loginLink.href = `login.html?perfil=${perfil || "morador"}`;
    }

    const calendarForm = document.getElementById("calendar-form");

    if (calendarForm) {
        calendarForm.addEventListener("submit", (event) => {
            event.preventDefault();

            if (!calendarForm.checkValidity()) {
                calendarForm.reportValidity();
                return;
            }

            const neighborhood = document.getElementById("neighborhood").value;
            const result = document.getElementById("calendar-result");
            const resultTitle = document.getElementById("result-neighborhood");

            resultTitle.textContent = `Calendário de ${neighborhood}`;
            result.hidden = false;

            result.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        });
    }

    const notificationsToggle = document.getElementById("notifications-toggle");

    if (notificationsToggle) {
        notificationsToggle.checked =
            localStorage.getItem("notificationsEnabled") !== "false";

        const updateNotificationLabel = () => {
            const label = notificationsToggle.nextElementSibling;

            if (label) {
                label.textContent = notificationsToggle.checked
                    ? "Notificações ativadas"
                    : "Notificações desativadas";
            }
        };

        updateNotificationLabel();

        notificationsToggle.addEventListener("change", () => {
            localStorage.setItem(
                "notificationsEnabled",
                String(notificationsToggle.checked)
            );

            updateNotificationLabel();

            window.showToast(
                notificationsToggle.checked
                    ? "Notificações ativadas."
                    : "Notificações desativadas."
            );
        });
    }

    const materialSearch = document.getElementById("material-search");
    const materialCategory = document.getElementById("material-category");

    if (materialSearch && materialCategory) {
        const materialCards = document.querySelectorAll(".material-card");
        const emptyMessage = document.getElementById("catalog-empty");

        const filterMaterials = () => {
            const search = materialSearch.value
                .trim()
                .toLocaleLowerCase("pt-BR");

            const category = materialCategory.value;
            let visibleCount = 0;

            materialCards.forEach((card) => {
                const matchesSearch = card.textContent
                    .toLocaleLowerCase("pt-BR")
                    .includes(search);

                const matchesCategory =
                    category === "todos" || card.dataset.category === category;

                const visible = matchesSearch && matchesCategory;

                card.hidden = !visible;

                if (visible) visibleCount++;
            });

            emptyMessage.hidden = visibleCount > 0;
        };

        materialSearch.addEventListener("input", filterMaterials);
        materialCategory.addEventListener("change", filterMaterials);
    }

    const questionForm = document.getElementById("question-form");

    if (questionForm) {
        const questionText = document.getElementById("question-text");
        const questionImage = document.getElementById("question-image");
        const questionAudio = document.getElementById("question-audio");
        const questionResult = document.getElementById("question-result");
        const questionAnswer = document.getElementById("question-answer");
        const newQuestionButton = document.getElementById("new-question");

        questionForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const hasText = questionText.value.trim() !== "";
            const hasImage = questionImage.files.length > 0;
            const hasAudio = questionAudio.files.length > 0;

            if (!hasText && !hasImage && !hasAudio) {
                window.showToast("Escreva uma dúvida ou envie uma foto ou áudio.", "error");
                return;
            }

            questionAnswer.textContent =
                "Para realizar o descarte correto, verifique se o material está limpo e seco. Consulte o catálogo para confirmar se ele é aceito pela coleta seletiva.";

            if (hasImage || hasAudio) {
                questionAnswer.textContent +=
                    " O arquivo foi recebido pelo protótipo, mas não foi analisado automaticamente.";
            }

            questionForm.hidden = true;
            questionResult.hidden = false;
            questionResult.scrollIntoView({ behavior: "smooth", block: "start" });
        });

        newQuestionButton.addEventListener("click", () => {
            questionForm.reset();
            questionResult.hidden = true;
            questionForm.hidden = false;
            questionForm.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    }

    const extraCollectionForm = document.getElementById("extra-collection-form");

    if (extraCollectionForm) {
        const extraCollectionResult = document.getElementById("extra-collection-result");

        extraCollectionForm.addEventListener("submit", (event) => {
            event.preventDefault();

            if (!extraCollectionForm.checkValidity()) {
                extraCollectionForm.reportValidity();
                return;
            }

            extraCollectionResult.hidden = false;

            extraCollectionResult.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        });
    }

    const scheduleForm = document.getElementById("schedule-form");

    if (scheduleForm) {
        const scheduleDate = document.getElementById("schedule-date");
        const scheduleResult = document.getElementById("schedule-result");

        const today = new Date();
        const localToday = new Date(
            today.getTime() - today.getTimezoneOffset() * 60000
        ).toISOString().split("T")[0];

        scheduleDate.min = localToday;

        scheduleForm.addEventListener("submit", (event) => {
            event.preventDefault();

            if (!scheduleForm.checkValidity()) {
                scheduleForm.reportValidity();
                return;
            }

            if (scheduleDate.value < localToday) {
                window.showToast("Selecione uma data futura.", "error");
                return;
            }

            scheduleResult.hidden = false;

            scheduleResult.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        });
    }


    const pevForm = document.getElementById("pev-form");

    if (pevForm) {
        const selectedPev = document.getElementById("selected-pev");
        const pevCode = document.getElementById("pev-code");
        const pevResult = document.getElementById("pev-result");

        document.querySelectorAll(".select-pev-button:not(:disabled)").forEach((button) => {
            button.addEventListener("click", () => {
                selectedPev.value = button.dataset.pev;
                pevResult.hidden = true;

                selectedPev.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
            });
        });

        pevCode.addEventListener("input", () => {
            pevCode.value = pevCode.value.replace(/\D/g, "").slice(0, 4);
        });

        pevForm.addEventListener("submit", (event) => {
            event.preventDefault();

            if (!pevForm.checkValidity()) {
                pevForm.reportValidity();
                return;
            }

            if (!selectedPev.value) {
                window.showToast("Selecione um PEV antes de confirmar.", "error");
                return;
            }

            pevResult.hidden = false;

            pevResult.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

            pevForm.reset();
        });
    }

    const requestCards = document.querySelectorAll(".request-card");

    if (requestCards.length) {
        const searchInput = document.getElementById("request-search");
        const statusFilter = document.getElementById("request-status-filter");
        const emptyMessage = document.getElementById("request-empty");
        const detailPanel = document.getElementById("request-detail-panel");
        const detailContent = document.getElementById("request-detail-content");
        const closeDetails = document.getElementById("close-request-details");

        const filterRequests = () => {
            const search = searchInput.value.trim().toLocaleLowerCase("pt-BR");
            const status = statusFilter.value;
            let visibleCount = 0;

            requestCards.forEach((card) => {
                const matchesSearch = card.querySelector("h2").textContent
                    .toLocaleLowerCase("pt-BR").includes(search);
                const matchesStatus = status === "todos" || card.dataset.status === status;
                const visible = matchesSearch && matchesStatus;

                card.hidden = !visible;
                if (visible) visibleCount++;
            });

            emptyMessage.hidden = visibleCount > 0;
        };

        searchInput.addEventListener("input", filterRequests);
        statusFilter.addEventListener("change", filterRequests);

        document.querySelectorAll("[data-request-action]").forEach((button) => {
            button.addEventListener("click", () => {
                const card = button.closest(".request-card");
                const action = button.dataset.requestAction;
                const statusElement = card.querySelector(".request-status");

                const labels = {
                    aprovada: ["Aprovada", "approved"],
                    recusada: ["Recusada", "rejected"],
                    concluida: ["Concluída", "completed"]
                };

                card.dataset.status = action;
                statusElement.textContent = labels[action][0];
                statusElement.className = `request-status ${labels[action][1]}`;

                card.querySelectorAll("[data-request-action]").forEach((actionButton) => {
                    actionButton.remove();
                });

                window.showToast(`Solicitação ${labels[action][0].toLocaleLowerCase("pt-BR")}.`);
                filterRequests();
            });
        });

        document.querySelectorAll("[data-request-details]").forEach((button) => {
            button.addEventListener("click", () => {
                const details = button.dataset.requestDetails.split("|");

                detailContent.replaceChildren();

                details.forEach((value, index) => {
                    const paragraph = document.createElement("p");
                    paragraph.textContent = index === 0
                        ? `Estabelecimento: ${value}`
                        : value;
                    detailContent.appendChild(paragraph);
                });

                detailPanel.hidden = false;
                detailPanel.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
            });
        });

        closeDetails.addEventListener("click", () => {
            detailPanel.hidden = true;
        });
    }

    
    const associationCalendarForm = document.getElementById("association-calendar-form");

    if (associationCalendarForm) {
        const neighborhoodInput = document.getElementById("calendar-neighborhood");
        const weekdayInput = document.getElementById("calendar-weekday");
        const timeInput = document.getElementById("calendar-time");
        const notesInput = document.getElementById("calendar-notes");
        const calendarList = document.getElementById("registered-calendars");
        const searchInput = document.getElementById("calendar-search");
        const emptyMessage = document.getElementById("calendar-empty");
        const submitButton = associationCalendarForm.querySelector('[type="submit"]');

        let editingCard = null;

        const cancelButton = document.createElement("button");
        cancelButton.type = "button";
        cancelButton.className = "secondary-button";
        cancelButton.textContent = "Cancelar alteração";
        cancelButton.hidden = true;
        submitButton.insertAdjacentElement("afterend", cancelButton);

        const filterCalendars = () => {
            const search = searchInput.value.trim().toLocaleLowerCase("pt-BR");
            let visibleCount = 0;

            calendarList.querySelectorAll(".registered-calendar").forEach((card) => {
                const visible = card.querySelector("h3").textContent
                    .toLocaleLowerCase("pt-BR").includes(search);

                card.hidden = !visible;
                if (visible) visibleCount++;
            });

            emptyMessage.hidden = visibleCount > 0;
        };

        const createActionButtons = (card) => {
            const actions = document.createElement("div");
            actions.className = "calendar-actions";

            const editButton = document.createElement("button");
            editButton.type = "button";
            editButton.className = "edit-calendar-button";
            editButton.textContent = "Alterar";

            const removeButton = document.createElement("button");
            removeButton.type = "button";
            removeButton.className = "remove-calendar-button";
            removeButton.textContent = "Remover";

            actions.append(editButton, removeButton);
            card.appendChild(actions);
        };

        calendarList.querySelectorAll(".registered-calendar").forEach((card) => {
            if (!card.querySelector(".edit-calendar-button")) {
                createActionButtons(card);
            }
        });

        const finishEditing = () => {
            editingCard = null;
            associationCalendarForm.reset();
            submitButton.textContent = "Cadastrar calendário";
            cancelButton.hidden = true;
        };

        cancelButton.addEventListener("click", () => {
            finishEditing();
            window.showToast("Alteração cancelada.");
        });

        calendarList.addEventListener("click", (event) => {
            const editButton = event.target.closest(".edit-calendar-button");
            const removeButton = event.target.closest(".remove-calendar-button");

            if (editButton) {
                const card = editButton.closest(".registered-calendar");
                const paragraphs = card.querySelectorAll("p");

                editingCard = card;
                neighborhoodInput.value = card.querySelector("h3").textContent.trim();
                weekdayInput.value = paragraphs[0].textContent.replace("Dia:", "").trim();
                timeInput.value = paragraphs[1].textContent.replace("Horário:", "").trim();

                const notesParagraph = Array.from(paragraphs).find((paragraph) =>
                    paragraph.textContent.startsWith("Observações:")
                );

                notesInput.value = notesParagraph
                    ? notesParagraph.textContent.replace("Observações:", "").trim()
                    : card.dataset.notes || "";

                submitButton.textContent = "Salvar alterações";
                cancelButton.hidden = false;

                associationCalendarForm.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

                neighborhoodInput.focus();
            }

            if (removeButton) {
                const card = removeButton.closest(".registered-calendar");

                if (editingCard === card) {
                    finishEditing();
                }

                if (!window.confirm("Deseja remover este calendário?")) return;

                card.remove();
                filterCalendars();
                window.showToast("Calendário removido.");
            }
        });

        searchInput.addEventListener("input", filterCalendars);

        associationCalendarForm.addEventListener("submit", (event) => {
            event.preventDefault();

            if (!associationCalendarForm.checkValidity()) {
                associationCalendarForm.reportValidity();
                return;
            }

            const neighborhood = neighborhoodInput.value.trim();
            const weekday = weekdayInput.value;
            const time = timeInput.value;
            const notes = notesInput.value.trim();

            const duplicate = Array.from(
                calendarList.querySelectorAll(".registered-calendar")
            ).some((card) => {
                if (card === editingCard) return false;

                return card.querySelector("h3").textContent
                    .trim()
                    .toLocaleLowerCase("pt-BR") === neighborhood.toLocaleLowerCase("pt-BR");
            });

            if (duplicate) {
                window.showToast("Este bairro já possui um calendário cadastrado.", "error");
                return;
            }

            let card = editingCard;

            if (!card) {
                card = document.createElement("article");
                card.className = "registered-calendar";
                createActionButtons(card);
                calendarList.appendChild(card);
            }

            const details = document.createElement("div");

            const title = document.createElement("h3");
            title.textContent = neighborhood;

            const day = document.createElement("p");
            day.innerHTML = `<strong>Dia:</strong> ${weekday}`;

            const hour = document.createElement("p");
            hour.innerHTML = `<strong>Horário:</strong> ${time}`;

            details.append(title, day, hour);

            if (notes) {
                const observation = document.createElement("p");
                observation.innerHTML = "<strong>Observações:</strong> ";
                observation.appendChild(document.createTextNode(notes));
                details.appendChild(observation);
            }

            card.dataset.notes = notes;
            card.replaceChildren(details, card.querySelector(".calendar-actions"));

            const wasEditing = editingCard !== null;

            finishEditing();
            filterCalendars();

            window.showToast(
                wasEditing
                    ? "Calendário alterado com sucesso."
                    : "Calendário cadastrado com sucesso."
            );
        });
    }

const collectionForm = document.getElementById("collection-form");

if (collectionForm) {
    const neighborhoodInput = document.getElementById("collection-neighborhood");
    const dateInput = document.getElementById("collection-date");
    const materialInput = document.getElementById("collection-material");
    const weightInput = document.getElementById("collection-weight");
    const teamInput = document.getElementById("collection-team");
    const notesInput = document.getElementById("collection-notes");

    const collectionList = document.getElementById("collection-list");
    const searchInput = document.getElementById("collection-search");
    const materialFilter = document.getElementById("collection-filter-material");
    const emptyMessage = document.getElementById("collection-empty");

    const today = new Date();
    const localToday = new Date(
        today.getTime() - today.getTimezoneOffset() * 60000
    ).toISOString().split("T")[0];

    dateInput.max = localToday;

    const formatDate = (date) => {
        const [year, month, day] = date.split("-");
        return `${day}/${month}/${year}`;
    };

    const filterCollections = () => {
        const search = searchInput.value.trim().toLocaleLowerCase("pt-BR");
        const material = materialFilter.value;
        let visibleCount = 0;

        collectionList.querySelectorAll(".collection-card").forEach((card) => {
            const neighborhood = card.querySelector("h3").textContent
                .toLocaleLowerCase("pt-BR");

            const matchesSearch = neighborhood.includes(search);
            const matchesMaterial = material === "todos" ||
                card.dataset.material === material;

            const visible = matchesSearch && matchesMaterial;
            card.hidden = !visible;

            if (visible) visibleCount++;
        });

        emptyMessage.hidden = visibleCount > 0;
    };

    searchInput.addEventListener("input", filterCollections);
    materialFilter.addEventListener("change", filterCollections);

    collectionForm.addEventListener("submit", (event) => {
        event.preventDefault();

        if (!collectionForm.checkValidity()) {
            collectionForm.reportValidity();
            return;
        }

        if (dateInput.value > localToday) {
            window.showToast("A data da coleta não pode ser futura.", "error");
            return;
        }

        const card = document.createElement("article");
        card.className = "collection-card";
        card.dataset.material = materialInput.value;

        const details = document.createElement("div");

        const title = document.createElement("h3");
        title.textContent = neighborhoodInput.value.trim();

        const values = [
            ["Data:", formatDate(dateInput.value)],
            ["Material:", materialInput.value],
            ["Peso:", `${weightInput.value} kg`],
            ["Equipe:", teamInput.value.trim()]
        ];

        values.forEach(([label, value]) => {
            const paragraph = document.createElement("p");
            const strong = document.createElement("strong");

            strong.textContent = `${label} `;
            paragraph.append(strong, document.createTextNode(value));
            details.appendChild(paragraph);
        });

        if (notesInput.value.trim()) {
            const paragraph = document.createElement("p");
            const strong = document.createElement("strong");

            strong.textContent = "Observações: ";
            paragraph.append(strong, document.createTextNode(notesInput.value.trim()));
            details.appendChild(paragraph);
        }

        const status = document.createElement("span");
        status.className = "collection-status";
        status.textContent = "Concluída";

        card.append(details, status);
        collectionList.prepend(card);

        collectionForm.reset();
        filterCollections();

        window.showToast("Coleta registrada com sucesso.");
    });
}



});
