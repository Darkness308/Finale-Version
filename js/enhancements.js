/**
 * Advanced Enhancements Module
 * Performance, Mobile Optimization, Hidden Features, A11y++
 * Version: 2.0.0
 */

// ============================================
// 🚀 PERFORMANCE OPTIMIZATIONS
// ============================================

export const PerformanceUtils = {
  /**
   * Debounce function - delays execution until after calls have stopped
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} - Debounced function
   */
  debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Throttle function - limits execution frequency
   * @param {Function} func - Function to throttle
   * @param {number} limit - Minimum time between executions
   * @returns {Function} - Throttled function
   */
  throttle(func, limit = 100) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  /**
   * Lazy load images with Intersection Observer
   * @param {string} selector - CSS selector for images
   */
  lazyLoadImages(selector = 'img[data-src]') {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            observer.unobserve(img);
          }
        });
      });

      document.querySelectorAll(selector).forEach(img => {
        imageObserver.observe(img);
      });
    }
  },

  /**
   * Request Idle Callback wrapper with fallback
   * @param {Function} callback - Function to execute when idle
   * @param {Object} options - Options for requestIdleCallback
   */
  runWhenIdle(callback, options = {}) {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(callback, options);
    } else {
      setTimeout(callback, 1);
    }
  },

  /**
   * Virtual Scrolling for large lists
   * @param {HTMLElement} container - Container element
   * @param {Array} items - All items to render
   * @param {Function} renderItem - Function to render single item
   * @param {number} itemHeight - Height of each item
   */
  virtualScroll(container, items, renderItem, itemHeight = 80) {
    let scrollTop = 0;
    const viewportHeight = container.clientHeight;
    const totalHeight = items.length * itemHeight;

    // Create spacer
    const spacer = document.createElement('div');
    spacer.style.height = `${totalHeight}px`;
    container.appendChild(spacer);

    const render = () => {
      const startIndex = Math.floor(scrollTop / itemHeight);
      const endIndex = Math.min(
        items.length,
        Math.ceil((scrollTop + viewportHeight) / itemHeight)
      );

      // Clear existing items
      Array.from(container.children).forEach(child => {
        if (child !== spacer) {
          child.remove();
        }
      });

      // Render visible items
      for (let i = startIndex; i < endIndex; i++) {
        const item = renderItem(items[i], i);
        item.style.position = 'absolute';
        item.style.top = `${i * itemHeight}px`;
        item.style.left = '0';
        item.style.right = '0';
        container.appendChild(item);
      }
    };

    container.addEventListener('scroll', this.throttle(() => {
      scrollTop = container.scrollTop;
      render();
    }, 16)); // 60fps

    render();
  }
};

// ============================================
// 📱 MOBILE OPTIMIZATIONS
// ============================================

export const MobileUtils = {
  /**
   * Detect touch device
   * @returns {boolean} - True if touch device
   */
  isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },

  /**
   * Add swipe gesture detection
   * @param {HTMLElement} element - Element to attach swipe
   * @param {Object} handlers - { left, right, up, down }
   * @param {number} threshold - Minimum swipe distance
   */
  addSwipeGesture(element, handlers = {}, threshold = 50) {
    let startX = 0;
    let startY = 0;
    let startTime = 0;

    element.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startTime = Date.now();
    }, { passive: true });

    element.addEventListener('touchend', (e) => {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const endTime = Date.now();

      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const duration = endTime - startTime;

      // Fast swipe (< 300ms)
      if (duration < 300) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          // Horizontal swipe
          if (Math.abs(deltaX) > threshold) {
            if (deltaX > 0 && handlers.right) {
              handlers.right(e);
            } else if (deltaX < 0 && handlers.left) {
              handlers.left(e);
            }
          }
        } else {
          // Vertical swipe
          if (Math.abs(deltaY) > threshold) {
            if (deltaY > 0 && handlers.down) {
              handlers.down(e);
            } else if (deltaY < 0 && handlers.up) {
              handlers.up(e);
            }
          }
        }
      }
    }, { passive: true });
  },

  /**
   * Long press detection
   * @param {HTMLElement} element - Element to detect long press
   * @param {Function} callback - Callback on long press
   * @param {number} duration - Long press duration (ms)
   */
  addLongPress(element, callback, duration = 500) {
    let pressTimer;

    element.addEventListener('touchstart', (e) => {
      pressTimer = setTimeout(() => {
        callback(e);
        this.vibrate([50]); // Short vibration feedback
      }, duration);
    }, { passive: true });

    element.addEventListener('touchend', () => {
      clearTimeout(pressTimer);
    }, { passive: true });

    element.addEventListener('touchmove', () => {
      clearTimeout(pressTimer);
    }, { passive: true });
  },

  /**
   * Haptic feedback (vibration)
   * @param {Array|number} pattern - Vibration pattern in ms
   */
  vibrate(pattern = 50) {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  },

  /**
   * Pinch zoom detection
   * @param {HTMLElement} element - Element to detect pinch
   * @param {Function} callback - Callback with scale value
   */
  addPinchZoom(element, callback) {
    let initialDistance = 0;
    let currentScale = 1;

    const getDistance = (touches) => {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    element.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) {
        initialDistance = getDistance(e.touches);
      }
    }, { passive: true });

    element.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const distance = getDistance(e.touches);
        const scale = distance / initialDistance;
        currentScale = scale;
        callback(scale);
      }
    });
  },

  /**
   * Optimize touch targets (minimum 44x44px WCAG)
   */
  optimizeTouchTargets() {
    const MIN_SIZE = 44; // WCAG 2.1 AAA minimum
    const interactiveElements = document.querySelectorAll(
      'button, a, input, textarea, select, [role="button"], [tabindex]'
    );

    interactiveElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.width < MIN_SIZE || rect.height < MIN_SIZE) {
        el.style.minWidth = `${MIN_SIZE}px`;
        el.style.minHeight = `${MIN_SIZE}px`;
        el.style.display = 'inline-flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
      }
    });
  }
};

