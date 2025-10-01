# 🔐 Configurazione Ambienti TEST/LIVE

Guida completa per configurare correttamente la separazione tra ambiente di test e produzione in AquaSync.

## 🎯 Panoramica

AquaSync supporta due ambienti completamente separati:

- **🧪 TEST**: Per demo, sviluppo e testing
- **🚀 LIVE**: Per produzione reale delle scuole di nuoto

## 📋 Setup Iniziale

### 1. Configurazione Organizzazioni Base

Esegui **UNA SOLA VOLTA** nel database Supabase:

```sql
-- File: sql/organizations.sql
```

Questo script:
- ✅ Crea le tabelle base
- ✅ Crea organizzazioni TEST e LIVE
- ✅ Aggiunge supporto multi-tenant
- ✅ Configura Row Level Security

### 2. Setup Ambiente TEST (Demo)

Per configurare l'ambiente demo con utenti predefiniti:

```sql
-- File: sql/setup_test_users.sql
```

**Credenziali TEST create:**
- 👑 **Admin**: `admin` / `admin123`
- 👨‍🏫 **Istruttori**:
  - `marco` / `teacher123`
  - `giulia` / `teacher123`
  - `andrea` / `teacher123`

### 3. Setup Ambiente LIVE (Produzione)

⚠️ **IMPORTANTE**: Esegui SOLO quando pronto per produzione!

```sql
-- File: sql/setup_live_admin.sql
```

**Credenziali LIVE create:**
- 👑 **Admin LIVE**: `Aquadmin` / `Aquasync2025!`

## 🔒 Sicurezza e Separazione

### Caratteristiche di Sicurezza:

1. **Credenziali Separate**:
   - TEST: Credenziali demo pubbliche
   - LIVE: Credenziali produzione sicure

2. **Dati Completamente Separati**:
   - Ogni ambiente ha i suoi utenti
   - Lezioni e disponibilità separate
   - Nessuna contaminazione tra ambienti

3. **Autenticazione Specifica**:
   - Login verifica ambiente selezionato
   - Messgi di errore specifici per ambiente
   - Validazione credenziali per organizzazione

## 🚀 Processo di Deploy

### Per Ambiente TEST:
1. ✅ Esegui `sql/organizations.sql`
2. ✅ Esegui `sql/setup_test_users.sql`
3. ✅ Testa con credenziali demo
4. ✅ Verifica funzionalità complete

### Per Ambiente LIVE:
1. ✅ Conferma che TEST funziona
2. ✅ Esegui `sql/setup_live_admin.sql`
3. ✅ Testa login con `Aquladmin` / `Aquasync2025!`
4. ✅ Configura primi istruttori dall'interfaccia admin

## 🔧 Uso dell'Applicazione

### Login Processo:

1. **Seleziona Ambiente**:
   - 🧪 **TEST - Demo Environment**
   - 🚀 **LIVE - Production Environment**

2. **Inserisci Credenziali**:
   - Username specifico per ambiente
   - Password corretta per ambiente

3. **Risultato**:
   - Login successful → Accesso garantito
   - Errore specifico → Credenziali sbagliate per ambiente

### Messaggi di Errore:

- `"Username not found in TEST environment"`
- `"Username not found in LIVE environment"`
- `"Invalid username or password"`

## 📊 Monitoraggio e Manutenzione

### Controlli Periodici:

```sql
-- Verifica utenti per ambiente
SELECT
    u.username, u.role, o.slug as environment
FROM users u
JOIN organizations o ON u.organization_id = o.id
ORDER BY o.slug, u.role;

-- Conta utenti per ambiente
SELECT
    o.slug as environment,
    COUNT(*) as total_users,
    COUNT(CASE WHEN u.role = 'admin' THEN 1 END) as admins,
    COUNT(CASE WHEN u.role = 'teacher' THEN 1 END) as teachers
FROM users u
JOIN organizations o ON u.organization_id = o.id
GROUP BY o.slug;
```

### Backup e Sicurezza:

- 🔐 **Password LIVE**: Cambiare periodicamente
- 💾 **Backup**: Schedulare backup automatici
- 📊 **Monitoring**: Controllare accessi regolarmente
- 🚫 **Accesso**: Limitare credenziali LIVE

## ⚠️ Best Practices

### Sicurezza LIVE:

1. **Mai condividere** credenziali LIVE su:
   - Chat, email, repository pubblici
   - Documentazione pubblica
   - Demo o presentazioni

2. **Accesso limitato** a credenziali LIVE:
   - Solo amministratori autorizzati
   - Registro degli accessi
   - Cambio password periodico

3. **Ambiente TEST** per:
   - Demo pubbliche
   - Testing di funzionalità
   - Formazione nuovi utenti
   - Sviluppo e debug

### Sviluppo:

- 🧪 **Sempre testare** in ambiente TEST prima
- 🚀 **Deploy LIVE** solo dopo validazione completa
- 📝 **Documentare** ogni modifica
- ⏪ **Rollback plan** sempre disponibile

## 🆘 Troubleshooting

### Problema: "Organization not found"
**Soluzione**: Eseguire `sql/organizations.sql`

### Problema: Login fallisce in LIVE
**Soluzione**: Verificare che `sql/setup_live_admin.sql` sia stato eseguito

### Problema: Utenti misti tra ambienti
**Soluzione**: Verificare organization_id di ogni utente

### Problema: Credenziali LIVE dimenticate
**Soluzione**: Re-eseguire `sql/setup_live_admin.sql` (resetterà la password)

---

## 📞 Supporto

Per problemi di configurazione:
1. Verificare log database Supabase
2. Controllare variabili ambiente
3. Validare script SQL eseguiti
4. Contattare supporto tecnico

---

**🔒 Ricorda: La sicurezza dell'ambiente LIVE è fondamentale per la protezione dei dati delle scuole di nuoto!**