document.addEventListener("DOMContentLoaded", () => {
    // ==========================================
    // 1. Counter 
    // ==========================================
    const counters = document.querySelectorAll('.counter[data-target]');
    
    counters.forEach(counter => {
        const updateCount = () => {
            const target = +counter.getAttribute('data-target');
            const count = +counter.innerText;
            const increment = target / 30; 

            if (count < target) {
                counter.innerText = Math.ceil(count + increment);
                setTimeout(updateCount, 40);
            } else {
                counter.innerText = target;
            }
        };

        updateCount();
    });

    // ==========================================
    // 2. Bookmarks 
    // ==========================================
    const savedCountText = document.getElementById("savedCountText");

    function getSavedProjects() {
        return JSON.parse(localStorage.getItem("savedProjects")) || [];
    }

    function updateSavedCount() {
        const savedList = getSavedProjects();
        if (savedCountText) {
            savedCountText.textContent = savedList.length;
        }
    }

    // Initialize the state of the Bookmark button on all cards.
    function initBookmarkButtons() {
        const savedList = getSavedProjects();
        const bookmarkBtns = document.querySelectorAll(".bookmark-btn");

        bookmarkBtns.forEach(btn => {
            const cardId = btn.getAttribute("data-id");
            if (savedList.includes(cardId)) {
                btn.classList.remove("btn-outline-warning");
                btn.classList.add("btn-warning", "text-dark");
                btn.textContent = "★ Saved";
            } else {
                btn.classList.remove("btn-warning", "text-dark");
                btn.classList.add("btn-outline-warning");
                btn.textContent = "⭐ Bookmark";
            }
        });
    }

    // Bind Bookmark button click event
    document.addEventListener("click", (e) => {
        if (e.target && e.target.classList.contains("bookmark-btn")) {
            const btn = e.target;
            const cardId = btn.getAttribute("data-id");
            let savedList = getSavedProjects();

            if (savedList.includes(cardId)) {
                // Cancel
                savedList = savedList.filter(id => id !== cardId);
                btn.classList.remove("btn-warning", "text-dark");
                btn.classList.add("btn-outline-warning");
                btn.textContent = "⭐ Bookmark";
            } else {
                // Add
                savedList.push(cardId);
                btn.classList.remove("btn-outline-warning");
                btn.classList.add("btn-warning", "text-dark");
                btn.textContent = "★ Saved";
            }

            localStorage.setItem("savedProjects", JSON.stringify(savedList));
            updateSavedCount();

            // If the current category is under the SAVED tag, re-filter in real time.
            const activeBtn = document.querySelector("#projectFilters button.active");
            if (activeBtn && activeBtn.getAttribute("data-filter") === "saved") {
                filterProjects();
            }
        }
    });

    // ==========================================
    // 3. Search & Filter 
    // ==========================================
    const searchInput = document.getElementById("projectSearch");
    const filterButtons = document.querySelectorAll("#projectFilters button");
    const projectCards = document.querySelectorAll(".project-card-item");
    const noResults = document.getElementById("noResults");

    function filterProjects() {
        const query = searchInput ? searchInput.value.toLowerCase().trim() : "";
        const activeBtn = document.querySelector("#projectFilters button.active");
        const filterValue = activeBtn ? activeBtn.getAttribute("data-filter") : "all";

        let visibleCount = 0;

        projectCards.forEach(card => {
            const category = card.getAttribute("data-category");
            const cardId = card.getAttribute("data-id");
            
            const titleEl = card.querySelector("h3");
            const descEl = card.querySelector("p");
            const title = titleEl ? titleEl.textContent.toLowerCase() : "";
            const desc = descEl ? descEl.textContent.toLowerCase() : "";

            const matchesSearch = title.includes(query) || desc.includes(query);

            let matchesCategory = false;
            if (filterValue === "all") {
                matchesCategory = true;
            } else if (filterValue === "saved") {
                const savedProjects = getSavedProjects();
                matchesCategory = savedProjects.includes(cardId);
            } else {
                matchesCategory = (category === filterValue);
            }

            if (matchesSearch && matchesCategory) {
                card.style.display = "";
                card.classList.remove("d-none");
                visibleCount++;
            } else {
                card.style.display = "none";
                card.classList.add("d-none");
            }
        });

        if (noResults) {
            if (visibleCount === 0) {
                noResults.classList.remove("d-none");
                noResults.style.display = "block";
            } else {
                noResults.classList.add("d-none");
                noResults.style.display = "none";
            }
        }
    }

    // Bind Filter button event
    filterButtons.forEach(button => {
        button.addEventListener("click", (e) => {
            e.preventDefault();
            filterButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");
            filterProjects();
        });
    });

    // Bind search box event
    if (searchInput) {
        searchInput.addEventListener("input", filterProjects);
    }

    // Initialize the Bookmark status and number on the page
    updateSavedCount();
    initBookmarkButtons();
});