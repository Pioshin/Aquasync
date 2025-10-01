# Guida Setup Completa - Aquasync

Questa guida ti accompagnerà passo passo nella configurazione completa di Aquasync, dalla creazione del database Supabase fino al deploy su GitHub Pages.

## 📊 Parte 1: Setup Database Supabase

### 1.1 Creare un Account Supabase

1. Vai su [https://supabase.com/](https://supabase.com/)
2. Clicca su "Start your project" o "Sign Up"
3. Puoi registrarti con GitHub, email o altri provider OAuth
4. Conferma il tuo indirizzo email

### 1.2 Creare un Nuovo Progetto

1. Dopo il login, clicca su "New Project"
2. Seleziona la tua organization (o creane una nuova)
3. Compila i campi:
   - **Name**: `Aquasync` (o un nome a tua scelta)
   - **Database Password**: Genera una password sicura (salvala!)
   - **Region**: Scegli la regione più vicina (es. "Europe West" per Italia)
   - **Pricing Plan**: Seleziona "Free" per iniziare
4. Clicca su "Create new project"
5. Attendi 1-2 minuti per la creazione del progetto

### 1.3 Creare la Tabella Lessons

1. Nel dashboard del progetto, vai su **SQL Editor** (nella sidebar sinistra)
2. Clicca su "New Query"
3. Copia e incolla il seguente codice SQL:

```sql
-- Creazione tabella lessons
CREATE TABLE lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  instructor TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Abilita Row Level Security
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- Policy per permettere lettura a tutti
CREATE POLICY "Enable read access for all users" ON lessons
  FOR SELECT USING (true);

-- Policy per permettere inserimento a tutti
CREATE POLICY "Enable insert for all users" ON lessons
  FOR INSERT WITH CHECK (true);

-- Policy per permettere eliminazione a tutti
CREATE POLICY "Enable delete for all users" ON lessons
  FOR DELETE USING (true);

-- Inserisci alcuni dati di esempio (opzionale)
INSERT INTO lessons (title, date, time, instructor, capacity) VALUES
  ('Nuoto Principianti', CURRENT_DATE + 1, '10:00', 'Mario Rossi', 15),
  ('Nuoto Intermedio', CURRENT_DATE + 2, '11:00', 'Laura Bianchi', 12),
  ('Acquagym', CURRENT_DATE + 3, '15:00', 'Giovanni Verdi', 20);
```

4. Clicca su "Run" (o premi Ctrl/Cmd + Enter)
5. Dovresti vedere "Success. No rows returned" - questo è normale!

### 1.4 Ottenere le Credenziali API

1. Vai su **Project Settings** (icona ingranaggio in basso a sinistra)
2. Clicca su **API** nella sidebar
3. Nella sezione "Project API keys" troverai:
   - **Project URL**: simile a `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key**: una lunga stringa che inizia con `eyJ...`
4. **COPIA ENTRAMBI** - ti serviranno nel prossimo step!

> ⚠️ **Importante**: La chiave `anon public` è sicura da esporre pubblicamente. NON usare mai la `service_role` key nel frontend!

## 🔐 Parte 2: Configurare GitHub Secrets

### 2.1 Accedere alle Impostazioni del Repository

1. Vai sul tuo repository GitHub: `https://github.com/Pioshin/Aquasync`
2. Clicca su **Settings** (tab in alto)
3. Nella sidebar sinistra, clicca su **Secrets and variables** > **Actions**

### 2.2 Aggiungere i Secrets

1. Clicca su **New repository secret**
2. Aggiungi il primo secret:
   - **Name**: `VITE_SUPABASE_URL`
   - **Value**: Incolla il "Project URL" copiato da Supabase
   - Clicca **Add secret**

3. Clicca nuovamente su **New repository secret**
4. Aggiungi il secondo secret:
   - **Name**: `VITE_SUPABASE_ANON_KEY`
   - **Value**: Incolla la "anon public key" copiata da Supabase
   - Clicca **Add secret**

5. Verifica che entrambi i secrets siano presenti nell'elenco

## 🚀 Parte 3: Abilitare GitHub Pages

### 3.1 Configurare GitHub Pages

1. Sempre nelle **Settings** del repository
2. Clicca su **Pages** nella sidebar sinistra
3. In "Build and deployment":
   - **Source**: Seleziona "GitHub Actions"
   - (Non c'è altro da configurare qui!)
4. Salva (se richiesto)

### 3.2 Attivare il Workflow

Il workflow si attiverà automaticamente con il prossimo push sul branch `main`. Ma puoi anche attivarlo manualmente:

1. Vai su **Actions** (tab in alto del repository)
2. Nella sidebar sinistra, clicca su "Deploy to GitHub Pages"
3. Clicca sul pulsante **Run workflow** (in alto a destra)
4. Seleziona `main` branch
5. Clicca **Run workflow**

### 3.3 Monitorare il Deployment

1. Vedrai apparire un nuovo workflow in esecuzione
2. Clicca sul workflow per vedere i dettagli
3. Il processo richiede circa 1-2 minuti
4. Se tutto va bene, vedrai un segno di spunta verde ✓

### 3.4 Accedere all'Applicazione

1. Torna su **Settings** > **Pages**
2. In alto vedrai un messaggio: "Your site is live at https://pioshin.github.io/Aquasync/"
3. Clicca sul link o aprilo nel browser
4. L'applicazione Aquasync dovrebbe essere visibile e funzionante!

## 🧪 Parte 4: Testare l'Applicazione

### 4.1 Test della Connessione Supabase

1. Apri l'applicazione su GitHub Pages
2. Apri la Console del Browser (F12 o Ctrl+Shift+I)
3. Vai alla tab "Console"
4. Se ci sono errori relativi a Supabase, verifica:
   - I secrets sono configurati correttamente?
   - Il workflow è stato eseguito dopo aver aggiunto i secrets?

### 4.2 Test Funzionalità CRUD

1. **Create (Creare)**: Compila il form e aggiungi una nuova lezione
   - Verifica che appaia nella lista
2. **Read (Leggere)**: Ricarica la pagina
   - Le lezioni dovrebbero rimanere visibili (dati persistiti)
3. **Delete (Eliminare)**: Clicca sul pulsante X su una lezione
   - La lezione dovrebbe scomparire dalla lista

## 🔧 Parte 5: Development Locale (Opzionale)

Se vuoi lavorare sul progetto in locale:

### 5.1 Clonare il Repository

```bash
git clone https://github.com/Pioshin/Aquasync.git
cd Aquasync
```

### 5.2 Installare le Dipendenze

```bash
npm install
```

### 5.3 Configurare Environment Variables

1. Copia il file di esempio:
```bash
cp .env.example .env
```

2. Modifica `.env` con le tue credenziali Supabase:
```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### 5.4 Avviare il Dev Server

```bash
npm run dev
```

Apri http://localhost:5173 nel browser.

### 5.5 Build per Produzione

```bash
npm run build
```

I file ottimizzati saranno in `dist/`.

## 🐛 Troubleshooting

### Problema: L'app non si connette al database

**Soluzione:**
1. Verifica che i secrets GitHub siano impostati correttamente
2. Controlla che il workflow sia stato eseguito DOPO aver aggiunto i secrets
3. Verifica nella console del browser eventuali errori specifici

### Problema: GitHub Pages mostra pagina 404

**Soluzione:**
1. Verifica che il workflow sia completato con successo
2. Controlla che "GitHub Actions" sia selezionato come source in Settings > Pages
3. Attendi qualche minuto - a volte ci vuole tempo per la propagazione

### Problema: Le lezioni non vengono salvate

**Soluzione:**
1. Controlla che la tabella `lessons` sia stata creata su Supabase
2. Verifica le RLS policies - devono permettere insert/delete
3. Controlla la console del browser per errori

### Problema: Build fallisce in GitHub Actions

**Soluzione:**
1. Verifica i log del workflow nella tab Actions
2. Assicurati che i secrets siano impostati (anche se vuoti temporaneamente)
3. Controlla che non ci siano errori di sintassi nel codice

## 📝 Note di Sicurezza

- **NON** committare mai file `.env` nel repository
- I secrets GitHub sono sicuri e non visibili nel codice
- La chiave `anon public` può essere usata nel frontend
- Per un'app production, configura RLS policies più restrittive
- Considera l'aggiunta di autenticazione utente per gestire le lezioni

## 🎉 Prossimi Passi

Ora che l'applicazione è configurata, puoi:

1. Personalizzare l'interfaccia modificando `src/App.css`
2. Aggiungere nuove funzionalità in `src/App.jsx`
3. Implementare autenticazione con Supabase Auth
4. Aggiungere più campi alla tabella lessons (es. livello, prezzo)
5. Creare una dashboard per gli istruttori

## 📚 Risorse Utili

- [Documentazione Supabase](https://supabase.com/docs)
- [Documentazione React](https://react.dev/)
- [Documentazione Vite](https://vitejs.dev/)
- [Documentazione GitHub Pages](https://docs.github.com/pages)

---

**Buon lavoro con Aquasync! 🏊‍♂️**
