# 📡 Documentazione API REST di BandMate

Questa guida fornisce l'elenco completo degli endpoint esposti dal server backend di **BandMate**, i dettagli sui parametri di richiesta, i formati di risposta, i codici di stato HTTP e le istruzioni pratiche per l'invocazione tramite JavaScript (`fetch`), `curl` e PowerShell.

---

## 🌐 Base URL & Configurazione

| Ambiente | URL Base | Note |
|---|---|---|
| **Backend Standalone** | `http://localhost:3001` | Server Express diretto |
| **Frontend Dev (Vite Proxy)** | `http://localhost:5173/api` | Instradamento automatico tramite proxy |

Tutti gli endpoint applicativi sono prefissati da `/api`.

---

## 🔐 Autenticazione & Header

BandMate adotta un sistema di autenticazione basato su **Bearer Token**.

### Come autenticarsi:
1. Effettua una richiesta a `POST /api/auth/login` o `POST /api/auth/register`.
2. Ricevi un token casuale crittografico a 64 caratteri nella risposta (chiave `token`).
3. Includi il token nell'header di tutte le richieste protette:
   ```http
   Authorization: Bearer <il_tuo_token>
   ```

### Header Comuni
- `Content-Type: application/json` (per richieste con body POST / PUT)
- `Authorization: Bearer <token>` (per endpoint protetti)

---

## 🚦 Formato Risposte ed Errori

### Risposta di Successo
Le risposte di successo ritornano codici `200 OK` o `201 Created` con payload JSON strutturato.

### Risposta di Errore
In caso di errore di validazione, autenticazione o risorsa non trovata, l'API restituisce:
```json
{
  "error": "Descrizione chiara del problema riscontrato"
}
```

Codici HTTP utilizzati:
- `200 OK`: Operazione completata con successo.
- `201 Created`: Risorsa creata con successo.
- `400 Bad Request`: Parametri mancanti o non validi.
- `401 Unauthorized`: Token mancante, non valido o credenziali errate.
- `403 Forbidden`: L'utente non ha i permessi per modificare la risorsa.
- `404 Not Found`: Risorsa non trovata nel database.

---

## 📋 Elenco Completo degli Endpoint

---

### 1. Sistema & Salute

#### `GET /api/health`
Verifica lo stato del server API.
- **Autenticazione**: Non richiesta
- **Risposta `200 OK`**:
  ```json
  {
    "status": "ok",
    "service": "BandMate API",
    "timestamp": "2026-09-10T10:17:02.925Z"
  }
  ```

---

### 2. Autenticazione (`/api/auth`)

#### `GET /api/auth/demo-accounts`
Restituisce la lista degli account di prova preconfigurati nel database per il login rapido di test.
- **Autenticazione**: Non richiesta
- **Risposta `200 OK`**:
  ```json
  {
    "demoAccounts": [
      {
        "name": "Davide De Luca",
        "role": "Chitarrista (Milano)",
        "email": "davide@bandmate.it",
        "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb..."
      }
    ],
    "defaultPassword": "password123"
  }
  ```

---

#### `POST /api/auth/register`
Registra un nuovo utente e crea la sua scheda musicista associata nel database SQLite.
- **Autenticazione**: Non richiesta
- **Body JSON**:
  | Campo | Tipo | Obbligatorio | Descrizione |
  |---|---|---|---|
  | `email` | `string` | **Sì** | Email univoca dell'utente |
  | `password` | `string` | **Sì** | Minimo 6 caratteri |
  | `name` | `string` | **Sì** | Nome e cognome o nome d'arte |
  | `age` | `number` | **Sì** | Età del musicista (14 - 99) |
  | `gender` | `string` | **Sì** | `'Uomo'`, `'Donna'`, `'Non binario'`, `'Preferisco non specificare'` |
  | `city` | `string` | **Sì** | Città di provenienza (es. `'Milano (MI)'`) |
  | `region` | `string` | No | Regione |
  | `instruments` | `array` | **Sì** | Array di oggetti `InstrumentItem` |
  | `genres` | `string[]` | No | Array di generi musicali |
  | `bio` | `string` | No | Biografia e presentazione |
  | `availability` | `string` | No | Stato disponibilità (es. `'Disponibile per Jam'`) |
  | `experienceYears`| `number` | No | Anni di esperienza |
  | `phoneOrContact`| `string` | No | Email o contatto visibile nella scheda |
  | `avatar` | `string` | No | URL immagine profilo |

