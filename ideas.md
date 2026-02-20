# Design-Ideen: Immobilien-Investment-Kalkulator

<response>
<idea>
**Design Movement:** Corporate Precision / Swiss Grid Modernism
**Core Principles:**
1. Klare Hierarchie durch typografische Kontraste (schwere Headlines, leichte Body-Texte)
2. Daten-first: Zahlen und Kennzahlen stehen im Mittelpunkt, nicht Dekoration
3. Vertrauen durch Konsistenz: Jede Sektion folgt demselben visuellen Rhythmus
4. Blau als Signalfarbe für Interaktion, Weiß als Raum, Dunkelgrau als Substanz

**Color Philosophy:** Primär Weiß (#FFFFFF) als Hintergrund, Marineblau (#0D47A1) für CTAs und Highlights, Stahlblau (#1565C0) für sekundäre Elemente, Anthrazit (#263238) für Texte. Akzente in Hellblau (#E3F2FD) für Hintergrundkarten. Grün (#2E7D32) für positive Ergebnisse, Amber (#F57F17) für Warnungen.

**Layout Paradigm:** Asymmetrisches 12-Spalten-Grid. Hero links-ausgerichtet mit großem Titelblock. Formular in zwei Spalten mit vertikaler Trennlinie. Ergebnisse in einem Dashboard-Grid mit Karten unterschiedlicher Größe.

**Signature Elements:**
1. Blaue vertikale Akzentlinie links neben Sektionstiteln
2. Numerische Kennzahlen in extra-großer Schrift mit kleiner Einheit daneben
3. Subtile Hintergrundmuster aus feinen Rasterlinien in Hellgrau

**Interaction Philosophy:** Formulareingaben mit sofortiger visueller Validierung. Ergebnisse erscheinen mit sanftem Slide-in. Pro-Features mit Lock-Icon und blauem Glanz-Overlay.

**Animation:** Zahlen zählen hoch beim Erscheinen (Counter-Animation). Karten gleiten von unten ein. Tooltips erscheinen mit 150ms Fade.

**Typography System:** Headlines: "DM Sans" Bold 700 (klar, modern, nicht generisch). Body: "Inter" Regular 400. Kennzahlen: "DM Mono" für Zahlen (monospace Konsistenz).
</idea>
<probability>0.08</probability>
</response>

<response>
<idea>
**Design Movement:** Financial Dashboard / Data Visualization First
**Core Principles:**
1. Daten-Visualisierung als primäres Kommunikationsmittel
2. Progressive Disclosure: Free → Pro als visueller Fortschritt
3. Vertrauen durch Professionalität: Banken-ähnliche Ästhetik
4. Klare Trennung von Input-Bereich und Output-Bereich

**Color Philosophy:** Tiefes Marineblau (#0A2540) als Primärfarbe für Navigation und CTAs. Helles Eisblau (#F0F7FF) als Kartenhintergrund. Reines Weiß für Formulare. Smaragdgrün (#00875A) für positive Cashflow-Werte. Warmes Rot (#DE350B) für negative Werte.

**Layout Paradigm:** Sticky Top-Navigation mit Logo. Zweispaltiges Layout: linke Spalte (40%) für Eingaben, rechte Spalte (60%) für Live-Ergebnisse. Kein klassisches Scrolling-Layout, sondern ein App-ähnliches Interface.

**Signature Elements:**
1. Gradient-Header von Marineblau zu Mittelblau
2. Glasmorphismus-Karten für Pro-Features (blur + transparenz)
3. Animierte Balkendiagramme in Recharts

**Interaction Philosophy:** Live-Berechnung während der Eingabe (debounced). Smooth Scroll zu Ergebnissen. Pro-Paywall als elegantes Modal.

**Animation:** Smooth number transitions mit framer-motion. Chart-Bars wachsen von 0 beim ersten Render. Paywall-Modal mit Scale-in.

**Typography System:** "Sora" für Headlines (modern, tech-affin). "IBM Plex Sans" für Body und Zahlen (professionell, lesbar).
</idea>
<probability>0.07</probability>
</response>

<response>
<idea>
**Design Movement:** Editorial Finance / Magazine-Stil
**Core Principles:**
1. Großzügige Weißräume als Zeichen von Qualität und Vertrauen
2. Typografie als visuelles Element: Große, mutige Zahlen
3. Klare Sektionierung durch Hintergrundwechsel (Weiß → Hellblau → Weiß)
4. Mobile-first mit natürlichem vertikalem Flow

**Color Philosophy:** Reines Weiß als Basis. Royalblau (#1E40AF) als Primärfarbe. Hellblau (#DBEAFE) als Sektionshintergrund. Dunkelblau (#1E3A5F) für Headlines. Grün (#059669) für positive Ergebnisse.

**Layout Paradigm:** Vertikaler Flow mit klaren Sektionen. Hero-Bereich mit großem Titel und kompaktem Formular darunter. Ergebnisse als breite Karten-Grid. Pro-Bereich als eigene Sektion mit blauem Hintergrund.

**Signature Elements:**
1. Große numerische Ergebnisse mit farbiger Untermalung
2. Horizontale Trennlinien mit Gradient
3. Sticky CTA-Bar am unteren Rand auf Mobile

**Interaction Philosophy:** Klarer Button-Flow. Formular → Berechnung → Ergebnisse. Pro-Upgrade als prominente Sektion.

**Animation:** Fade-in beim Scroll. Zahl-Counter beim Erscheinen der Ergebnisse.

**Typography System:** "Playfair Display" für große Headlines (editorial, vertrauenswürdig). "Source Sans Pro" für Body und Formulare.
</idea>
<probability>0.06</probability>
</response>

## Gewählter Ansatz: Financial Dashboard / Data Visualization First

**Begründung:** Dieser Ansatz kombiniert professionelle Finanz-Ästhetik mit einer klaren App-Logik. Das zweispaltige Layout ermöglicht Live-Berechnungen ohne Scroll, was die UX erheblich verbessert. Die Glasmorphismus-Karten für Pro-Features schaffen eine elegante visuelle Trennung zwischen Free und Pro.