// ============================================
// 🗜️ LOCALSTORAGE COMPRESSION
// ============================================

export const CompressionUtils = {
  /**
   * Simple LZ-based compression for localStorage
   * @param {string} str - String to compress
   * @returns {string} - Compressed string
   */
  compress(str) {
    if (!str || str.length === 0) return '';

    const dict = {};
    const data = (str + '').split('');
    const out = [];
    let currChar;
    let phrase = data[0];
    let code = 256;

    for (let i = 1; i < data.length; i++) {
      currChar = data[i];
      if (dict[phrase + currChar] != null) {
        phrase += currChar;
      } else {
        out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
        dict[phrase + currChar] = code;
        code++;
        phrase = currChar;
      }
    }
    out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));

    for (let i = 0; i < out.length; i++) {
      out[i] = String.fromCharCode(out[i]);
    }

    return out.join('');
  },

  /**
   * Decompress LZ-compressed string
   * @param {string} str - Compressed string
   * @returns {string} - Original string
   */
  decompress(str) {
    if (!str || str.length === 0) return '';

    const dict = {};
    const data = (str + '').split('');
    let currChar = data[0];
    let oldPhrase = currChar;
    const out = [currChar];
    let code = 256;
    let phrase;

    for (let i = 1; i < data.length; i++) {
      const currCode = data[i].charCodeAt(0);
      if (currCode < 256) {
        phrase = data[i];
      } else {
        phrase = dict[currCode] ? dict[currCode] : oldPhrase + currChar;
      }
      out.push(phrase);
      currChar = phrase.charAt(0);
      dict[code] = oldPhrase + currChar;
      code++;
      oldPhrase = phrase;
    }

    return out.join('');
  },

  /**
   * Get compressed localStorage size
   * @returns {Object} - Size statistics
   */
  getStorageStats() {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += (localStorage[key].length + key.length) * 2; // UTF-16
      }
    }

    return {
      used: total,
      usedKB: (total / 1024).toFixed(2),
      usedMB: (total / 1024 / 1024).toFixed(2),
      available: 5 * 1024 * 1024, // ~5MB typical limit
      percentUsed: ((total / (5 * 1024 * 1024)) * 100).toFixed(2)
    };
  }
};

// ============================================
// 🎮 HIDDEN FEATURES & EASTER EGGS
// ============================================