- **Esempio Body**:
  ```json
  {
    "email": "lucarossi@music.it",
    "password": "segretosicuro",
    "name": "Luca Rossi",
    "age": 27,
    "gender": "Uomo",
    "city": "Bologna (BO)",
    "instruments": [
      { "name": "Basso Elettrico", "level": "Avanzato", "isPrimary": true }
    ],
    "genres": ["Funk", "Rock"],
    "bio": "Bassista con esperienza live e studio...",
    "availability": "Disponibile per Jam",
    "experienceYears": 6,
    "phoneOrContact": "@lucabass_ig"
  }
  ```
- **Risposta `201 Created`**:
  ```json
  {
    "token": "7a8f09b...64_caratteri_esadecimali",
    "user": {
      "id": "u_1789035450680",
      "email": "lucarossi@music.it"
    },
    "musician": {
      "id": "m_1789035450680",
      "userId": "u_1789035450680",
      "name": "Luca Rossi",
      "username": "lucarossi_412",
      "age": 27,
      "gender": "Uomo",
      "city": "Bologna (BO)",
      "instruments": [{ "name": "Basso Elettrico", "level": "Avanzato", "isPrimary": true }],
      "genres": ["Funk", "Rock"],
      "bio": "Bassista con esperienza live e studio...",
      "availability": "Disponibile per Jam",
      "experienceYears": 6,
      "phoneOrContact": "@lucabass_ig",
      "avatar": "https://...",
      "createdAt": "2026-09-10T10:30:00.000Z"
    }
  }
  ```

---

#### `POST /api/auth/login`
Esegue il login verificando l'hash della password (`scryptSync`) e rilascia un token di sessione.
- **Autenticazione**: Non richiesta
- **Body JSON**:
  ```json
  {
    "email": "davide@bandmate.it",
    "password": "password123"
  }
  ```
- **Risposta `200 OK`**:
  Restituisce `{ "token": "...", "user": {...}, "musician": {...} }`.

---

#### `GET /api/auth/me`
Recupera l'utente e il profilo musicista associati al token inviato.
- **Autenticazione**: **Richiesta** (`Bearer <token>`)
- **Risposta `200 OK`**:
  ```json
  {
    "user": { "id": "u_m1", "email": "davide@bandmate.it" },
    "musician": { "id": "m1", "name": "Davide De Luca", ... }
  }
  ```

---

#### `POST /api/auth/logout`
Invalida e revoca il token di sessione rimuovendolo dalla tabella `sessions`.
- **Autenticazione**: Opzionale / Consigliata (`Bearer <token>`)
- **Risposta `200 OK`**:
  ```json
  { "success": true }
  ```

---

### 3. Musicisti (`/api/musicians`)

#### `GET /api/musicians`
Restituisce l'elenco dei musicisti registrati nel database. Supporta molteplici parametri di filtro combinabili.
- **Autenticazione**: Non richiesta
- **Parametri Query (URL Query String)**:
  - `search`: cerca per sottostringa in nome, bio o strumenti.
  - `instrument`: filtra per strumento esatto (es. `Basso Elettrico`, `Batteria`).
  - `city`: filtra per città (es. `Milano`, `Roma`, `Bologna`).
  - `genre`: filtra per genere musicale (es. `Rock`, `Funk`, `Jazz`).
- **Esempio Chiamata**:
  `GET /api/musicians?instrument=Basso+Elettrico&city=Milano`
