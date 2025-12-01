# Contributing to Therapie-Arbeitsbuch Premium

Vielen Dank für dein Interesse an diesem Projekt! Dieses therapeutische Arbeitsbuch hilft Menschen mit komplexen psychischen Erkrankungen. Jede Verbesserung macht einen echten Unterschied.

## 🌟 Code of Conduct

- **Respekt:** Behandle alle Mitwirkenden mit Respekt und Empathie
- **Inklusion:** Dieses Projekt dient Menschen mit verschiedenen Beeinträchtigungen
- **Datenschutz:** Alle Daten bleiben lokal - keine Tracking-Implementierungen
- **Accessibility First:** WCAG 2.1 AA Standard ist Pflicht, nicht optional

## 🚀 Getting Started

### 1. Repository Setup

```bash
# Fork & Clone
git clone https://github.com/[YOUR-USERNAME]/Finale-Version.git
cd Finale-Version

# Install Dependencies
npm install

# Start Development Server
npm run dev
```

### 2. Development Workflow

```bash
# Create Feature Branch
git checkout -b feature/your-feature-name

# Make Changes & Test
npm run test
npm run lint

# Commit & Push
git add .
git commit -m "feat: add your feature description"
git push origin feature/your-feature-name
```

### 3. Pull Request

- Öffne einen PR gegen den `main` Branch
- Beschreibe deine Änderungen klar und detailliert
- Verlinke relevante Issues
- Warte auf Code Review

## 📋 Development Guidelines

### Code Style

- **JavaScript:** ES6+ Module Syntax
- **Formatting:** Prettier (automatisch mit `npm run format`)
- **Linting:** ESLint Standard Config
- **Comments:** Deutsch für therapeutische Fachbegriffe, Englisch für technische Kommentare

### Commit Messages

Verwende [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: Add new grounding technique
fix: Correct mood chart rendering
docs: Update README with installation steps
style: Format code with prettier
refactor: Simplify encryption logic
test: Add unit tests for StorageUtils
chore: Update dependencies
```

### Testing Requirements

- **Unit Tests:** Neue Features brauchen Tests
- **Coverage:** Minimum 80% für neue Funktionen
- **Accessibility:** Teste mit Screen-Reader (NVDA, JAWS, VoiceOver)
- **Browser Testing:** Chrome, Firefox, Safari, Edge

```bash
# Run Tests
npm run test

# Watch Mode
npm run test:watch

# Coverage Report
npm run test:coverage
```

## 🎨 Design System

### Colors

```css
--color-gold: #FFD700          /* Primary Accent */
--color-black: #000000         /* Background */
--color-success: #2ECC71       /* Positive Actions */
--color-warning: #F39C12       /* Alerts */
--color-danger: #E74C3C        /* Crisis/Emergency */
```

### Spacing

Verwende das 8px Grid System:

```css
--space-xs: 4px
--space-sm: 8px
--space-md: 16px
--space-lg: 24px
--space-xl: 32px
--space-2xl: 48px
```

### Accessibility

- **Contrast Ratio:** Minimum 4.5:1 (WCAG AA)
- **Focus Indicators:** Sichtbar und deutlich (2px solid)
- **ARIA Labels:** Für alle interaktiven Elemente
- **Keyboard Navigation:** Tab, Enter, Escape, Pfeiltasten
- **Screen Reader:** Semantisches HTML + ARIA

## 🔒 Security & Privacy

### Data Handling

- **Encryption:** AES-GCM 256-bit für localStorage
- **Sanitization:** Alle User-Inputs mit `SecurityUtils.sanitizeInput()`
- **XSS Prevention:** Niemals `innerHTML` ohne Sanitization
- **No Tracking:** Kein Google Analytics, kein externes Tracking

### DSGVO Compliance

- Alle Daten bleiben lokal (localStorage)
- Export-Funktion für Datenmitnahme
- Lösch-Funktion für Datenlöschung
- Transparente Datenschutzerklärung

## 🧪 Testing Strategy

### Unit Tests (Vitest)

```javascript
import { describe, it, expect } from 'vitest';
import { SecurityUtils } from './utils.js';

describe('SecurityUtils', () => {
  it('should sanitize HTML input', () => {
    const input = '<script>alert("xss")</script>';
    const output = SecurityUtils.sanitizeHTML(input);
    expect(output).not.toContain('<script>');
  });
});
```

### Integration Tests

- Test vollständige User-Flows (z.B. Mood-Eintrag speichern)
- Test Daten-Persistenz (localStorage)
- Test Encryption/Decryption Roundtrip

### Accessibility Tests

- Keyboard Navigation komplett durchführbar
- Screen Reader Announcements korrekt
- Focus Management funktioniert
- Color Contrast validiert

## 🐛 Bug Reports

Wenn du einen Bug findest:

1. **Prüfe**, ob der Bug schon gemeldet wurde
2. **Erstelle** ein neues Issue mit:
   - Beschreibung des Problems
   - Schritte zur Reproduktion
   - Erwartetes vs. tatsächliches Verhalten
   - Browser & Version
   - Screenshots (falls relevant)

## 💡 Feature Requests

Neue Feature-Ideen sind willkommen!

1. **Erstelle** ein Issue mit Label `enhancement`
2. **Beschreibe** den Use Case und therapeutischen Nutzen
3. **Diskutiere** mit anderen Community-Mitgliedern
4. **Implementiere** nach Approval

## 📚 Therapeutic Context

### Zielgruppen

- Komplexe PTBS
- ADHD
- Borderline-Persönlichkeitsstörung
- Autismus-Spektrum-Störungen

### Therapeutic Frameworks

- **DBT (Dialectical Behavior Therapy):** Skills-Training
- **Vier-Ohren-Modell:** Kommunikationsanalyse
- **Grounding:** Notfall-Techniken
- **Mood Tracking:** Verlaufs-Dokumentation

## 🤝 Community

- **Discussions:** Nutze GitHub Discussions für Fragen
- **Issues:** Für Bugs und Feature-Requests
- **Pull Requests:** Für Code-Beiträge
- **Reviews:** Alle PRs werden reviewed (bitte hab Geduld!)

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Danke, dass du zur mentalen Gesundheit beiträgst! 💚**
