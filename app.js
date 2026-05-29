document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const searchInput = document.getElementById('faq-search-input');
    const searchClearBtn = document.getElementById('faq-search-clear');
    const searchCountEl = document.getElementById('search-count');
    const searchVisibleCountEl = document.getElementById('search-visible-count');
    const faqItems = document.querySelectorAll('.faq-item');
    const noResultsMsg = document.getElementById('no-results-msg');
    const resetSearchBtn = document.getElementById('reset-search-btn');

    // Store original HTML content for restoring highlights
    const faqOriginalContent = Array.from(faqItems).map(item => {
        const questionEl = item.querySelector('.faq-question-text');
        const answerEl = item.querySelector('.faq-answer-text');
        return {
            id: item.id,
            questionHTML: questionEl.innerHTML,
            questionText: questionEl.textContent.trim(),
            answerHTML: answerEl.innerHTML,
            answerText: answerEl.textContent.trim()
        };
    });

    let currentSearchQuery = '';

    // ==========================================================================
    // Search and Highlight Helpers
    // ==========================================================================
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function highlightText(html, query) {
        if (!query) return html;
        
        const escapedQuery = escapeRegExp(query);
        // Highlight matching query text, avoiding HTML tags (<...>)
        const regex = new RegExp(`(<[^>]*>)|(${escapedQuery})`, 'gi');
        
        return html.replace(regex, (match, tag, text) => {
            if (tag) return tag;
            return `<mark>${text}</mark>`;
        });
    }

    // ==========================================================================
    // Filter Logic
    // ==========================================================================
    function filterFaqs() {
        const query = currentSearchQuery.toLowerCase().trim();
        let visibleCount = 0;

        faqOriginalContent.forEach(original => {
            const itemEl = document.getElementById(original.id);
            const questionEl = itemEl.querySelector('.faq-question-text');
            const answerEl = itemEl.querySelector('.faq-answer-text');

            const matchesSearch = !query || 
                original.questionText.toLowerCase().includes(query) || 
                original.answerText.toLowerCase().includes(query);

            if (matchesSearch) {
                itemEl.style.display = 'block';
                visibleCount++;

                if (query) {
                    questionEl.innerHTML = highlightText(original.questionHTML, currentSearchQuery);
                    answerEl.innerHTML = highlightText(original.answerHTML, currentSearchQuery);
                    itemEl.open = true; // Auto-open matching items on search
                } else {
                    questionEl.innerHTML = original.questionHTML;
                    answerEl.innerHTML = original.answerHTML;
                    itemEl.open = false; // Close items when search is cleared
                }
            } else {
                itemEl.style.display = 'none';
                itemEl.open = false;
                questionEl.innerHTML = original.questionHTML;
                answerEl.innerHTML = original.answerHTML;
            }
        });

        // Update counts
        if (searchVisibleCountEl) {
            searchVisibleCountEl.textContent = visibleCount;
        }

        // Show/hide empty state
        if (visibleCount === 0) {
            noResultsMsg.removeAttribute('hidden');
        } else {
            noResultsMsg.setAttribute('hidden', '');
        }
    }

    // ==========================================================================
    // Event Listeners
    // ==========================================================================

    // Real-time search inputs
    searchInput.addEventListener('input', (e) => {
        currentSearchQuery = e.target.value;
        
        if (currentSearchQuery) {
            searchClearBtn.removeAttribute('hidden');
        } else {
            searchClearBtn.setAttribute('hidden', '');
        }
        
        filterFaqs();
    });

    // Clear search
    searchClearBtn.addEventListener('click', () => {
        searchInput.value = '';
        currentSearchQuery = '';
        searchClearBtn.setAttribute('hidden', '');
        searchInput.focus();
        filterFaqs();
    });

    // Reset button
    if (resetSearchBtn) {
        resetSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            currentSearchQuery = '';
            searchClearBtn.setAttribute('hidden', '');
            filterFaqs();
            searchInput.focus();
        });
    }

    // Mutually exclusive disclosure fallback
    const detailsElements = document.querySelectorAll('.faq-item');
    detailsElements.forEach(targetDetails => {
        targetDetails.addEventListener('toggle', () => {
            if (targetDetails.open) {
                detailsElements.forEach(details => {
                    if (details !== targetDetails && details.open) {
                        details.open = false;
                    }
                });
            }
        });
    });
});
