// assetLoader.js - Preload all images before game start
export async function preloadImages(paths) {
  const promises = paths.map(src => new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = () => {
      console.warn(`Failed to load image: ${src}`);
      resolve(src); // Continue even if one image fails
    };
    img.src = src;
  }));
  
  await Promise.all(promises);
}

export async function preloadAllAssets() {
  // FIXED v3.54: Asset preloading now uses GIF animations
  // PNG spritesheets removed - using GIF animations only
  const assetPaths = [
    // Hero GIF animations
    'assets/heroes/Nova_idle.gif',
    'assets/heroes/Nova_attack.gif',
    'assets/heroes/Nova_Hurt.gif',
    'assets/heroes/Nova_jump.gif',
    'assets/heroes/Luna_idle.gif',
    'assets/heroes/Luna_attack.gif',
    'assets/heroes/Benny_idle.gif',
    'assets/heroes/Benny_attack.gif',
    
    // Enemy GIF animations
    'assets/enemies/Lazy Bat/Lazy Bat-Idlefly-animated.gif',
    'assets/enemies/Lazy Bat/Lazy Bat-Attack-animated.gif',
    
    // Background (keep PNG for backgrounds)
    'assets/backgrounds/default-bg.png',
    'assets/backgrounds/mountain-dusk.png',
    
    // Logo (keep PNG for logo)
    'assets/logo/new-logo.png'
  ];
  
  try {
    await preloadImages(assetPaths);

    return true;
  } catch (error) {
    console.error('Error loading assets:', error);
    return false;
  }
}

