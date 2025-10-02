# Lezioni Ricorrenti - Guida all'uso

## Configurazione Database

Prima di utilizzare le lezioni ricorrenti, esegui lo script SQL nel database Supabase:

```sql
-- Vai su Supabase → SQL Editor
-- Esegui il contenuto del file: sql/add_recurrence_field.sql
```

## Come creare una lezione ricorrente

1. **Accedi come Admin**
2. **Seleziona una data** dal calendario (questa sarà la data di inizio)
3. Clicca **"Aggiungi Lezione"**
4. Compila i dettagli della lezione:
   - Orario
   - Tipo (Piscina/Aula)
   - Descrizione
5. **Spunta "Lezione ricorrente"** ✅
6. Configura la ricorrenza:
   - **Nome Corso/Tag**: Nome identificativo (es: "Corso Base Lunedì") - opzionale ma consigliato!
   - **Frequenza**: Giornaliera, Settimanale, Mensile, Annuale
   - **Ogni X**: Intervallo (es: ogni 2 settimane)
   - **Termina il**: Data fine (opzionale, max 52 occorrenze)
7. Clicca **"Salva"**

## Esempi pratici

### Corso settimanale del lunedì
- Data inizio: Lunedì 7 ottobre 2025
- Frequenza: Settimanale
- Ogni: 1 settimana
- Termina il: 31 dicembre 2025
- Risultato: 12 lezioni ogni lunedì

### Allenamento bisettimanale
- Data inizio: 7 ottobre 2025
- Frequenza: Settimanale
- Ogni: 2 settimane
- Termina il: 31 marzo 2026
- Risultato: ~13 lezioni alternate

### Corso mensile
- Data inizio: 1 novembre 2025
- Frequenza: Mensile
- Ogni: 1 mese
- Termina il: (vuoto - crea 52 occorrenze)
- Risultato: Una lezione il primo di ogni mese per 52 mesi

## Gestione lezioni ricorrenti

### Visualizzare le lezioni
- Nella lista "Lezioni Programmate" vedrai un badge **🔄 con il nome del corso** per le lezioni ricorrenti
- Se non hai specificato un nome, vedrai semplicemente **🔄 Ricorrente**
- Usa il **filtro mese** per visualizzare solo le lezioni di un mese specifico

### Identificare una serie
Ogni serie ricorrente ha:
- **Badge colorato viola** con il nome del corso (es: 🔄 Corso Base Lunedì)
- Stesso orario e tipo per tutte le lezioni
- Icona Repeat (🔄) distintiva

### Eliminare una singola lezione
- Clicca **"Elimina"** sulla lezione specifica
- Elimina solo quella lezione, le altre della serie rimangono

### Eliminare tutta la serie
- Clicca **"🔄 Elimina serie"** (solo per admin)
- Conferma l'eliminazione
- Tutte le lezioni della serie verranno eliminate

## Note importanti

⚠️ **Limiti**:
- Massimo 52 occorrenze per serie ricorrente
- Le lezioni ricorrenti sono create tutte subito (non dinamicamente)
- Ogni lezione è indipendente per le disponibilità degli istruttori

💡 **Suggerimenti**:
- Usa il filtro mese per navigare facilmente tra le lezioni
- Le lezioni ricorrenti hanno tutte lo stesso orario, tipo e descrizione
- Gli istruttori devono dare disponibilità per ogni singola lezione

## Struttura tecnica

### Campo recurrence_id
Tutte le lezioni della stessa serie hanno lo stesso `recurrence_id`:
```
rec_1696258800000_k3x7d9a2
    ^^^^^^^^^^^       ^^^^^^^^
    timestamp         random
```

### Campo recurrence_label
Nome/tag opzionale per identificare la serie (es: "Corso Base Lunedì"):
- Salvato in tutte le lezioni della serie
- Visibile nel badge viola
- Usato nei messaggi di conferma eliminazione
- Se vuoto, mostra "Ricorrente" come fallback

Questo permette di:
- Identificare quali lezioni appartengono alla stessa serie
- Dare un nome significativo alle serie ricorrenti
- Eliminarle tutte insieme quando necessario
- Eventualmente modificarle in batch in futuro

### Esempi di label
- "Corso Base Lunedì"
- "Allenamento Avanzato"
- "Teoria Mercoledì"
- "Open Water Venerdì"
- "Corso Bambini"
