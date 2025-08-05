/**
 * Therapeutic Workbook - Core Application
 * Version: 2.0.0
 * Author: Therapy Team
 * Date: 2025-07-02
 */

import { 
  SecurityUtils, 
  DOMUtils, 
  StorageUtils, 
  A11yUtils, 
  EventUtils, 
  ToastUtils 
} from './utils.js';

// 📊 Haupt-Anwendungsklasse
export class TherapyWorkbook {
  constructor() {
    this.data = this.initializeData();
    this.currentSlide = 1;
    this.totalSlides = 6;
    this.trainingData = {};
    this.charts = new Map();
    
    this.init();
  }

  // 🔧 Initialisierung
  init() {
    this.loadData();
    this.bindEvents();
    this.initializeCharts();
    this.updateProgress();
    
    // ARIA und Accessibility
    this.setupAccessibility();
    
    // Lade gespeicherte Daten
    
    ToastUtils.show('Therapie-Arbeitsbuch geladen', 'success');
  }

  // 📁 Daten-Initialisierung
  initializeData() {
    return {
      moods: /** @type {Array<{ date: string; type: string; level: number; situation: string; thoughts: string; bodyReactions: string[]; coping: string; emotions: { emotion: string; intensity: number; }[] }>} */ ([]),
      strengths: /** @type {Array<{ date: string; proud: string; good: string; learned: string }>} */ ([]),
      thoughts: [],
      positives: [],
      notes: [],
      homework: [],
      communications: [],
      triggers: [],
      trainings: [],
      version: '2.0.0',
      created: new Date().toISOString()
    };
  }

  // 🔒 Sichere Daten-Operationen
  loadData() {
    const savedData = StorageUtils.getSecureData('workbook', this.initializeData());
    this.data = { ...this.data, ...savedData };
  }

  saveData() {
    StorageUtils.setSecureData('workbook', this.data);
    this.updateProgress();
  }

  // 🎯 Event-Binding ohne Inline-Handler
  bindEvents() {
    // Navigation
    document.querySelectorAll('.nav-tab').forEach((tab, index) => {
      EventUtils.addSecureListener(tab instanceof HTMLElement ? tab : /** @type {HTMLElement} */ (tab), 'click', (e) => {
        const targetId = tab.getAttribute('aria-controls');
        this.showTab(targetId, e);
      });

      // Keyboard Navigation
      EventUtils.addSecureListener(tab instanceof HTMLElement ? tab : /** @type {HTMLElement} */ (tab), 'keydown', (e) => {
        this.handleTabKeyboard(e, index);
      });
    });

    // Crisis Banner
    const crisisHelp = document.querySelector('#crisis-banner .btn-danger');
    const crisisClose = document.querySelector('#crisis-banner .btn-secondary');
    
    if (crisisHelp) {
      EventUtils.addSecureListener(crisisHelp instanceof HTMLElement ? crisisHelp : /** @type {HTMLElement} */ (crisisHelp), 'click', () => this.showHelp());
    }
    
    if (crisisClose) {
      EventUtils.addSecureListener(crisisClose instanceof HTMLElement ? crisisClose : /** @type {HTMLElement} */ (crisisClose), 'click', () => this.hideCrisis());
    }

    // Form-Speicherung
    this.bindFormEvents();
    
    // Globale Keyboard-Shortcuts
    EventUtils.addSecureListener(document, 'keydown', (e) => {
      this.handleGlobalKeyboard(e);
    });
  }