- **Risposta `200 OK`**:
  ```json
  {
    "musicians": [
      {
        "id": "m2",
        "userId": "u_m2",
        "name": "Giulia Moretti",
        "age": 24,
        "gender": "Donna",
        "city": "Bologna (BO)",
        "instruments": [
          { "name": "Basso Elettrico", "level": "Professionista", "isPrimary": true }
        ],
        "genres": ["Funk", "Neo-Soul", "Jazz Fusion"],
        "bio": "Bassista con un debole per i bassline funk...",
        "availability": "Cerco Band fissa",
        "experienceYears": 8,
        "phoneOrContact": "giulia.bassgroove@gmail.com",
        "avatar": "https://...",
        "createdAt": "2026-09-10T10:11:34.205Z"
      }
    ]
  }
  ```

---

#### `GET /api/musicians/:id`
Recupera la scheda completa di un singolo musicista tramite il suo ID.
- **Autenticazione**: Non richiesta
- **Parametro URL**: `:id` (es. `m1`)
- **Risposta `200 OK`**:
  ```json
  {
    "musician": { "id": "m1", "name": "Davide De Luca", ... }
  }
  ```

---

#### `PUT /api/musicians/:id`
Aggiorna le informazioni personali e musicali della propria scheda profilo.
- **Autenticazione**: **Richiesta** (Solo il proprietario del profilo può modificarlo)
- **Parametro URL**: `:id` del musicista
- **Body JSON** (campi parziali ammessi):
  ```json
  {
    "name": "Davide De Luca",
    "age": 27,
    "city": "Milano (MI)",
    "bio": "Nuova biografia aggiornata...",
    "availability": "Disponibile per serate/live",
    "instruments": [
      { "name": "Chitarra Elettrica", "level": "Professionista", "isPrimary": true },
      { "name": "Basso Elettrico", "level": "Intermedio" }
    ],
    "genres": ["Rock", "Blues", "Funk"]
  }
  ```
- **Risposta `200 OK`**:
  ```json
  {
    "musician": { ...profilo_aggiornato... }
  }
  ```

---

### 4. Eventi & Jam Session (`/api/events`)

#### `GET /api/events`
Restituisce la lista degli eventi e delle jam session ordinate cronologicamente per data e ora.
- **Autenticazione**: Non richiesta
- **Parametri Query**:
  - `city`: filtra per città (es. `Milano`, `Roma`).
  - `type`: filtra per tipo (`Jam Session`, `Prove di Gruppo`, `Live / Concerto`, `Aperitivo Musicale`, `Workshop`).
- **Risposta `200 OK`**:
  ```json
  {
    "events": [
      {
        "id": "e1",
        "organizerId": "m3",
        "title": "Milano Funk & Soul Open Jam Session",
        "description": "Serata jam a ruota libera...",
        "type": "Jam Session",
        "date": "2026-09-22",
        "time": "21:00",
        "locationName": "SoundLab Rehearsal Studios - Sala A",
        "address": "Via Tortona 32",
        "city": "Milano (MI)",
        "genres": ["Funk", "Soul", "Groove"],
        "slots": [
          {
            "id": "s1",
            "instrument": "Batteria",
            "maxCount": 1,
            "assignedMusicians": [
              {
                "musicianId": "m3",
                "musicianName": "Marco Bianchi",
                "musicianAvatar": "https://...",
                "joinedAt": "2026-09-10"
              }
            ]
          },
          {
            "id": "s2",
            "instrument": "Basso Elettrico",
            "maxCount": 1,
            "assignedMusicians": []
          }
        ],
        "equipmentNotes": "Batteria Yamaha e ampli presenti...",
        "createdAt": "2026-09-10"
      }
    ]
  }
  ```

---

#### `POST /api/events`
Crea una nuova jam session o evento con slot strumentali personalizzati.
- **Autenticazione**: **Richiesta**
- **Body JSON**:
  | Campo | Tipo | Obbligatorio | Descrizione |
  |---|---|---|---|
  | `title` | `string` | **Sì** | Titolo dell'evento |
  | `description`| `string` | No | Descrizione del programma |
  | `type` | `string` | No | Tipo di evento (default: `'Jam Session'`) |
  | `date` | `string` | **Sì** | Data formato `'YYYY-MM-DD'` |
  | `time` | `string` | **Sì** | Orario formato `'HH:MM'` |
  | `locationName`| `string`| **Sì** | Nome sala o luogo |
  | `address` | `string` | No | Indirizzo civico |
  | `city` | `string` | **Sì** | Città |
  | `genres` | `string[]` | No | Generi musicali |
  | `slots` | `array` | **Sì** | Array di `{ instrument: string, maxCount: number }` |
  | `equipmentNotes`| `string`| No | Dettagli sulla strumentazione in sala |

