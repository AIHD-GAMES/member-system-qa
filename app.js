document.addEventListener('DOMContentLoaded', () => {
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
