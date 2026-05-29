document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://hayashi-cs-backend-248098265972.asia-northeast1.run.app/public/member-qa';
    const faqListContainer = document.getElementById('faq-list');

    // Initialize toggle behavior for details elements
    function initAccordion(elements) {
        elements.forEach(targetDetails => {
            targetDetails.addEventListener('toggle', () => {
                if (targetDetails.open) {
                    elements.forEach(details => {
                        if (details !== targetDetails && details.open) {
                            details.open = false;
                        }
                    });
                }
            });
        });
    }

    // First, initialize the static ones (just in case the fetch fails or takes time)
    let detailsElements = document.querySelectorAll('.faq-item');
    initAccordion(detailsElements);

    // Fetch and update dynamically
    async function hydrateFaqs() {
        try {
            const res = await fetch(API_URL);
            if (!res.ok) throw new Error("HTTP error " + res.status);
            const faqs = await res.json();
            if (Array.isArray(faqs) && faqs.length > 0) {
                // Clear original items
                faqListContainer.innerHTML = '';

                // Build dynamic list
                faqs.forEach(faq => {
                    const details = document.createElement('details');
                    details.className = 'faq-item';
                    details.name = 'faq-accordion';
                    details.id = `faq-${faq.id}`;

                    const summary = document.createElement('summary');
                    summary.className = 'faq-summary';

                    const qBadge = document.createElement('span');
                    qBadge.className = 'faq-q-badge';
                    qBadge.textContent = 'Q';

                    const qText = document.createElement('span');
                    qText.className = 'faq-question-text';
                    // Support newlines in questions if any
                    qText.innerHTML = faq.question.replace(/\n/g, '<br>');

                    const toggleIcon = document.createElement('span');
                    toggleIcon.className = 'faq-toggle-icon';
                    toggleIcon.innerHTML = '<i class="fa-solid fa-chevron-down"></i>';

                    summary.appendChild(qBadge);
                    summary.appendChild(qText);
                    summary.appendChild(toggleIcon);

                    const answerWrapper = document.createElement('div');
                    answerWrapper.className = 'faq-answer-wrapper';

                    const answerContent = document.createElement('div');
                    answerContent.className = 'faq-answer-content';

                    const aBadge = document.createElement('span');
                    aBadge.className = 'faq-a-badge';
                    aBadge.textContent = 'A';

                    const answerText = document.createElement('div');
                    answerText.className = 'faq-answer-text';

                    // If answer_highlight exists, render it
                    if (faq.answer_highlight) {
                        const highlightP = document.createElement('p');
                        highlightP.className = 'faq-answer-highlight';
                        highlightP.textContent = faq.answer_highlight;
                        answerText.appendChild(highlightP);
                    }

                    // Render paragraphs (split by newline)
                    const paragraphs = faq.answer.split('\n');
                    paragraphs.forEach(pText => {
                        const p = document.createElement('p');
                        
                        // Parse simple links: check if there's an http/https link in the text and convert to a tag with target="_blank"
                        const urlRegex = /(https?:\/\/[^\s]+)/g;
                        if (urlRegex.test(pText)) {
                            p.innerHTML = pText.replace(urlRegex, (url) => {
                                return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
                            });
                        } else {
                            p.textContent = pText;
                        }
                        
                        answerText.appendChild(p);
                    });

                    answerContent.appendChild(aBadge);
                    answerContent.appendChild(answerText);
                    answerWrapper.appendChild(answerContent);

                    details.appendChild(summary);
                    details.appendChild(answerWrapper);

                    faqListContainer.appendChild(details);
                });

                // Re-initialize accordion behavior for new elements
                const dynamicDetails = faqListContainer.querySelectorAll('.faq-item');
                initAccordion(dynamicDetails);
            }
        } catch (e) {
            console.warn("Failed to fetch dynamic FAQs. Fallback to static content.", e);
        }
    }

    // Call hydration
    hydrateFaqs();
});