export const HiddenFeatures = {
  /**
   * Konami Code Easter Egg
   * ↑ ↑ ↓ ↓ ← → ← → B A
   */
  initKonamiCode(callback) {
    const konamiCode = [
      'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
      'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
      'b', 'a'
    ];
    let konamiIndex = 0;

    document.addEventListener('keydown', (e) => {
      const key = e.key.toLowerCase();
      if (key === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
          konamiIndex = 0;
          callback();
        }
      } else {
        konamiIndex = 0;
      }
    });
  },

  /**
   * Dev Console (Ctrl+Shift+D)
   */
  initDevConsole() {
    let devMode = false;

    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        devMode = !devMode;
        this.toggleDevConsole(devMode);
      }
    });
  },

  toggleDevConsole(show) {
    let console = document.getElementById('dev-console');

    if (!console && show) {
      console = document.createElement('div');
      console.id = 'dev-console';
      console.style.cssText = `
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: 200px;
        background: rgba(0, 0, 0, 0.95);
        border-top: 2px solid #FFD700;
        color: #00FF00;
        font-family: 'Courier New', monospace;
        font-size: 12px;
        padding: 10px;
        overflow-y: auto;
        z-index: 10000;
        box-shadow: 0 -4px 20px rgba(255, 215, 0, 0.3);
      `;

      console.innerHTML = `
        <div style="color: #FFD700; font-weight: bold; margin-bottom: 10px;">
          🔧 DEV CONSOLE ACTIVATED
        </div>
        <div id="dev-log"></div>
      `;

      document.body.appendChild(console);

      // Intercept console.log
      const originalLog = console.log;
      window.console.log = (...args) => {
        originalLog.apply(console, args);
        const logDiv = document.getElementById('dev-log');
        if (logDiv) {
          const entry = document.createElement('div');
          entry.textContent = `> ${args.join(' ')}`;
          entry.style.marginBottom = '5px';
          logDiv.appendChild(entry);
          logDiv.scrollTop = logDiv.scrollHeight;
        }
      };
    } else if (console && !show) {
      console.remove();
    }
  },

  /**
   * Theme Switcher (Secret: Triple-click logo)
   */
  initSecretThemes() {
    const themes = [
      { name: 'default', colors: { primary: '#FFD700', bg: '#000000' } },
      { name: 'ocean', colors: { primary: '#00CED1', bg: '#001a33' } },
      { name: 'forest', colors: { primary: '#32CD32', bg: '#0a1f0a' } },
      { name: 'sunset', colors: { primary: '#FF6347', bg: '#1a0a00' } },
      { name: 'lavender', colors: { primary: '#E6E6FA', bg: '#1a0033' } }
    ];
    let currentTheme = 0;

    const logo = document.querySelector('h1') || document.querySelector('.logo');
    if (!logo) return;

    let clickCount = 0;
    let clickTimer;

    logo.addEventListener('click', () => {
      clickCount++;
      clearTimeout(clickTimer);

      if (clickCount === 3) {
        currentTheme = (currentTheme + 1) % themes.length;
        const theme = themes[currentTheme];

        document.documentElement.style.setProperty('--color-gold', theme.colors.primary);
        document.body.style.background = theme.colors.bg;

        // Show theme name
        const toast = document.createElement('div');
        toast.textContent = `🎨 Theme: ${theme.name}`;
        toast.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 12px 24px;
          background: ${theme.colors.primary};
          color: ${theme.colors.bg};
          border-radius: 8px;
          font-weight: bold;
          z-index: 10000;
          animation: fadeIn 0.3s ease;
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);

        clickCount = 0;
      }

      clickTimer = setTimeout(() => {
        clickCount = 0;
      }, 500);
    });
  },

  /**
   * Data Inspector (Alt+Shift+I)
   */
  initDataInspector() {
    document.addEventListener('keydown', (e) => {
      if (e.altKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        this.showDataInspector();
      }
    });
  },

  showDataInspector() {
    const stats = CompressionUtils.getStorageStats();
    const dataKeys = Object.keys(localStorage).filter(k => k.startsWith('therapy_'));

    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.9);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.3s ease;
    `;

    modal.innerHTML = `
      <div style="
        background: linear-gradient(135deg, #1a1a1a, #0a0a0a);
        border: 2px solid #FFD700;
        border-radius: 16px;
        padding: 24px;
        max-width: 600px;
        color: white;
        box-shadow: 0 8px 32px rgba(255, 215, 0, 0.3);
      ">
        <h2 style="color: #FFD700; margin-bottom: 16px;">📊 Data Inspector</h2>
        <div style="font-family: monospace; font-size: 14px; line-height: 1.8;">
          <p><strong>Storage Used:</strong> ${stats.usedKB} KB (${stats.percentUsed}%)</p>
          <p><strong>Keys Found:</strong> ${dataKeys.length}</p>
          <p><strong>Keys:</strong></p>
          <ul style="list-style: none; padding-left: 20px;">
            ${dataKeys.map(k => `<li>• ${k}</li>`).join('')}
          </ul>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" style="
          margin-top: 16px;
          padding: 8px 16px;
          background: #FFD700;
          color: #000;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
        ">Close</button>
      </div>
    `;

    document.body.appendChild(modal);
  }
};

// ============================================
// ♿ ADVANCED ACCESSIBILITY
// ============================================

export const AdvancedA11y = {
  /**
   * High Contrast Mode
   */
  enableHighContrast(enable = true) {
    if (enable) {
      document.documentElement.setAttribute('data-high-contrast', 'true');
      document.documentElement.style.setProperty('--color-gold', '#FFFF00');
      document.documentElement.style.setProperty('--glass-bg', 'rgba(255, 255, 255, 0.15)');
    } else {
      document.documentElement.removeAttribute('data-high-contrast');
    }
  },

  /**
   * Font Size Controls
   */
  setFontSize(scale = 1.0) {
    const baseSize = 16; // 16px base
    document.documentElement.style.fontSize = `${baseSize * scale}px`;
    localStorage.setItem('fontScale', scale);
  },

  /**
   * Reduced Motion Mode
   */
  enableReducedMotion(enable = true) {
    if (enable) {
      document.documentElement.setAttribute('data-reduced-motion', 'true');
      const style = document.createElement('style');
      style.id = 'reduced-motion-style';
      style.textContent = `
        * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      `;
      document.head.appendChild(style);
    } else {
      document.documentElement.removeAttribute('data-reduced-motion');
      const style = document.getElementById('reduced-motion-style');
      if (style) style.remove();
    }
  },

  /**
   * Accessibility Settings Panel
   */
  createA11yPanel() {
    const panel = document.createElement('div');
    panel.id = 'a11y-panel';
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-label', 'Barrierefreiheits-Einstellungen');
    panel.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      background: rgba(0, 0, 0, 0.95);
      border: 2px solid #FFD700;
      border-radius: 12px;
      padding: 20px;
      z-index: 9999;
      min-width: 250px;
      box-shadow: 0 4px 20px rgba(255, 215, 0, 0.3);
      display: none;
    `;

    panel.innerHTML = `
      <h3 style="color: #FFD700; margin-bottom: 16px; font-size: 18px;">♿ Einstellungen</h3>

      <label style="display: block; margin-bottom: 12px; color: white;">
        <input type="checkbox" id="highContrastToggle" style="margin-right: 8px;">
        Hoher Kontrast
      </label>

      <label style="display: block; margin-bottom: 12px; color: white;">
        <input type="checkbox" id="reducedMotionToggle" style="margin-right: 8px;">
        Reduzierte Bewegung
      </label>

      <label style="display: block; margin-bottom: 12px; color: white;">
        Schriftgröße:
        <input type="range" id="fontSizeSlider" min="0.8" max="1.5" step="0.1" value="1.0"
               style="width: 100%; margin-top: 8px;">
        <span id="fontSizeValue">100%</span>
      </label>
    `;

    document.body.appendChild(panel);

    // Event listeners
    document.getElementById('highContrastToggle').addEventListener('change', (e) => {
      this.enableHighContrast(e.target.checked);
    });

    document.getElementById('reducedMotionToggle').addEventListener('change', (e) => {
      this.enableReducedMotion(e.target.checked);
    });

    document.getElementById('fontSizeSlider').addEventListener('input', (e) => {
      const scale = parseFloat(e.target.value);
      this.setFontSize(scale);
      document.getElementById('fontSizeValue').textContent = `${Math.round(scale * 100)}%`;
    });

    // Toggle panel with Alt+A
    document.addEventListener('keydown', (e) => {
      if (e.altKey && e.key === 'a') {
        e.preventDefault();
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
      }
    });

    return panel;
  },

  /**
   * Auto-detect user preferences
   */
  detectUserPreferences() {
    // Reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.enableReducedMotion(true);
    }

    // High contrast
    if (window.matchMedia('(prefers-contrast: high)').matches) {
      this.enableHighContrast(true);
    }

    // Dark mode (already dark, but could adjust)
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      console.log('Dark mode preferred (already applied)');
    }

    // Restore saved font size
    const savedScale = localStorage.getItem('fontScale');
    if (savedScale) {
      this.setFontSize(parseFloat(savedScale));
    }
  }
};

