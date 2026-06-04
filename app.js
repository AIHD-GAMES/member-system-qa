document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://hayashi-cs-backend-248098265972.asia-northeast1.run.app/public/member-qa';
    const faqListContainer = document.getElementById('faq-list');
    const allowedTags = new Set(['A', 'HR', 'P', 'UL', 'OL', 'LI', 'STRONG', 'B', 'U', 'MARK', 'SPAN']);
    const allowedClasses = new Set(['text-red', 'text-blue', 'text-green', 'text-orange', 'text-gray', 'note', 'warning']);
    const allowedSpanClasses = new Set(['text-red', 'text-blue', 'text-green', 'text-orange', 'text-gray']);
    const hexColorRegex = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

    function appendSafeRichText(target, rawText) {
        const source = String(rawText || '');
        if (!/[<>]/.test(source)) {
            appendPlainTextWithLinks(target, source);
            return;
        }

        const doc = new DOMParser().parseFromString(source, 'text/html');
        Array.from(doc.body.childNodes).forEach(node => {
            target.appendChild(sanitizeNode(node));
        });
    }

    function sanitizeNode(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            return document.createTextNode(node.textContent || '');
        }

        if (node.nodeType !== Node.ELEMENT_NODE) {
            return document.createTextNode('');
        }

        const tagName = node.tagName.toUpperCase();
        if (!allowedTags.has(tagName)) {
            const fragment = document.createDocumentFragment();
            Array.from(node.childNodes).forEach(child => fragment.appendChild(sanitizeNode(child)));
            return fragment;
        }

        const el = document.createElement(tagName.toLowerCase());
        if (tagName === 'A') {
            const href = node.getAttribute('href') || '';
            if (/^https?:\/\//i.test(href)) {
                el.setAttribute('href', href);
                el.setAttribute('target', '_blank');
                el.setAttribute('rel', 'noopener noreferrer');
            }
        }

        const className = node.getAttribute('class') || '';
        const cleanClasses = className.split(/\s+/).filter(name => {
            if (!allowedClasses.has(name)) return false;
            if (tagName === 'SPAN') return allowedSpanClasses.has(name);
            return tagName === 'P';
        });
        if (cleanClasses.length > 0) {
            el.className = cleanClasses.join(' ');
        }

        if (tagName === 'SPAN') {
            const colorMatch = (node.getAttribute('style') || '').match(/(?:^|;)\s*color\s*:\s*(#[0-9a-f]{3}|#[0-9a-f]{6})\s*(?:;|$)/i);
            if (colorMatch && hexColorRegex.test(colorMatch[1])) {
                el.style.color = colorMatch[1];
            }
        }

        Array.from(node.childNodes).forEach(child => el.appendChild(sanitizeNode(child)));
        return el;
    }

    function appendPlainTextWithLinks(target, text) {
        const paragraphs = String(text || '').split('\n');
        paragraphs.forEach(pText => {
            const p = document.createElement('p');
            appendTextWithLinks(p, pText);
            target.appendChild(p);
        });
    }

    function appendTextWithLinks(target, text) {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        let lastIndex = 0;
        let match;

        while ((match = urlRegex.exec(text)) !== null) {
            if (match.index > lastIndex) {
                target.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
            }
            const a = document.createElement('a');
            a.href = match[1];
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.textContent = match[1];
            target.appendChild(a);
            lastIndex = urlRegex.lastIndex;
        }

        if (lastIndex < text.length) {
            target.appendChild(document.createTextNode(text.slice(lastIndex)));
        }
    }

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
                    // Support newlines in questions safely (no innerHTML)
                    qText.style.whiteSpace = 'pre-line';
                    qText.textContent = faq.question;

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

                    appendSafeRichText(answerText, faq.answer);

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