  // 📝 Form-Events binden
  bindFormEvents() {
    // Alle data-action Buttons zentral binden
    document.querySelectorAll('[data-action]').forEach(btn => {
      if (!(btn instanceof HTMLElement)) return;
      const action = btn.getAttribute('data-action');
      switch (action) {
        case 'save-mood':
          EventUtils.addSecureListener(btn, 'click', () => this.saveMood());
          break;
        case 'save-strength':
          EventUtils.addSecureListener(btn, 'click', () => this.saveStrength());
          break;
        case 'save-thoughts':
          EventUtils.addSecureListener(btn, 'click', () => this.saveThoughts());
          break;
        case 'clear-thoughts':
          EventUtils.addSecureListener(btn, 'click', () => this.clearThoughts());
          break;
        case 'save-positives':
          EventUtils.addSecureListener(btn, 'click', () => this.savePositives());
          break;
        case 'save-note':
          EventUtils.addSecureListener(btn, 'click', () => this.saveNote());
          break;
        case 'save-homework':
          EventUtils.addSecureListener(btn, 'click', () => this.saveHomework());
          break;
        case 'save-journal':
          EventUtils.addSecureListener(btn, 'click', () => this.saveJournal());
          break;
        case 'save-daily':
          EventUtils.addSecureListener(btn, 'click', () => this.saveDaily());
          break;
        case 'trigger-crisis':
          EventUtils.addSecureListener(btn, 'click', () => this.triggerCrisis());
          break;
        case 'export-data':
          EventUtils.addSecureListener(btn, 'click', () => this.exportAllData());
          break;
        case 'show-stats':
          EventUtils.addSecureListener(btn, 'click', () => this.showStats());
          break;
        case 'confirm-delete':
          EventUtils.addSecureListener(btn, 'click', () => this.confirmDelete());
          break;
        case 'copy-value':
          EventUtils.addSecureListener(btn, 'click', (e) => this.copyValueHandler(e));
          break;
        case 'copy-to-thoughts':
          EventUtils.addSecureListener(btn, 'click', (e) => this.copyToThoughtsHandler(e));
          break;
        case 'copy-to-trigger-diary':
          EventUtils.addSecureListener(btn, 'click', (e) => this.copyToTriggerDiaryHandler(e));
          break;
        case 'suggest-coping':
          EventUtils.addSecureListener(btn, 'click', () => this.suggestCoping());
          break;
        case 'start-training':
          EventUtils.addSecureListener(btn, 'click', () => this.startTraining());
          break;
        case 'prev-slide':
          EventUtils.addSecureListener(btn, 'click', () => this.prevSlide());
          break;
        case 'next-slide':
          EventUtils.addSecureListener(btn, 'click', () => this.nextSlide());
          break;
        case 'complete-training':
          EventUtils.addSecureListener(btn, 'click', () => this.completeTraining());
          break;
        case 'export-training':
          EventUtils.addSecureListener(btn, 'click', () => this.exportTraining());
          break;
        case 'export-slides':
          EventUtils.addSecureListener(btn, 'click', () => this.exportSlides());
          break;
        case 'analyze-with-ai':
          EventUtils.addSecureListener(btn, 'click', () => this.analyzeWithAI());
          break;
        case 'show-help':
          EventUtils.addSecureListener(btn, 'click', () => this.showHelp());
          break;
        case 'hide-help':
          EventUtils.addSecureListener(btn, 'click', () => this.hideHelp());
          break;
        case 'close-help':
          EventUtils.addSecureListener(btn, 'click', () => this.hideHelp());
          break;
        case 'close-privacy':
          EventUtils.addSecureListener(btn, 'click', () => this.closePrivacyModal());
          break;
        case 'delete-all-data':
          EventUtils.addSecureListener(btn, 'click', () => this.deleteAllData());
          break;
        case 'export-privacy-data':
          EventUtils.addSecureListener(btn, 'click', () => this.exportPrivacyData());
          break;
        case 'confirm-consent':
          EventUtils.addSecureListener(btn, 'click', () => this.confirmConsent());
          break;
        // Grounding, PME, etc.
        case 'start-breathing':
          EventUtils.addSecureListener(btn, 'click', () => this.startBreathing());
          break;
        case 'start-grounding':
          EventUtils.addSecureListener(btn, 'click', () => this.startGrounding());
          break;
        case 'start-muscle-relaxation':
          EventUtils.addSecureListener(btn, 'click', () => this.startMuscleRelaxation());
          break;
        case 'check-grounding':
          EventUtils.addSecureListener(btn, 'click', () => this.checkGrounding());
          break;
        case 'toggle-emotion':
          EventUtils.addSecureListener(btn, 'click', (e) => this.toggleEmotion(e));
          break;
        case 'update-mood-dropdown':
          EventUtils.addSecureListener(btn, 'change', (e) => this.updateMoodDropdown(e));
          break;
        case 'update-mood-intensity':
          EventUtils.addSecureListener(btn, 'input', (e) => this.updateMoodIntensity(e));
          break;
        default:
          // Keine Aktion
          break;
      }
    });

    // Auto-Save für Textfelder
    document.querySelectorAll('textarea, input[type="text"]').forEach(field => {
      if (field instanceof HTMLElement) {
        EventUtils.addSecureListener(field, 'blur', () => {
          this.autoSave(field);
        });
      }
    });
  }