// ============================================
// 🎯 INITIALIZATION
// ============================================

export function initAllEnhancements() {
  console.log('🚀 Initializing Advanced Enhancements...');

  // Performance
  PerformanceUtils.lazyLoadImages();

  // Mobile
  if (MobileUtils.isTouchDevice()) {
    MobileUtils.optimizeTouchTargets();
    console.log('📱 Mobile optimizations applied');
  }

  // Hidden Features
  HiddenFeatures.initKonamiCode(() => {
    alert('🎉 Konami Code activated! You unlocked super mode!');
    document.body.style.animation = 'rainbow 2s linear infinite';
  });

  HiddenFeatures.initDevConsole();
  HiddenFeatures.initSecretThemes();
  HiddenFeatures.initDataInspector();

  // Accessibility
  AdvancedA11y.detectUserPreferences();
  AdvancedA11y.createA11yPanel();

  // Storage stats
  const stats = CompressionUtils.getStorageStats();
  console.log(`💾 Storage: ${stats.usedKB} KB used (${stats.percentUsed}%)`);

  console.log('✅ All enhancements initialized!');
}

// Auto-initialize if not in test environment
if (typeof window !== 'undefined' && !window.VITEST) {
  document.addEventListener('DOMContentLoaded', initAllEnhancements);
}