- **Esempio Body**:
  ```json
  {
    "title": "Jam Rock anni 90 a Bologna",
    "description": "Cover Nirvana, Pearl Jam, Soundgarden...",
    "type": "Jam Session",
    "date": "2026-10-05",
    "time": "21:30",
    "locationName": "Bologna Music Studio",
    "address": "Via Indipendenza 40",
    "city": "Bologna (BO)",
    "genres": ["Rock", "Grunge"],
    "slots": [
      { "instrument": "Batteria", "maxCount": 1 },
      { "instrument": "Basso Elettrico", "maxCount": 1 },
      { "instrument": "Chitarra Elettrica", "maxCount": 2 },
      { "instrument": "Voce", "maxCount": 1 }
    ],
    "equipmentNotes": "Amplificatori Marshall e impianto voce inclusi"
  }
  ```
- **Risposta `201 Created`**: Restituisce l'oggetto evento creato con gli ID univoci generati per gli slot.

---

#### `POST /api/events/:id/join`
Iscrive l'utente autenticato a uno slot strumento specifico di una jam session.
- **Autenticazione**: **Richiesta**
- **Parametro URL**: `:id` dell'evento
- **Body JSON**:
  ```json
  {
    "slotId": "s2"
  }
  ```
- **Regole di Validazione**:
  - Verifica che lo slot esista e abbia ancora posti liberi (`assignedMusicians.length < maxCount`).
  - Verifica che l'utente non sia già iscritto a un altro slot dello stesso evento.
- **Risposta `200 OK`**: Restituisce l'evento aggiornato con l'utente iscritto nello slot.

---

#### `POST /api/events/:id/leave`
Rinuncia e libera il proprio posto precedentemente prenotato in uno slot strumento.
- **Autenticazione**: **Richiesta**
- **Parametro URL**: `:id` dell'evento
- **Body JSON**:
  ```json
  {
    "slotId": "s2"
  }
  ```
- **Risposta `200 OK`**: Restituisce l'evento aggiornato con il posto liberato.

---

### 5. Bacheca Annunci (`/api/posts`)

#### `GET /api/posts`
Restituisce gli annunci pubblicati nella bacheca della community, ordinati dal più recente.
- **Autenticazione**: Non richiesta
- **Parametro Query**:
  - `category`: filtra per categoria (`cercasi-musicista`, `cercasi-band`, `proposta-jam`, `generale`).
- **Risposta `200 OK`**:
  ```json
  {
    "posts": [
      {
        "id": "p1",
        "authorId": "m2",
        "category": "cercasi-band",
        "title": "Bassista funk/soul cerca gruppo a Bologna",
        "content": "Ciao a tutti! Suono il basso elettrico da 8 anni...",
        "city": "Bologna (BO)",
        "targetInstruments": ["Batteria", "Chitarra Elettrica", "Voce"],
        "genres": ["Funk", "Soul"],
        "likes": ["m1", "m3"],
        "comments": [
          {
            "id": "c1",
            "authorId": "m5",
            "authorName": "Samuele Ferraro",
            "authorAvatar": "https://...",
            "authorInstrument": "Tastiere/Pianoforte",
            "content": "Ciao Giulia! Se organizzi una jam fammi sapere!",
            "createdAt": "2026-09-10T10:00:00.000Z"
          }
        ],
        "createdAt": "2026-09-10T09:00:00.000Z"
      }
    ]
  }
  ```

---