  // 🗂️ Tab-Management
  showTab(tabId, event) {
    if (event) {
      event.preventDefault();
    }

    // Verstecke alle Sections
    document.querySelectorAll('.content-section').forEach(section => {
      section.classList.remove('active');
      section.setAttribute('aria-hidden', 'true');
    });

    // Deaktiviere alle Tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.classList.remove('active');
      tab.setAttribute('aria-selected', 'false');
      tab.setAttribute('tabindex', '-1');
    });

    // Zeige gewählte Section
    const targetSection = document.getElementById(tabId);
    const targetTab = document.querySelector(`[aria-controls="${tabId}"]`);

    if (targetSection && targetSection instanceof HTMLElement) {
      targetSection.classList.add('active');
      targetSection.setAttribute('aria-hidden', 'false');
    }

    if (targetTab && targetTab instanceof HTMLElement) {
      targetTab.classList.add('active');
      targetTab.setAttribute('aria-selected', 'true');
      targetTab.setAttribute('tabindex', '0');
      A11yUtils.setFocus(targetTab);
    }

    // Tab-spezifische Aktionen
    this.onTabChange(tabId);
  }

  // 🎪 Tab-spezifische Aktionen
  onTabChange(tabId) {
    switch (tabId) {
      case 'mood':
        this.renderMoodChart();
        break;
      case 'clustertrigger':
        this.renderClusterTriggerTable();
        break;
      case 'export':
        this.showStats();
        break;
      case 'vierohren-training':
        this.initTraining();
        break;
    }
  }

  // ⌨️ Keyboard-Navigation
  handleTabKeyboard(event, currentIndex) {
    const tabs = document.querySelectorAll('.nav-tab');
    let nextIndex = currentIndex;

    switch (event.key) {
      case 'ArrowRight':
        nextIndex = (currentIndex + 1) % tabs.length;
        break;
      case 'ArrowLeft':
        nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = tabs.length - 1;
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (tabs[currentIndex] instanceof HTMLElement) {
          tabs[currentIndex].click();
        }
        return;
      default:
        return;
    }

    event.preventDefault();
    // Cast to HTMLElement to satisfy the type requirement
    A11yUtils.setFocus(/** @type {HTMLElement} */ (tabs[nextIndex]));
  }

  // 🔧 Globale Keyboard-Shortcuts
  handleGlobalKeyboard(event) {
    // Strg/Cmd + S: Speichern
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault();
      this.saveData();
      ToastUtils.show('Daten gespeichert', 'success');
    }

    // Escape: Modals schließen
    if (event.key === 'Escape') {
      this.hideHelp();
      this.hideCrisis();
    }

    // Strg/Cmd + E: Export
    if ((event.ctrlKey || event.metaKey) && event.key === 'e') {
      event.preventDefault();
      this.showTab('export');
    }
  }

  // 💾 Sichere Speicher-Funktionen
  saveMood() {
    try {
      const moodType = document.getElementById('moodType');
      const moodLevel = document.getElementById('moodLevel');
      const situation = document.getElementById('situation');
      const thoughtsMood = document.getElementById('thoughtsMood');
      const copingStrategy = document.getElementById('copingStrategy');

      const moodData = {
        date: new Date().toISOString(),
        type: SecurityUtils.sanitizeInput(String((moodType && 'value' in moodType) ? moodType.value : '')),
        level: parseInt(String((moodLevel && 'value' in moodLevel) ? moodLevel.value : '1')) || 1,
        situation: SecurityUtils.sanitizeInput(String((situation && 'value' in situation) ? situation.value : '')),
        thoughts: SecurityUtils.sanitizeInput(String((thoughtsMood && 'value' in thoughtsMood) ? thoughtsMood.value : '')),
        bodyReactions: this.getCheckedValues('[name="bodyReactions"]:checked'),
        coping: SecurityUtils.sanitizeInput(String((copingStrategy && 'value' in copingStrategy) ? copingStrategy.value : '')),
        emotions: this.getEmotions()
      };

      // Validierung
      if (!moodData.type) {
        ToastUtils.show('Bitte wähle eine Stimmung aus', 'warning');
        return;
      }

      if (Array.isArray(this.data.moods)) {
        this.data.moods.push(moodData);
      }
      this.saveData();
      
      ToastUtils.show('Stimmung gespeichert', 'success');
      A11yUtils.announceToScreenReader('Stimmung erfolgreich gespeichert');

      // Automatische Hilfe bei niedrigen Werten
      if (moodData.level < 3) {
        this.offerHelp();
      }

    } catch (error) {
      console.error('Fehler beim Speichern der Stimmung:', error);
      ToastUtils.show('Fehler beim Speichern', 'error');
    }
  }

  saveStrength() {
    try {
      const proud = document.getElementById('strengthProud');
      const good = document.getElementById('strengthGood');
      const learned = document.getElementById('strengthLearned');
      const strengthData = {
        date: new Date().toISOString(),
        proud: SecurityUtils.sanitizeInput(String((proud && 'value' in proud) ? proud.value : '')),
        good: SecurityUtils.sanitizeInput(String((good && 'value' in good) ? good.value : '')),
        learned: SecurityUtils.sanitizeInput(String((learned && 'value' in learned) ? learned.value : ''))
      };

      if (Array.isArray(this.data.strengths)) {
        this.data.strengths.push(strengthData);
      }
      this.saveData();
      
      ToastUtils.show('Stärken gespeichert', 'success');
      
    } catch (error) {
      console.error('Fehler beim Speichern der Stärken:', error);
      ToastUtils.show('Fehler beim Speichern', 'error');
    }
  }

  // 🔄 Auto-Save
  autoSave(field) {
    if (!field.value.trim()) return;

    const autoSaveData = StorageUtils.getSecureData('autosave', {});
    autoSaveData[field.id] = {
      value: SecurityUtils.sanitizeInput(String(field.value)),
      timestamp: new Date().toISOString()
    };
    
    StorageUtils.setSecureData('autosave', autoSaveData);
  }

  // 📊 Chart-Management
  initializeCharts() {
    this.renderMoodChart();
  }

  renderMoodChart() {
    const canvas = document.getElementById('moodChart');
    if (!(canvas instanceof HTMLCanvasElement) || !Array.isArray(this.data.moods) || this.data.moods.length === 0) return;

    // Zerstöre existierende Chart
    if (this.charts.has('mood')) {
      this.charts.get('mood').destroy();
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const chartData = this.prepareMoodChartData();

    // @ts-ignore
    const chart = new window.Chart(ctx, {
      type: 'line',
      data: chartData,
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Stimmungsverlauf'
          },
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 5,
            title: {
              display: true,
              text: 'Intensität'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Datum'
            }
          }
        }
      }
    });

    this.charts.set('mood', chart);
  }

  prepareMoodChartData() {
    const last30Days = Array.isArray(this.data.moods)
      ? this.data.moods.slice(-30).map(mood => {
          const date = (mood && typeof mood === 'object' && 'date' in mood && typeof mood.date === 'string') ? mood.date : '';
          const level = (mood && typeof mood === 'object' && 'level' in mood && typeof mood.level === 'number') ? mood.level : 0;
          return {
            x: date ? new Date(date).toLocaleDateString('de-DE') : '',
            y: level
          };
        })
      : [];
    return {
      labels: last30Days.map(point => point.x),
      datasets: [{
        label: 'Stimmung',
        data: last30Days.map(point => point.y),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderWidth: 2,
        fill: true
      }]
    };
  }

  // 🔍 Cluster-Trigger-Analyse
  renderClusterTriggerTable() {
    const tbody = document.getElementById('clusterTriggerTableBody');
    if (!tbody) return;

    // Sichere Table-Bereinigung
    while (tbody.firstChild) {
      tbody.removeChild(tbody.firstChild);
    }

    const triggerDiary = StorageUtils.getSecureData('triggerDiary', []);
    
    triggerDiary.forEach(entry => {
      const row = DOMUtils.createTableRow([
        new Date(entry.date).toLocaleDateString('de-DE'),
        entry.trigger || '',
        entry.emotion || '',
        entry.bodyReactions?.join(', ') || '',
        entry.reaction || '',
        entry.helpful || ''
      ]);
      
      tbody.appendChild(row);
    });

    // Muster-Analyse
    this.analyzePatterns(triggerDiary);
  }

  // 🧠 Muster-Analyse
  analyzePatterns(triggers) {
    if (triggers.length < 3) return;

    const patterns = {};
    triggers.forEach(trigger => {
      const key = trigger.emotion || 'unbekannt';
      patterns[key] = (patterns[key] || 0) + 1;
    });

    const mostCommon = Object.entries(patterns)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);

    if (mostCommon.length > 0) {
      const warning = document.getElementById('clusterTriggerWarning');
      if (warning) {
        warning.className = 'trigger-warning';
        warning.textContent = `Häufigste Muster: ${mostCommon.map(([emotion, count]) => `${emotion} (${count}x)`).join(', ')}`;
      }
    }
  }

  // 📈 Fortschritts-Anzeige
  updateProgress() {
    const today = new Date().toISOString().split('T')[0];
    const todayEntries = Array.isArray(this.data.moods)
      ? this.data.moods.filter(mood => {
          if (!mood || typeof mood !== 'object' || !('date' in mood)) return false;
          const m = mood;
          return typeof m.date === 'string' && m.date.startsWith(today);
        }).length
      : 0;

    const progress = Math.min(todayEntries * 25, 100); // Max 4 Einträge = 100%
    
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    
    if (progressFill) {
      progressFill.style.width = `${progress}%`;
    }
    
    if (progressText) {
      progressText.textContent = `${progress}%`;
    }
  }

  // 🆘 Hilfe-Funktionen
  showHelp() {
    const modal = document.getElementById('help-modal');
    if (modal) {
      modal.style.display = 'block';
      modal.setAttribute('aria-hidden', 'false');
      A11yUtils.setFocus(modal);
    }
  }

  hideHelp() {
    const modal = document.getElementById('help-modal');
    if (modal) {
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  closePrivacyModal() {
    const modal = document.getElementById('privacy-modal');
    if (modal) {
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  showConsentModal() {
    const modal = document.getElementById('consent-modal');
    if (modal) {
      modal.style.display = 'block';
      modal.setAttribute('aria-hidden', 'false');
      A11yUtils.setFocus(modal);
    }
  }

  confirmConsent() {
    localStorage.setItem('consent', 'true');
    const modal = document.getElementById('consent-modal');
    if (modal) {
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  hideCrisis() {
    const banner = document.getElementById('crisis-banner');
    if (banner) {
      banner.style.display = 'none';
    }
  }

  offerHelp() {
    ToastUtils.show('🔔 Niedrige Stimmung erkannt. Grounding-Techniken verfügbar!', 'warning', 5000);
    
    setTimeout(() => {
      const response = confirm('Möchtest du zu den Grounding-Techniken wechseln?');
      if (response) {
        this.showTab('grounding');
      }
    }, 1000);
  }

  // 🎯 Vier-Ohren-Training
  initTraining() {
    this.currentSlide = 1;
    this.updateTrainingUI();
  }

  startTraining() {
    const onboarding = document.getElementById('training-onboarding-slide');
    const slides = document.getElementById('training-slides-container');
    
    if (onboarding) onboarding.style.display = 'none';
    if (slides) slides.style.display = 'block';
    
    this.updateTrainingUI();
  }

  nextSlide() {
    if (this.currentSlide < this.totalSlides) {
      this.hideCurrentSlide();
      this.currentSlide++;
      this.showCurrentSlide();
      this.updateTrainingUI();
      
      // if (this.currentSlide === 6) {
      //   this.renderOhrChart();
      // }
    }
  }

  prevSlide() {
    if (this.currentSlide > 1) {
      this.hideCurrentSlide();
      this.currentSlide--;
      this.showCurrentSlide();
      this.updateTrainingUI();
    }
  }

  hideCurrentSlide() {
    const slide = document.getElementById(`slide-${this.currentSlide}`);
    if (slide) slide.classList.remove('active');
  }

  showCurrentSlide() {
    const slide = document.getElementById(`slide-${this.currentSlide}`);
    if (slide) slide.classList.add('active');
  }

  updateTrainingUI() {
    const counter = document.getElementById('slide-counter');
    const progress = document.getElementById('training-progress');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const completeBtn = document.getElementById('complete-btn');

    if (counter) {
      counter.textContent = `Slide ${this.currentSlide} von ${this.totalSlides}`;
    }

    if (progress) {
      const progressPercent = (this.currentSlide / this.totalSlides) * 100;
      progress.style.width = `${progressPercent}%`;
    }

    if (prevBtn && prevBtn instanceof HTMLButtonElement) {
      prevBtn.disabled = this.currentSlide === 1;
    }

    if (this.currentSlide === this.totalSlides) {
      if (nextBtn) nextBtn.style.display = 'none';
      if (completeBtn) completeBtn.style.display = 'inline-block';
    } else {
      if (nextBtn) nextBtn.style.display = 'inline-block';
      if (completeBtn) completeBtn.style.display = 'none';
    }
  }

  // 📊 Export-Funktionen
  exportAllData() {
    const exportData = {
      ...this.data,
      exportInfo: {
        date: new Date().toISOString(),
        version: '2.0.0',
        totalEntries: this.data.moods.length + this.data.strengths.length + this.data.thoughts.length
      }
    };

    StorageUtils.exportData(
      `therapie-arbeitsbuch_${new Date().toISOString().split('T')[0]}.json`,
      exportData,
      'json'
    );
  }

  exportAsMarkdown() {
    StorageUtils.exportData(
      `therapie-arbeitsbuch_${new Date().toISOString().split('T')[0]}.md`,
      this.data,
      'markdown'
    );
  }

  exportPrivacyData() {
    StorageUtils.exportData(
      `therapie-privacy_${new Date().toISOString().split('T')[0]}.json`,
      this.data,
      'json'
    );
  }

  // 🔧 Utility-Funktionen
  getCheckedValues(selector) {
    return Array.from(document.querySelectorAll(selector))
      .map(checkbox => SecurityUtils.sanitizeInput(String(checkbox.value)));
  }

  getEmotions() {
    const activeButtons = document.querySelectorAll('.emotion-btn.active');
    return Array.from(activeButtons).map(btn => {
      const emotion = SecurityUtils.sanitizeInput(String(btn.textContent || ''));
      // Versuche, einen zugehörigen Intensitäts-Slider zu finden
      let intensity = 3; // Standard-Intensität
      if (btn instanceof HTMLElement && btn.dataset.emotionId) {
        const slider = document.querySelector(`.emotion-intensity[data-emotion-id="${btn.dataset.emotionId}"]`);
        if (slider && slider instanceof HTMLInputElement) {
          const parsed = parseInt(slider.value, 10);
          if (!isNaN(parsed)) {
            intensity = parsed;
          }
        }
      }
      return {
        emotion,
        intensity
      };
    });
  }

  // 🎨 Accessibility Setup
  setupAccessibility() {
    // Skip-Link hinzufügen
    const skipLink = DOMUtils.createElement('a', {
      href: '#main-content',
      class: 'skip-link',
      style: 'position: absolute; left: -10000px; top: auto; width: 1px; height: 1px; overflow: hidden;'
    }, 'Zum Hauptinhalt springen');

    document.body.insertBefore(skipLink, document.body.firstChild);

    // Main-Content ID hinzufügen
    const container = document.querySelector('.container');
    if (container) {
      container.id = 'main-content';
    }

    // Landmarks verbessern
    const nav = document.querySelector('.nav-tabs');
    if (nav) {
      nav.setAttribute('aria-label', 'Hauptnavigation');
    }
  }

  // 📊 Statistiken anzeigen
  showStats() {
    const stats = {
      totalMoods: this.data.moods.length,
      averageMood: this.calculateAverageMood(),
      totalStrengths: this.data.strengths.length,
      totalThoughts: this.data.thoughts.length,
      daysActive: this.calculateActiveDays()
    };

    const statsDisplay = document.getElementById('stats-display');
    if (statsDisplay) {
      const template = `
        <div class="stats-grid">
          <div class="stat-card">
            <h3>{{totalMoods}}</h3>
            <p>Stimmungs-Einträge</p>
          </div>
          <div class="stat-card">
            <h3>{{averageMood}}</h3>
            <p>Durchschnittliche Stimmung</p>
          </div>
          <div class="stat-card">
            <h3>{{totalStrengths}}</h3>
            <p>Stärken dokumentiert</p>
          </div>
          <div class="stat-card">
            <h3>{{daysActive}}</h3>
            <p>Aktive Tage</p>
          </div>
        </div>
      `;
      
      DOMUtils.setSafeHTML(statsDisplay, template, stats);
    }
  }

  calculateAverageMood() {
    if (!Array.isArray(this.data.moods) || this.data.moods.length === 0) return '0.0';
    let sum = 0;
    let count = 0;
    this.data.moods.forEach(mood => {
      if (mood && typeof mood === 'object' && 'level' in mood && typeof mood.level === 'number') {
        sum += mood.level;
        count++;
      }
    });
    return count === 0 ? '0.0' : (sum / count).toFixed(1);
  }

  calculateActiveDays() {
    if (!Array.isArray(this.data.moods)) return 0;
    const dates = new Set();
    this.data.moods.forEach(mood => {
      if (mood && typeof mood === 'object' && 'date' in mood && typeof mood.date === 'string') {
        dates.add(mood.date.split('T')[0]);
      }
    });
    return dates.size;
  }

  // --- Platzhalter- und Standard-Handler für alle data-action Events ---
  saveThoughts() { ToastUtils.show('Gedanken gespeichert (Demo)', 'info'); }
  clearThoughts() { ToastUtils.show('Gedanken gelöscht (Demo)', 'info'); }
  savePositives() { ToastUtils.show('Positives gespeichert (Demo)', 'info'); }
  saveNote() { ToastUtils.show('Notiz gespeichert (Demo)', 'info'); }
  saveHomework() { ToastUtils.show('Hausaufgabe gespeichert (Demo)', 'info'); }
  saveJournal() { ToastUtils.show('Journal gespeichert (Demo)', 'info'); }
  saveDaily() { ToastUtils.show('Tages-Check-in gespeichert (Demo)', 'info'); }
  triggerCrisis() { this.showHelp(); }
  confirmDelete() { if (confirm('Alle Daten wirklich löschen?')) { StorageUtils.setSecureData('workbook', this.initializeData()); this.saveData(); ToastUtils.show('Alle Daten gelöscht', 'success'); } }

  deleteAllData() {
    this.confirmDelete();
  }

  copyValueHandler(e) {
    const btn = e.currentTarget;
    if (!(btn instanceof HTMLElement)) return;
    const sourceId = btn.getAttribute('data-source');
    const targetId = btn.getAttribute('data-target');
    if (!sourceId || !targetId) return;
    const source = document.getElementById(sourceId);
    const target = document.getElementById(targetId);
    if (source && target && 'value' in source && 'value' in target) {
      target.value = source.value;
      ToastUtils.show('Wert übernommen', 'success');
    }
  }
  copyToThoughtsHandler(e) { ToastUtils.show('Als Gedanken gespeichert (Demo)', 'info'); }
  copyToTriggerDiaryHandler(e) { ToastUtils.show('Als Trigger gespeichert (Demo)', 'info'); }
  suggestCoping() { ToastUtils.show('Strategie-Vorschlag: Grounding', 'info'); }
  completeTraining() { ToastUtils.show('Training abgeschlossen!', 'success'); }
  exportTraining() { this.exportAsMarkdown(); }
  exportSlides() { this.exportAsMarkdown(); }
  updateMoodDropdown(e) { ToastUtils.show('Stimmung gewählt', 'info'); }
  updateMoodIntensity(e) { ToastUtils.show('Intensität angepasst', 'info'); }
  startBreathing() { ToastUtils.show('Atemübung gestartet', 'info'); }
  startGrounding() { ToastUtils.show('Grounding gestartet', 'info'); }
  startMuscleRelaxation() { ToastUtils.show('PME gestartet', 'info'); }
  checkGrounding() { ToastUtils.show('Bist du geerdet?', 'info'); }
  toggleEmotion(e) { const btn = e.currentTarget; if (btn instanceof HTMLElement) { btn.classList.toggle('active'); } }
  
  analyzeWithAI() { ToastUtils.show('AI-basierte Analyse wird durchgeführt', 'info'); }
}

/**
 * Fügt einem Element oder Dokument einen sicheren Event-Listener hinzu.
 * @param {HTMLElement|Document|Window} element
 * @param {string} event
 * @param {Function} handler
 * @param {Object} options
 */
function addSecureListener(element, event, handler, options = {}) {
  if (!element || typeof handler !== 'function') return;

  const secureHandler = (e) => {
    try {
      handler(e);
    } catch (error) {
      console.error('Event-Handler Fehler:', error);
      A11yUtils.announceToScreenReader('Ein Fehler ist aufgetreten. Bitte versuche es erneut.', 'assertive');
    }
  };

  element.addEventListener(event, secureHandler, options);
}

// 🚀 App-Initialisierung
let app;

// App-Start

document.addEventListener('DOMContentLoaded', () => {
  app = new TherapyWorkbook();
  // Globale Referenz für Legacy-Kompatibilität
  // @ts-ignore
  window.therapyApp = app;
  if (!localStorage.getItem('consent')) {
    app.showConsentModal();
  }
});

// Export für Module
export default TherapyWorkbook;


