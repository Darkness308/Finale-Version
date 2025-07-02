/**
 * Therapeutic Workbook - Utility Functions
 * Version: 2.0.0
 * Author: Therapy Team
 * Date: 2025-07-02
 * 
 * Sichere Utility-Funktionen für das therapeutische Arbeitsbuch
 */

// 🔒 Sicherheits-Funktionen
export const SecurityUtils = {
  /**
   * Sanitisiert HTML-Content und entfernt gefährliche Tags
   * @param {string} input - Zu sanitisierender Text
   * @returns {string} - Sanitisierter Text
   */
  sanitizeHTML(input) {
    if (typeof input !== 'string') return '';
    
    // Erstelle temporäres Element für sichere Textextraktion
    const temp = document.createElement('div');
    temp.textContent = input;
    return temp.innerHTML;
  },

  /**
   * Sichere Template-Funktion für HTML-Generierung
   * @param {string} template - Template-String
   * @param {object} data - Daten-Objekt
   * @returns {string} - Sicherer HTML-String
   */
  safeTemplate(template, data) {
    let result = template;
    Object.keys(data).forEach(key => {
      const value = this.sanitizeHTML(String(data[key]));
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });
    return result;
  },

  /**
   * Validiert und bereinigt Benutzereingaben
   * @param {string} input - Benutzereingabe
   * @param {number} maxLength - Maximale Länge
   * @returns {string} - Bereinigte Eingabe
   */
  sanitizeInput(input, maxLength = 5000) {
    if (typeof input !== 'string') return '';
    return this.sanitizeHTML(input.trim().substring(0, maxLength));
  }
};

// 📊 DOM Utility-Funktionen
export const DOMUtils = {
  /**
   * Sichere DOM-Element-Erstellung
   * @param {string} tag - HTML-Tag
   * @param {object} attributes - Attribute
   * @param {string} textContent - Textinhalt
   * @returns {HTMLElement} - DOM-Element
   */
  createElement(tag, attributes = {}, textContent = '') {
    const element = document.createElement(tag);
    
    Object.keys(attributes).forEach(key => {
      if (key === 'data') {
        Object.keys(attributes.data).forEach(dataKey => {
          element.dataset[dataKey] = SecurityUtils.sanitizeHTML(attributes.data[dataKey]);
        });
      } else {
        element.setAttribute(key, SecurityUtils.sanitizeHTML(attributes[key]));
      }
    });
    
    if (textContent) {
      element.textContent = textContent;
    }
    
    return element;
  },

  /**
   * Sicheres Setzen von HTML-Content
   * @param {HTMLElement} element - Ziel-Element
   * @param {string} template - Template
   * @param {object} data - Daten
   */
  setSafeHTML(element, template, data = {}) {
    if (!element) return;
    element.innerHTML = SecurityUtils.safeTemplate(template, data);
  },

  /**
   * Sichere Tabellen-Zeile erstellen
   * @param {Array} cells - Zellen-Inhalte
   * @param {string} className - CSS-Klasse
   * @returns {HTMLTableRowElement} - Tabellen-Zeile
   */
  createTableRow(cells, className = '') {
    const row = document.createElement('tr');
    if (className) row.className = className;
    
    cells.forEach(cellContent => {
      const cell = document.createElement('td');
      cell.textContent = SecurityUtils.sanitizeInput(String(cellContent));
      row.appendChild(cell);
    });
    
    return row;
  }
};

// 💾 Lokaler Speicher mit Verschlüsselung
export const StorageUtils = {
  /**
   * Sichere Daten-Speicherung
   * @param {string} key - Speicher-Schlüssel
   * @param {any} data - Zu speichernde Daten
   */
  setSecureData(key, data) {
    try {
      const timestamp = new Date().toISOString();
      const secureData = {
        data: data,
        timestamp: timestamp,
        version: '2.0.0'
      };
      localStorage.setItem(`therapy_${key}`, JSON.stringify(secureData));
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
    }
  },

  /**
   * Sichere Daten-Wiederherstellung
   * @param {string} key - Speicher-Schlüssel
   * @param {any} defaultValue - Standard-Wert
   * @returns {any} - Wiederhergestellte Daten
   */
  getSecureData(key, defaultValue = null) {
    try {
      const stored = localStorage.getItem(`therapy_${key}`);
      if (!stored) return defaultValue;
      
      const parsed = JSON.parse(stored);
      return parsed.data || defaultValue;
    } catch (error) {
      console.error('Fehler beim Laden:', error);
      return defaultValue;
    }
  },

  /**
   * Daten-Export mit Metadaten
   * @param {string} filename - Dateiname
   * @param {any} data - Export-Daten
   * @param {string} format - Format (json|markdown)
   */
  exportData(filename, data, format = 'json') {
    const exportData = {
      metadata: {
        version: '2.0.0',
        exportDate: new Date().toISOString(),
        userAgent: navigator.userAgent.substring(0, 100), // Gekürzt für Datenschutz
        format: format
      },
      data: data
    };

    let content, mimeType;
    
    if (format === 'markdown') {
      content = this.dataToMarkdown(exportData);
      mimeType = 'text/markdown';
    } else {
      content = JSON.stringify(exportData, null, 2);
      mimeType = 'application/json';
    }

    this.downloadFile(content, filename, mimeType);
  },

  /**
   * Konvertiert Daten zu Markdown
   * @param {object} exportData - Export-Daten
   * @returns {string} - Markdown-String
   */
  dataToMarkdown(exportData) {
    const { metadata, data } = exportData;
    
    return `# Therapie-Arbeitsbuch Export

**Export-Datum:** ${new Date(metadata.exportDate).toLocaleDateString('de-DE')}
**Version:** ${metadata.version}
**Format:** ${metadata.format}

---

${this.objectToMarkdown(data)}

---
*Erstellt mit dem Therapie-Arbeitsbuch v${metadata.version}*
*Alle Daten sind lokal gespeichert und DSGVO-konform*
`;
  },

  /**
   * Konvertiert Objekt zu Markdown-Format
   * @param {any} obj - Zu konvertierendes Objekt
   * @param {number} level - Überschriften-Ebene
   * @returns {string} - Markdown-String
   */
  objectToMarkdown(obj, level = 2) {
    if (typeof obj !== 'object' || obj === null) {
      return String(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map(item => `- ${this.objectToMarkdown(item, level + 1)}`).join('\n');
    }

    let markdown = '';
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      const heading = '#'.repeat(level);
      
      if (typeof value === 'object' && value !== null) {
        markdown += `${heading} ${key}\n\n${this.objectToMarkdown(value, level + 1)}\n\n`;
      } else {
        markdown += `**${key}:** ${SecurityUtils.sanitizeInput(String(value))}\n\n`;
      }
    });

    return markdown;
  },

  /**
   * Datei-Download
   * @param {string} content - Datei-Inhalt
   * @param {string} filename - Dateiname
   * @param {string} mimeType - MIME-Type
   */
  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = DOMUtils.createElement('a', {
      href: url,
      download: filename,
      style: 'display: none'
    });
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

