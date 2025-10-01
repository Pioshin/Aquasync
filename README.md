# Aquasync

Calendario per la gestione delle lezioni in piscina - Applicazione web React con integrazione Supabase.

## 🚀 Caratteristiche

- ✅ Gestione calendario lezioni di nuoto
- ✅ Interfaccia intuitiva e responsive
- ✅ Integrazione con database Supabase
- ✅ Deploy automatico su GitHub Pages
- ✅ Creazione, visualizzazione ed eliminazione lezioni

## 📋 Prerequisiti

- Node.js 20.x o superiore
- Account Supabase (gratuito)
- Repository GitHub

## 🔧 Setup del Database Supabase

1. Crea un account su [Supabase](https://supabase.com/)
2. Crea un nuovo progetto
3. Vai su "SQL Editor" ed esegui il seguente script per creare la tabella:

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

-- Policy per permettere inserimento a tutti (opzionale - puoi restringere)
CREATE POLICY "Enable insert for all users" ON lessons
  FOR INSERT WITH CHECK (true);

-- Policy per permettere eliminazione a tutti (opzionale - puoi restringere)
CREATE POLICY "Enable delete for all users" ON lessons
  FOR DELETE USING (true);
```

4. Prendi nota di:
   - URL del progetto (Project Settings > API > Project URL)
   - Chiave Anon pubblica (Project Settings > API > anon public key)

## 🛠️ Installazione Locale

1. Clona il repository:
```bash
git clone https://github.com/Pioshin/Aquasync.git
cd Aquasync
```

2. Installa le dipendenze:
```bash
npm install
```

3. Crea un file `.env` nella root del progetto basato su `.env.example`:
```bash
cp .env.example .env
```

4. Modifica `.env` con le tue credenziali Supabase:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

5. Avvia il server di sviluppo:
```bash
npm run dev
```

6. Apri il browser su `http://localhost:5173`

## 📦 Deploy su GitHub Pages

### Configurazione Repository

1. Vai su Settings > Pages nel tuo repository GitHub
2. In "Source" seleziona "GitHub Actions"

### Configurazione Secrets

1. Vai su Settings > Secrets and variables > Actions
2. Aggiungi i seguenti secrets:
   - `VITE_SUPABASE_URL`: Il tuo Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY`: La tua Supabase Anon Key

### Deploy

Il deploy avviene automaticamente ad ogni push sul branch `main`. Puoi anche eseguirlo manualmente:

1. Vai su Actions nel repository
2. Seleziona "Deploy to GitHub Pages"
3. Clicca su "Run workflow"

L'applicazione sarà disponibile su: `https://pioshin.github.io/Aquasync/`

## 📱 Utilizzo

1. **Aggiungere una lezione**: Compila il form con titolo, data, ora, istruttore e capacità
2. **Visualizzare lezioni**: Tutte le lezioni programmate sono mostrate nel calendario
3. **Eliminare una lezione**: Clicca sul pulsante X sulla card della lezione

## 🛡️ Sicurezza

- Le credenziali Supabase sono gestite tramite GitHub Secrets
- Mai committare il file `.env` nel repository
- Le Row Level Security (RLS) policies proteggono il database

## 🔨 Build

Per creare una build di produzione:

```bash
npm run build
```

I file ottimizzati saranno nella cartella `dist/`.

## 🧪 Tecnologie Utilizzate

- **React 19** - Framework UI
- **Vite** - Build tool e dev server
- **Supabase** - Backend as a Service (Database)
- **GitHub Pages** - Hosting
- **GitHub Actions** - CI/CD

## 📝 Licenza

ISC

## 👥 Contributi

Contributi, issues e feature requests sono benvenuti!