#### `POST /api/posts`
Pubblica un nuovo annuncio pubblico in bacheca.
- **Autenticazione**: **Richiesta**
- **Body JSON**:
  | Campo | Tipo | Obbligatorio | Descrizione |
  |---|---|---|---|
  | `category` | `string` | **Sì** | `'cercasi-musicista'`, `'cercasi-band'`, `'proposta-jam'`, `'generale'` |
  | `title` | `string` | **Sì** | Titolo dell'annuncio |
  | `content` | `string` | **Sì** | Testo descrittivo |
  | `city` | `string` | **Sì** | Città di riferimento |
  | `targetInstruments`| `string[]`| No | Strumenti ricercati o d'interesse |
  | `genres` | `string[]`| No | Generi musicali del progetto |

- **Esempio Body**:
  ```json
  {
    "category": "cercasi-musicista",
    "title": "Cercasi batterista rock a Milano per registrazioni studio",
    "content": "Abbiamo 6 brani inediti già arrangiati in pre-produzione...",
    "city": "Milano (MI)",
    "targetInstruments": ["Batteria"],
    "genres": ["Hard Rock", "Alternative"]
  }
  ```
- **Risposta `201 Created`**: Restituisce il post creato.

---

#### `POST /api/posts/:id/like`
Aggiunge o rimuove il proprio like / applauso 🎸 dall'annuncio (toggle idempotente).
- **Autenticazione**: **Richiesta**
- **Parametro URL**: `:id` del post
- **Risposta `200 OK`**: Restituisce il post aggiornato con l'array dei like ricalcolato.

---

#### `POST /api/posts/:id/comments`
Aggiunge una risposta pubblica sotto a un annuncio, mostrando nome, avatar e strumento principale dell'autore per favorire contatti trasparenti (in assenza di DM).
- **Autenticazione**: **Richiesta**
- **Parametro URL**: `:id` del post
- **Body JSON**:
  ```json
  {
    "content": "Ciao! Sono interessato al progetto, posso mandarvi una registrazione?"
  }
  ```
- **Risposta `201 Created` / `200 OK`**: Restituisce il post aggiornato con il nuovo commento inserito.

---

## 💻 Esempi Pratici di Invocazione

### Esempio 1: Chiamata con JavaScript / TypeScript (`fetch`)

```typescript
// 1. Login e salvataggio del token
async function loginAndFetchProfile() {
  const loginRes = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'davide@bandmate.it',
      password: 'password123'
    })
  });

  const { token, musician } = await loginRes.json();
  console.log('Login riuscito per:', musician.name);

  // 2. Chiamata protetta per prenotare uno slot jam
  const joinRes = await fetch('http://localhost:3001/api/events/e1/join', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ slotId: 's2' })
  });

  const { event } = await joinRes.json();
  console.log('Posto riservato nell\'evento:', event.title);
}
```

---

### Esempio 2: Chiamata con `curl` (Terminale)

```bash
# Registrazione nuovo musicista
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nuovo@bandmate.it",
    "password": "password123",
    "name": "Alex Conti",
    "age": 28,
    "gender": "Uomo",
    "city": "Firenze (FI)",
    "instruments": [{"name":"Sassofono","level":"Avanzato","isPrimary":true}],
    "genres": ["Jazz","Funk"]
  }'

# Ricerca musicisti a Bologna
curl -X GET "http://localhost:3001/api/musicians?city=Bologna&instrument=Basso+Elettrico"
```

---

### Esempio 3: Chiamata con PowerShell

```powershell
# Recupero lista eventi
$events = Invoke-RestMethod -Uri "http://localhost:5173/api/events" -Method Get
$events.events | Format-Table id, title, city, date, type

# Pubblicazione nuovo annuncio in bacheca con Token
$headers = @{
    "Authorization" = "Bearer <IL_TUO_TOKEN>"
    "Content-Type"  = "application/json"
}
$body = @{
    category          = "proposta-jam"
    title             = "Jam serale a Milano Lambrate"
    content           = "Cercasi musicisti per provare stasera"
    city              = "Milano (MI)"
    targetInstruments = @("Chitarra Elettrica", "Basso Elettrico")
    genres            = @("Rock")
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5173/api/posts" -Method Post -Headers $headers -Body $body
```
