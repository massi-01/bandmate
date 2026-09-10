# 🎸 BandMate - Social Network per Musicisti

> Connettiti, trova musicisti nella tua zona e organizza jam session indimenticabili.

**BandMate** è una web app full-stack moderna pensata per permettere ai musicisti di incontrarsi, formare band, organizzare jam session ed eventi dal vivo e interagire tramite una bacheca annunci pubblica.

---

## ✨ Funzionalità Principali

- 👤 **Profili Musicisti Completi**:
  - Dati personali: **Nome, Età, Sesso, Provenienza (Città/Regione)**.
  - **Strumenti Suonati** con livello (*Principiante*, *Intermedio*, *Avanzato*, *Professionista*) e indicazione dello strumento principale.
  - Generi preferiti, biografia, stato di disponibilità (*Disponibile per Jam*, *Cerco Band fissa*, ecc.) e contatto pubblico.
- 📅 **Organizzazione Eventi & Jam Session ("Suonare Insieme")**:
  - Creazione eventi e jam con definizione di **Slot Strumentali** (es. 1 Batterista, 1 Bassista, 2 Chitarristi, 1 Cantante).
  - Prenotazione e rilascio interattivo del posto nello slot strumento desiderato.
- 💬 **Bacheca Social & Feed Annunci**:
  - Post pubblici categorizzati (*Cercasi Musicista*, *Cercasi Band*, *Proposta Jam*, *Generale*).
  - Sistema di like / applausi 🎸 e risposte pubbliche sotto a ciascun post (in assenza di messaggistica privata DM).
- 🔐 **Autenticazione & Account**:
  - Registrazione completa del profilo musicista con password cifrata via `crypto.scryptSync`.
  - Login con token di sessione Bearer.
  - Sezione account demo 1-click per testare immediatamente la social experience da diversi punti di vista (Davide, Giulia, Marco, Chiara, Samuele).
- 🗄️ **Database Relazionale SQLite**:
  - Persistenza reale su file `data/bandmate.db` tramite il modulo nativo `node:sqlite`.
  - Vincoli di integrità referenziale e cancellazione a cascata.
- 📡 **API Layer REST Separato**:
  - Backend Express modulare per disaccoppiare completamente la presentazione frontend dal recupero dei dati.
  - Client API tipizzato (`src/services/api.ts`).

---

## 🛠️ Stack Tecnologico

- **Frontend**: React 19, TypeScript, Vite, Vanilla CSS (Design system dark mode, glassmorphism, responsive).
- **Backend**: Node.js v22 (con `--experimental-strip-types`), Express, CORS.
- **Database**: SQLite nativo (`node:sqlite`).
- **Icone & Grafica**: `lucide-react`.

---

## 🚀 Come Avviare il Progetto in Locale

### 1. Installazione delle dipendenze
```bash
npm install
```

### 2. Avvio del Server API Backend
In un terminale, avvia il server Express con SQLite su porta `3001`:
```bash
npm run server
```

### 3. Avvio del Frontend Vite
In un secondo terminale, avvia l'interfaccia utente su porta `5173`:
```bash
npm run dev
```

Apri **`http://localhost:5173/`** nel tuo browser. Le chiamate verso `/api/*` verranno automaticamente instradate al server backend.

---

## 📚 Documentazione

I dettagli tecnici completi sono disponibili nella cartella `docs/`:

- 📡 [**docs/API.md**](docs/API.md): Documentazione completa di tutti gli endpoint REST, parametri query, body, risposte ed esempi in `fetch`, `curl` e PowerShell.
- 🗄️ [**docs/MODELS.md**](docs/MODELS.md): Diagramma Entity-Relationship (Mermaid), tabelle SQL, attributi, tipi TypeScript e vincoli relazionali.

---

## 📄 Licenza

Distribuito con licenza MIT.
