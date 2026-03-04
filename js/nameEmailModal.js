// ===================================
// NAME AND EMAIL COLLECTION MODAL
// ===================================

class NameEmailModal {
    constructor() {
        this.formspreeEndpoint = 'https://formspree.io/f/xnnvlkbq';
        this.localStorageKey = 'nameEmailModalCompleted';
    }

    // Check if the modal should be shown
    static shouldShow() {
        return localStorage.getItem('nameEmailModalCompleted') !== 'true';
    }

    // Show the modal
    show() {
        if (!NameEmailModal.shouldShow()) {
            return;
        }

        // Create overlay
        const overlay = document.createElement('div');
        overlay.id = 'nameEmailModalOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10004; /* Higher than simpleOnboarding */
            animation: fadeIn 0.3s ease-out;
        `;

        // Create modal
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border: 3px solid #667eea;
            border-radius: 20px;
            padding: 32px;
            max-width: 400px;
            width: 90%;
            box-shadow: 0 0 40px rgba(102, 126, 234, 0.5);
            animation: scaleIn 0.3s ease-out;
            color: white;
            text-align: center;
            position: relative;
        `;

        // Close button
        const closeButton = document.createElement('button');
        closeButton.textContent = '×';
        closeButton.style.cssText = `
            position: absolute;
            top: 10px;
            right: 15px;
            background: none;
            border: none;
            color: rgba(255, 255, 255, 0.5);
            font-size: 30px;
            cursor: pointer;
            line-height: 1;
            transition: color 0.2s;
        `;
        closeButton.onmouseover = () => closeButton.style.color = 'white';
        closeButton.onmouseout = () => closeButton.style.color = 'rgba(255, 255, 255, 0.5)';
        closeButton.onclick = () => this.complete(overlay);
        modal.appendChild(closeButton);

        // Content
        const icon = '<div style="font-size: 64px; margin-bottom: 16px;">👋</div>';
        const title = '<h2 style="font-size: 24px; margin: 0 0 10px 0; color: #667eea; font-weight: 700;">One Last Thing!</h2>';
        const content = `
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px; color: rgba(255, 255, 255, 0.9);">
                Want exclusive deals on our other tools? Share your email below!
            </p>
        `;

        // Form
        const form = document.createElement('form');
        form.id = 'nameEmailForm';
        form.style.cssText = 'display: flex; flex-direction: column; gap: 15px;';
        form.innerHTML = `
            <div style="text-align: left;">
                <label for="email" style="display: block; margin-bottom: 5px; font-size: 14px; color: #a8b5ff;">Your Email</label>
                <input type="email" id="email" name="email" required 
                    style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #404040; background: #101712; color: white; font-size: 16px;">
            </div>
            <button type="submit" id="submitButton"
                style="padding: 14px 28px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); transition: all 0.2s ease; margin-top: 10px;">
                Let's Go!
            </button>
            <button type="button" id="noThanksButton"
                style="padding: 12px 28px; background: transparent; color: rgba(255, 255, 255, 0.6); border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 10px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s ease; margin-top: 8px;">
                No thank you
            </button>
        `;

        // Form submission handler
        form.onsubmit = async (e) => {
            e.preventDefault();
            const submitButton = document.getElementById('submitButton');
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;

            const formData = new FormData(form);
            
            try {
                const response = await fetch(this.formspreeEndpoint, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {

                    if (typeof showNotification === 'function') {
                        showNotification('Thanks! Your monster is ready to fight!', 'success');
                    }
                } else {
                    console.error('Formspree submission failed', response.status);
                    if (typeof showNotification === 'function') {
                        showNotification('Submission failed. Please try again later.', 'error');
                    }
                }
            } catch (error) {
                console.error('Network error during Formspree submission', error);
                if (typeof showNotification === 'function') {
                    showNotification('Network error. Please check your connection.', 'error');
                }
            } finally {
                // Complete the modal flow regardless of success/failure
                this.complete(overlay);
            }
        };

        // Assemble modal
        modal.innerHTML = closeButton.outerHTML + icon + title + content;
        modal.appendChild(form);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Add No Thanks button handler
        const noThanksButton = document.getElementById('noThanksButton');
        if (noThanksButton) {
            noThanksButton.onclick = () => this.complete(overlay);
            // Add hover effect
            noThanksButton.onmouseover = () => {
                noThanksButton.style.color = 'white';
                noThanksButton.style.borderColor = 'rgba(255, 255, 255, 0.6)';
            };
            noThanksButton.onmouseout = () => {
                noThanksButton.style.color = 'rgba(255, 255, 255, 0.6)';
                noThanksButton.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            };
        }

        // Add animations if not already present (reusing simpleOnboarding's animations)
        if (!document.getElementById('simpleOnboardingAnimations')) {
            const style = document.createElement('style');
            style.id = 'simpleOnboardingAnimations';
            style.textContent = `
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scaleIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            `;
            document.head.appendChild(style);
        }
    }

    // Complete the modal and remove it
    complete(overlay) {
        localStorage.setItem(this.localStorageKey, 'true');
        if (overlay) {
            overlay.style.animation = 'fadeOut 0.3s ease-out forwards';
            setTimeout(() => {
                overlay.remove();
            }, 300);
        }
        // Add fadeOut animation if not present
        if (!document.getElementById('fadeOutAnimation')) {
            const style = document.createElement('style');
            style.id = 'fadeOutAnimation';
            style.textContent = `@keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }`;
            document.head.appendChild(style);
        }
    }
}

window.nameEmailModal = new NameEmailModal();