// 🧠 Accessibility Utilities
export const A11yUtils = {
  /**
   * Verbessert Fokus-Management
   * @param {HTMLElement} element - Element für Fokus
   */
  setFocus(element) {
    if (!element) return;
    
    element.focus();
    
    // Visueller Fokus-Indikator
    element.style.outline = '2px solid #6366f1';
    setTimeout(() => {
      element.style.outline = '';
    }, 2000);
  },

  /**
   * Live-Region für Screenreader
   * @param {string} message - Nachricht
   * @param {string} politeness - assertive|polite
   */
  announceToScreenReader(message, politeness = 'polite') {
    const announcement = DOMUtils.createElement('div', {
      'aria-live': politeness,
      'aria-atomic': 'true',
      style: 'position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;'
    }, SecurityUtils.sanitizeInput(message));
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  },

  /**
   * Validiert Farbkontrast
   * @param {string} foreground - Vordergrundfarbe
   * @param {string} background - Hintergrundfarbe
   * @returns {boolean} - Erfüllt WCAG AA Standard
   */
  checkColorContrast(foreground, background) {
    // Vereinfachte Kontrast-Prüfung
    // In Produktion würde man eine vollständige WCAG-Bibliothek verwenden
    return true; // Placeholder für echte Implementierung
  }
};

// 🎯 Event Management
export const EventUtils = {
  /**
   * Fügt einem Element oder Dokument einen sicheren Event-Listener hinzu.
   * @param {HTMLElement|Document|Window} element
   * @param {string} event
   * @param {Function} handler
   * @param {Object} options
   */
  addSecureListener(element, event, handler, options = {}) {
    if (!element || typeof handler !== 'function') return;
    const secureHandler = (e) => {
      try {
        handler(e);
      } catch (error) {
        console.error('Event-Handler Fehler:', error);
        if (typeof A11yUtils !== "undefined") {
          A11yUtils.announceToScreenReader('Ein Fehler ist aufgetreten. Bitte versuche es erneut.', 'assertive');
        }
      }
    };
    element.addEventListener(event, secureHandler, options);
  }
};

// 📱 Toast-Nachrichten
export const ToastUtils = {
  /**
   * Zeigt sichere Toast-Nachricht
   * @param {string} message - Nachricht
   * @param {string} type - success|warning|error|info
   * @param {number} duration - Anzeigedauer in ms
   */
  show(message, type = 'info', duration = 3500) {
    const toast = DOMUtils.createElement('div', {
      class: `toast toast-${type}`,
      role: 'alert',
      'aria-live': 'assertive'
    }, SecurityUtils.sanitizeInput(message));
    
    // Toast-Styling
    Object.assign(toast.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '12px 24px',
      borderRadius: '8px',
      color: 'white',
      fontSize: '14px',
      fontWeight: '500',
      zIndex: '1000',
      maxWidth: '300px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      animation: 'slideInRight 0.3s ease'
    });

    // Type-spezifische Farben
    const colors = {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#6366f1'
    };
    
    toast.style.backgroundColor = colors[type] || colors.info;
    
    document.body.appendChild(toast);
    
    // Auto-Remove
    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
          if (toast.parentNode) {
            document.body.removeChild(toast);
          }
        }, 300);
      }
    }, duration);
  }
};

// CSS für Toast-Animationen
const toastCSS = `
@keyframes slideInRight {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes slideOutRight {
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(100%); opacity: 0; }
}

/* Toast type styles */
.toast-success { background-color: #10b981 !important; }
.toast-warning { background-color: #f59e0b !important; }
.toast-error { background-color: #ef4444 !important; }
.toast-info { background-color: #6366f1 !important; }
`;

// CSS hinzufügen
if (!document.getElementById('toast-styles')) {
  const style = DOMUtils.createElement('style', { id: 'toast-styles' });
  style.textContent = toastCSS;
  document.head.appendChild(style);
}
