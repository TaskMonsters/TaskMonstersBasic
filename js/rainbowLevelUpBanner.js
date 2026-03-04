// ===================================
// RAINBOW LEVEL UP BANNER
// Shows a colorful animated banner when the monster levels up
// ===================================

function showRainbowLevelUpBanner(newLevel) {
    // Remove any existing banner
    const existing = document.getElementById('rainbowLevelUpBanner');
    if (existing) existing.remove();

    const banner = document.createElement('div');
    banner.id = 'rainbowLevelUpBanner';
    banner.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        z-index: 99999;
        text-align: center;
        padding: 18px 20px;
        font-size: 1.4rem;
        font-weight: 900;
        letter-spacing: 2px;
        text-transform: uppercase;
        color: #fff;
        background: linear-gradient(90deg,
            #ff0080, #ff8c00, #ffe000, #40ff00,
            #00cfff, #8000ff, #ff0080);
        background-size: 200% 100%;
        animation: rainbowSlide 1.2s linear infinite, bannerFadeIn 0.4s ease;
        text-shadow: 0 2px 8px rgba(0,0,0,0.5);
        box-shadow: 0 4px 20px rgba(0,0,0,0.4);
        pointer-events: none;
    `;
    banner.innerHTML = `⭐ LEVEL UP! ⭐ Your monster reached Level ${newLevel}! ⭐`;

    // Inject keyframes if not already present
    if (!document.getElementById('rainbowBannerStyles')) {
        const style = document.createElement('style');
        style.id = 'rainbowBannerStyles';
        style.textContent = `
            @keyframes rainbowSlide {
                0% { background-position: 0% 50%; }
                100% { background-position: 200% 50%; }
            }
            @keyframes bannerFadeIn {
                from { opacity: 0; transform: translateY(-100%); }
                to { opacity: 1; transform: translateY(0); }
            }
            @keyframes bannerFadeOut {
                from { opacity: 1; transform: translateY(0); }
                to { opacity: 0; transform: translateY(-100%); }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(banner);

    // Auto-remove after 4 seconds with fade out
    setTimeout(() => {
        if (banner.parentNode) {
            banner.style.animation = 'bannerFadeOut 0.5s ease forwards';
            setTimeout(() => {
                if (banner.parentNode) banner.remove();
            }, 500);
        }
    }, 4000);
}

// Make globally available
window.showRainbowLevelUpBanner = showRainbowLevelUpBanner;
