document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("workshopSearch");
    const filterSelect = document.getElementById("workshopFilter");
    const workshopCards = document.querySelectorAll(".workshop-card");
    const noWorkshopsDiv = document.getElementById("noWorkshops");

    
    const regModalElem = document.getElementById("registerModal");
    const regModal = regModalElem ? new bootstrap.Modal(regModalElem) : null;
    const regForm = document.getElementById("registrationForm");

    // 1. Retrieve registration and quota status from local storage.
    let registeredWorkshops = JSON.parse(localStorage.getItem("registeredWorkshops")) || [];
    let workshopSeats = JSON.parse(localStorage.getItem("workshopSeats")) || {
        "ws1": 15,
        "ws2": 8
    };

// 2. Supports login status checks for multiple keys (Fix: Added current_user)
    function checkUserLogin() {
        const isLoggedIn = localStorage.getItem("isLoggedIn");
        const currentUser = localStorage.getItem("current_user") || localStorage.getItem("currentUser");
        const user = localStorage.getItem("user");
        const loggedInUser = localStorage.getItem("loggedInUser");

        if (
            isLoggedIn === "true" || 
            isLoggedIn === true || 
            currentUser !== null || 
            user !== null || 
            loggedInUser !== null
        ) {
            return true;
        }

        return false;
    }

    // Toast notification trigger function
    function showToast(message) {
        const toastMsg = document.getElementById("wsToastMsg");
        const toastElem = document.getElementById("wsToast");
        if (toastMsg && toastElem) {
            toastMsg.textContent = message;
            const toast = new bootstrap.Toast(toastElem);
            toast.show();
        }
    }

    // 3. Dynamically update the card UI (slot progress bar and button text).
    function updateCardUI(card) {
        const wsId = card.getAttribute("data-id");
        const btn = card.querySelector(".rsvp-btn");
        const seatsElem = document.getElementById(`seats-${wsId}`);
        const barElem = document.getElementById(`bar-${wsId}`);

        const currentSeats = workshopSeats[wsId] !== undefined ? workshopSeats[wsId] : 20;
        const totalSeats = 30;

        if (registeredWorkshops.includes(wsId)) {
            btn.classList.replace("btn-info", "btn-outline-success");
            btn.textContent = "✓ Registered (Cancel)";
        } else {
            btn.classList.replace("btn-outline-success", "btn-info");
            btn.textContent = "Register Now";
        }

        if (seatsElem && barElem) {
            seatsElem.textContent = `${currentSeats} / ${totalSeats}`;
            const percentage = (currentSeats / totalSeats) * 100;
            barElem.style.width = `${percentage}%`;

            if (currentSeats <= 5) {
                barElem.classList.replace("bg-info", "bg-danger");
            } else {
                barElem.classList.replace("bg-danger", "bg-info");
            }
        }
    }

    
    workshopCards.forEach(card => updateCardUI(card));

    // 4. Real-time search and drop-down menu filtering logic
    function filterWorkshops() {
        const query = searchInput ? searchInput.value.toLowerCase() : "";
        const selectedFilter = filterSelect ? filterSelect.value : "all";
        let visibleCount = 0;

        workshopCards.forEach(card => {
            const title = card.querySelector(".ws-title") ? card.querySelector(".ws-title").textContent.toLowerCase() : "";
            const desc = card.querySelector(".ws-desc") ? card.querySelector(".ws-desc").textContent.toLowerCase() : "";
            const wsId = card.getAttribute("data-id");

            const matchesSearch = title.includes(query) || desc.includes(query);
            let matchesFilter = true;

            if (selectedFilter === "registered") {
                matchesFilter = registeredWorkshops.includes(wsId);
            }

            if (matchesSearch && matchesFilter) {
                card.style.display = "block";
                visibleCount++;
            } else {
                card.style.display = "none";
            }
        });

        if (noWorkshopsDiv) {
            if (visibleCount === 0) {
                noWorkshopsDiv.classList.remove("d-none");
            } else {
                noWorkshopsDiv.classList.add("d-none");
            }
        }
    }

    if (searchInput) searchInput.addEventListener("input", filterWorkshops);
    if (filterSelect) filterSelect.addEventListener("change", filterWorkshops);

    // 5. Click Register (Logic)
    workshopCards.forEach(card => {
        const btn = card.querySelector(".rsvp-btn");
        const wsId = card.getAttribute("data-id");
        const title = card.querySelector(".ws-title") ? card.querySelector(".ws-title").textContent : "Workshop";

        btn.addEventListener("click", () => {
            const loggedIn = checkUserLogin();

            // A. Not logged in: Prompt and redirect to signin.html
            if (!loggedIn) {
                showToast("🔒 Please sign in first to register for workshops.");
                setTimeout(() => {
                    window.location.href = "signin.html";
                }, 1500);
                return;
            }

            // B. You are already logged in. If you have already registered, please click to cancel your registration.
            if (registeredWorkshops.includes(wsId)) {
                registeredWorkshops = registeredWorkshops.filter(id => id !== wsId);
                workshopSeats[wsId] = (workshopSeats[wsId] || 0) + 1;

                localStorage.setItem("registeredWorkshops", JSON.stringify(registeredWorkshops));
                localStorage.setItem("workshopSeats", JSON.stringify(workshopSeats));

                showToast("RSVP cancelled. Your seat has been released.");
                updateCardUI(card);
                filterWorkshops();
            } else {
                // C. Logged in but not registered: A registration form will pop up. (Modal)
                if ((workshopSeats[wsId] || 0) <= 0) {
                    showToast("Sorry, this workshop is fully booked!");
                    return;
                }

                const modalWsId = document.getElementById("modalWsId");
                const modalWsTitle = document.getElementById("modalWsTitle");
                if (modalWsId) modalWsId.value = wsId;
                if (modalWsTitle) modalWsTitle.value = title;

                const userRaw = localStorage.getItem("current_user") || localStorage.getItem("currentUser") || localStorage.getItem("user") || "{}";
                let userObj = {};
                try {
                    userObj = JSON.parse(userRaw);
                } catch(e) {
                    userObj = {};
                }
                const regName = document.getElementById("regName");
                const regEmail = document.getElementById("regEmail");

                if (regName && userObj.name) regName.value = userObj.name;
                if (regEmail && userObj.email) regEmail.value = userObj.email;

                if (regModal) regModal.show();
            }
        });
    });

    //6. Logic for submitting the registration form
    if (regForm) {
        regForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const wsId = document.getElementById("modalWsId").value;

            if (!registeredWorkshops.includes(wsId)) {
                registeredWorkshops.push(wsId);
                workshopSeats[wsId] = Math.max(0, (workshopSeats[wsId] || 1) - 1);

                localStorage.setItem("registeredWorkshops", JSON.stringify(registeredWorkshops));
                localStorage.setItem("workshopSeats", JSON.stringify(workshopSeats));
            }

            if (regModal) regModal.hide();
            showToast("🎉 Registration Successful! Seat reserved.");

            const currentCard = document.querySelector(`.workshop-card[data-id="${wsId}"]`);
            if (currentCard) updateCardUI(currentCard);
            filterWorkshops();
        });
    }
});