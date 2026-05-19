# Nomenklatura — Design Document

> Moteur de nomenclature de fichiers pour la post-production et la livraison de contenus audiovisuels.
> Génère des noms de fichiers normalisés à partir d'un formulaire dynamique piloté par un schema JSON.

**Version** : v1.0
**Auteur** : Félix Abt — Cairn Studios
**Licence** : CC BY-NC-SA 4.0
**Hébergement** : GitHub Pages (site statique)
**Stack** : React 18+ · Tailwind CSS · Vite · shadcn/ui

---

## 1. Vue d'ensemble

Nomenklatura est une application web client-side qui permet de :

1. **Générer** des noms de fichiers normalisés via un formulaire dynamique
2. **Constituer** une "Export List" (liste ordonnée d'entries)
3. **Manipuler** cette liste : ajouter, éditer, dupliquer, réordonner (drag & drop), supprimer
4. **Exporter** la liste en CSV, JSON, ou PDF
5. **Importer** une liste depuis un fichier CSV ou JSON
6. **Charger des templates** : listes pré-remplies livrées dans le repo (ex: "Livraison Netflix", "DCP Festival")
7. **Calculer** le poids estimé d'un fichier (utilitaire intégré)

L'application tourne 100% côté client. Aucun backend. Les données persistent dans `localStorage`. Le partage se fait par import/export de fichiers.

---

## 2. Architecture

### 2.1 Structure du projet

```
nomenklatura/
├── public/
│   └── templates/               # Templates d'entries (JSON)
│       ├── clean_masters.json
│       ├── netflix_delivery.json
│       └── dcp_festival.json
├── src/
│   ├── schemas/                 # Schemas de nomenclature (JSON)
│   │   └── default.json         # Schema par défaut (Clean Masters)
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── AppHeader.jsx
│   │   │   └── AppFooter.jsx
│   │   ├── Generator/
│   │   │   ├── DynamicForm.jsx       # Formulaire généré depuis le schema
│   │   │   ├── FilenamePreview.jsx   # Preview live colorée du nom
│   │   │   └── FormField.jsx         # Composant champ générique (text/select/date/number)
│   │   ├── EntryList/
│   │   │   ├── EntryList.jsx         # Liste drag & drop
│   │   │   ├── EntryRow.jsx          # Ligne individuelle (affichage coloré + actions)
│   │   │   └── EntryActions.jsx      # Boutons: éditer, dupliquer, supprimer
│   │   ├── ImportExport/
│   │   │   ├── ExportPanel.jsx       # Export CSV / JSON / PDF
│   │   │   ├── ImportPanel.jsx       # Import CSV / JSON
│   │   │   └── TemplateLoader.jsx    # Dropdown chargement de templates
│   │   └── Tools/
│   │       └── FileSizeCalculator.jsx
│   ├── engine/
│   │   ├── nomenclature.js      # Moteur: schema → filename
│   │   ├── sanitize.js          # Nettoyage des valeurs (regex, remplacement)
│   │   ├── validator.js         # Validation du schema + des entries
│   │   └── pdf.js               # Génération PDF côté client (jsPDF)
│   ├── hooks/
│   │   ├── useEntries.js        # State + CRUD entries + localStorage sync
│   │   ├── useSchema.js         # Chargement et parsing du schema
│   │   └── useLocalStorage.js   # Hook localStorage générique
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css                # Tailwind directives + custom styles
├── index.html
├── vite.config.js
├── tailwind.config.js
├── package.json
└── README.md
```

### 2.2 Flux de données

```
schema.json ──► DynamicForm ──► nomenclature engine ──► filename string
                                                    ──► typed segments [{type, value}]
                                                            │
                                                            ▼
                                                    EntryList (state)
                                                            │
                                              ┌─────────────┼──────────────┐
                                              ▼             ▼              ▼
                                          localStorage   Export CSV    Export PDF
                                                         Export JSON
```

---

## 3. Le Schema JSON

### 3.1 Structure

Le schema est un fichier JSON dans `src/schemas/`. Il est importé statiquement dans l'app. Seul un développeur le modifie (commit dans le repo).

```json
{
  "id": "clean_masters",
  "name": "Clean Masters Delivery",
  "version": "1.0",
  "separator": "_",
  "segments": [
    {
      "id": "program",
      "label": "Program Name",
      "type": "text",
      "required": true,
      "sanitize": true,
      "placeholder": "Ex: MonFilm",
      "position": 0
    },
    {
      "id": "version",
      "label": "Version",
      "type": "text",
      "required": false,
      "sanitize": true,
      "placeholder": "Ex: V2, Director_Cut",
      "position": 1
    },
    {
      "id": "date",
      "label": "Date",
      "type": "date",
      "required": true,
      "format": "YYMMDD",
      "position": 10
    },
    {
      "id": "language",
      "label": "Language",
      "type": "select",
      "required": true,
      "options": [
        {"value": "FR", "label": "Français"},
        {"value": "EN", "label": "English"},
        {"value": "ES", "label": "Español"},
        {"value": "DE", "label": "Deutsch"},
        {"value": "IT", "label": "Italiano"},
        {"value": "PT", "label": "Português"},
        {"value": "JA", "label": "日本語"},
        {"value": "KO", "label": "한국어"},
        {"value": "ZH", "label": "中文"},
        {"value": "AR", "label": "العربية"},
        {"value": "HI", "label": "हिन्दी"},
        {"value": "RU", "label": "Русский"}
      ],
      "position": 2
    },
    {
      "id": "subtitles",
      "label": "Subtitles",
      "type": "select",
      "required": true,
      "options": [
        {"value": "NOSUB", "label": "No Subtitles"},
        {"value": "FR", "label": "Français"},
        {"value": "EN", "label": "English"},
        {"value": "ES", "label": "Español"}
      ],
      "prefix": "ST",
      "noValueToken": "NOSUB",
      "composite": {
        "mergeWith": "language",
        "separator": "-",
        "format": "{language}-{subtitles}"
      },
      "position": 3
    },
    {
      "id": "fileformat",
      "label": "File Format",
      "type": "select",
      "required": true,
      "options": [
        {"value": "MOV", "label": "MOV"},
        {"value": "MXF", "label": "MXF"},
        {"value": "MP4", "label": "MP4"},
        {"value": "AVI", "label": "AVI"},
        {"value": "ProRes", "label": "ProRes"},
        {"value": "DNxHD", "label": "DNxHD"}
      ],
      "position": 4
    },
    {
      "id": "videoformat",
      "label": "Video Format",
      "type": "select",
      "required": true,
      "options": [
        {"value": "SD", "label": "SD"},
        {"value": "HD", "label": "HD"},
        {"value": "4K", "label": "4K"}
      ],
      "position": 5
    },
    {
      "id": "videoaspect",
      "label": "Video Aspect Ratio",
      "type": "text",
      "required": false,
      "placeholder": "Ex: 1.85, 2.39",
      "sanitize": true,
      "sanitizeRule": "strip_dots_commas",
      "position": 6
    },
    {
      "id": "videores",
      "label": "Video Resolution",
      "type": "text",
      "required": false,
      "placeholder": "Ex: 1920x1080",
      "sanitize": true,
      "position": 7
    },
    {
      "id": "cadence",
      "label": "Cadence (fps)",
      "type": "select",
      "required": false,
      "options": [
        {"value": "", "label": "—"},
        {"value": "23.976", "label": "23.976"},
        {"value": "24", "label": "24"},
        {"value": "25", "label": "25"},
        {"value": "29.97", "label": "29.97"},
        {"value": "30", "label": "30"},
        {"value": "50", "label": "50"},
        {"value": "59.94", "label": "59.94"}
      ],
      "position": 8
    },
    {
      "id": "audioformat",
      "label": "Audio Format",
      "type": "select",
      "required": true,
      "options": [
        {"value": "20", "label": "Stereo (2.0)"},
        {"value": "51", "label": "Surround (5.1)"},
        {"value": "71", "label": "7.1 Surround"},
        {"value": "10", "label": "Mono (1.0)"},
        {"value": "NOAUDIO", "label": "No Audio Track"}
      ],
      "position": 9
    },
    {
      "id": "audiocodec",
      "label": "Audio Codec",
      "type": "text",
      "required": false,
      "sanitize": true,
      "placeholder": "Ex: PCM, AAC",
      "position": 10
    }
  ],
  "metadata": [
    {
      "id": "description",
      "label": "Description",
      "type": "text",
      "maxLength": 50,
      "placeholder": "Description (max 50 chars)",
      "includeInFilename": false
    }
  ]
}
```

### 3.2 Types de segments supportés

| Type     | Rendu formulaire       | Valeur dans le filename          |
|----------|------------------------|----------------------------------|
| `text`   | `<input type="text">`  | Valeur sanitizée                 |
| `select` | `<select>` / dropdown  | `value` de l'option sélectionnée |
| `date`   | Date picker            | Formaté selon `format` (YYMMDD) |
| `number` | `<input type="number">`| Valeur brute                     |

### 3.3 Propriétés des segments

| Propriété      | Description                                                        |
|----------------|--------------------------------------------------------------------|
| `id`           | Identifiant unique du segment (clé dans les données)               |
| `label`        | Label affiché dans le formulaire                                   |
| `type`         | `text` / `select` / `date` / `number`                             |
| `required`     | Champ obligatoire (booléen)                                        |
| `options`      | Pour type `select` : liste `[{value, label}]`                     |
| `position`     | Ordre dans le nom de fichier (tri croissant)                       |
| `sanitize`     | Appliquer le nettoyage (suppression caractères spéciaux)           |
| `sanitizeRule` | Règle de sanitize spéciale (`strip_dots_commas`, etc.)             |
| `prefix`       | Préfixe ajouté devant la valeur (ex: `ST` → `STFR`)               |
| `noValueToken` | Valeur spéciale qui n'a PAS le prefix (ex: `NOSUB` pas `STNOSUB`) |
| `placeholder`  | Placeholder du champ                                               |
| `composite`    | Règle de fusion avec un autre segment (voir Section 3.4)           |

### 3.4 Segments composites

Certains segments fusionnent dans le nom final. Exemple : `language` + `subtitles` → `FR-STFR`.

```json
"composite": {
  "mergeWith": "language",
  "separator": "-",
  "format": "{language}-{subtitles}"
}
```

Quand un segment a un `composite`, il ne produit PAS un segment autonome dans le filename. Il est fusionné avec le segment cible selon le `format`. Le segment résultant prend la `position` du segment `mergeWith`.

### 3.5 Section `metadata`

Les champs `metadata` apparaissent dans le formulaire mais ne font PAS partie du filename. Ils sont inclus dans les exports (CSV, JSON, PDF) comme données annexes. Exemple : `description`.

---

## 4. Le moteur de nomenclature (`engine/nomenclature.js`)

### 4.1 Pipeline de génération

```
formValues (object) + schema → buildFilename() → string
                             → buildTypedSegments() → [{type: string, value: string}]
```

**Étapes** :

1. Récupérer les segments du schema, triés par `position`
2. Pour chaque segment, résoudre la valeur depuis `formValues`
3. Appliquer `sanitize` si configuré
4. Appliquer `prefix` (sauf si la valeur est le `noValueToken`)
5. Résoudre les `composite` (fusionner les segments liés)
6. Filtrer les segments vides (optionnels non remplis)
7. Joindre avec le `separator` du schema

### 4.2 Sanitize (`engine/sanitize.js`)

```javascript
// Règle par défaut : supprime tout sauf alphanum et espaces, remplace espaces par _
function sanitizeDefault(text) {
  return text.replace(/[^A-Za-z0-9\s]/g, '').trim().replace(/\s+/g, '_').replace(/_+/g, '_');
}

// Règle spéciale : strip_dots_commas (pour aspect ratio: "1.85" → "185")
function stripDotsCommas(text) {
  return text.replace(/[.,]/g, '');
}
```

### 4.3 Fonctions exposées

```javascript
// Retourne le filename complet (string)
buildFilename(schema, formValues) → string

// Retourne les segments typés pour l'affichage coloré
buildTypedSegments(schema, formValues) → [{type: string, value: string}]

// Valide les champs requis
validateForm(schema, formValues) → {valid: boolean, errors: string[]}
```

---

## 5. Gestion des entries (`hooks/useEntries.js`)

### 5.1 Structure d'une entry

```javascript
{
  id: "01",                          // Auto-incrémenté, renuméroté à chaque changement
  filename: "MonFilm_V2_FR-STFR_MOV_HD_185_1920x1080_25_51_PCM_250519",
  segments: [                        // Pour affichage coloré
    {type: "PROGRAM", value: "MonFilm"},
    {type: "VERSION", value: "V2"},
    {type: "LANG_SUB", value: "FR-STFR"},
    // ...
  ],
  formValues: {                      // Valeurs brutes du formulaire (pour édition)
    program: "MonFilm",
    version: "V2",
    date: "2025-05-19",
    language: "FR",
    subtitles: "FR",
    // ...
  },
  metadata: {
    description: "Version finale client"
  }
}
```

**Point important** : on stocke `formValues` dans chaque entry. C'est ce qui permet l'**édition** : quand l'utilisateur clique "Éditer", les `formValues` sont rechargées dans le formulaire.

### 5.2 Opérations CRUD

| Action       | Comportement                                                                   |
|--------------|--------------------------------------------------------------------------------|
| **Add**      | Génère filename + segments depuis le formulaire, push en fin de liste          |
| **Edit**     | Charge les `formValues` de l'entry dans le formulaire, le bouton "Add" devient "Update", la mise à jour remplace l'entry à son index |
| **Duplicate**| Clone l'entry (nouvel ID), insérée juste après l'originale                     |
| **Delete**   | Supprime l'entry, confirmation modale                                          |
| **Reorder**  | Drag & drop (bibliothèque: `@dnd-kit/core`)                                   |

Après chaque opération, les IDs sont renumérotés séquentiellement (01, 02, 03…).

### 5.3 Persistance localStorage

```javascript
// Clé localStorage
const STORAGE_KEY = 'nomenklatura_entries';
const SCHEMA_KEY = 'nomenklatura_active_schema';

// Sync automatique à chaque mutation
useEffect(() => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}, [entries]);

// Restauration au montage
const [entries, setEntries] = useState(() => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
});
```

---

## 6. Templates d'entries

### 6.1 Format

Les templates sont des fichiers JSON dans `public/templates/`. Chaque template est un manifest :

```json
{
  "name": "Netflix Delivery Package",
  "description": "Standard Netflix delivery — 12 files, multi-language, ProRes + H264",
  "schemaId": "clean_masters",
  "entries": [
    {
      "formValues": {
        "program": "",
        "version": "FINAL",
        "language": "FR",
        "subtitles": "NOSUB",
        "fileformat": "ProRes",
        "videoformat": "4K",
        "videoaspect": "1.85",
        "videores": "3996x2160",
        "cadence": "24",
        "audioformat": "51",
        "audiocodec": "PCM"
      },
      "metadata": { "description": "Master ProRes FR" }
    },
    {
      "formValues": {
        "program": "",
        "version": "FINAL",
        "language": "EN",
        "subtitles": "EN",
        "fileformat": "MP4",
        "videoformat": "HD",
        "cadence": "24",
        "audioformat": "20",
        "audiocodec": "AAC"
      },
      "metadata": { "description": "Screener EN" }
    }
  ]
}
```

**Note** : le champ `program` est laissé vide dans le template — il est rempli par l'utilisateur au chargement (prompt ou champ dédié).

### 6.2 Workflow de chargement

1. L'utilisateur ouvre le panel "Templates"
2. Dropdown listant les templates disponibles (chargés depuis `public/templates/index.json`)
3. Sélection → preview du contenu (nombre d'entries, description)
4. Bouton "Charger" → prompt demandant le `program` name (si vide dans le template)
5. Les entries sont générées (filename calculé par le moteur) et **remplacent** ou **s'ajoutent** à la liste courante (choix proposé à l'utilisateur)

---

## 7. Import / Export

### 7.1 Export CSV

Colonnes = tous les `id` des segments du schema + les `id` des metadata + `filename`.

```csv
id,program,version,date,language,subtitles,fileformat,videoformat,videoaspect,videores,cadence,audioformat,audiocodec,description,filename
01,MonFilm,V2,250519,FR,FR,MOV,HD,185,1920x1080,25,51,PCM,Master FR,MonFilm_V2_FR-STFR_MOV_HD_185_1920x1080_25_51_PCM_250519
```

### 7.2 Export JSON

```json
{
  "schema": "clean_masters",
  "exportedAt": "2025-05-19T14:30:00Z",
  "program": "MonFilm",
  "entries": [ /* array d'entries complètes */ ]
}
```

### 7.3 Export PDF

Bibliothèque : **jsPDF** (côté client, zero backend).

Layout :
- Header : logo (optionnel, dans `public/`) + titre "EXPORT LIST — {program} — {date}"
- Corps : chaque entry est une carte (coin arrondi, ombre légère) avec :
  - ID (badge numéroté)
  - Filename (police monospace, bold)
  - Description (italique, gris)
- Footer : "Generated by Nomenklatura — {date}"
- Pagination automatique

### 7.4 Import CSV / JSON

- Drag & drop zone ou file picker
- Validation : vérification que les colonnes/clés correspondent au schema actif
- Preview avant chargement (tableau des N premières lignes)
- Choix : remplacer la liste ou ajouter à la liste existante

---

## 8. UI / UX

### 8.1 Layout principal

```
┌─────────────────────────────────────────────────────────┐
│  NOMENKLATURA                    [Template ▾] [Import]  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─── FORMULAIRE (généré depuis le schema) ──────────┐  │
│  │ Program Name *  │ Version       │ Date *           │  │
│  │ Language *      │ Subtitles *   │ File Format *    │  │
│  │ Video Format *  │ Aspect Ratio  │ Resolution       │  │
│  │ Cadence         │ Audio Format *│ Audio Codec      │  │
│  │ Description                                        │  │
│  │                                                    │  │
│  │  ┌─── PREVIEW LIVE ──────────────────────────┐     │  │
│  │  │ MonFilm_V2_FR-STFR_MOV_HD_25_51_PCM_250519│    │  │
│  │  └────────────────────────────────────────────┘     │  │
│  │                                                    │  │
│  │           [ ＋ Add to list ]  ou  [ ✏ Update ]     │  │
│  └────────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─── EXPORT LIST ───────────────────────────────────┐  │
│  │ ≡ 01  MonFilm_V2_FR-STFR_MOV...  Master FR  ✎ ⊕ ✕│  │
│  │ ≡ 02  MonFilm_V2_EN-STEN_MOV...  Screener   ✎ ⊕ ✕│  │
│  │ ≡ 03  MonFilm_V2_ES-NOSUB_MP4... DCP ES     ✎ ⊕ ✕│  │
│  └────────────────────────────────────────────────────┘  │
│                                                         │
│  [ Export CSV ]  [ Export JSON ]  [ Export PDF ]         │
│                                                         │
│  ┌─── FILE SIZE CALCULATOR (collapsible) ────────────┐  │
│  │ H: __ M: __ S: __ | Bitrate: __ Mbps | = __ GB   │  │
│  └────────────────────────────────────────────────────┘  │
│                                                         │
│  ── Nomenklatura v1.0 — Félix Abt — CC BY-NC-SA 4.0 ── │
└─────────────────────────────────────────────────────────┘
```

### 8.2 Preview live du filename

Le filename est affiché en temps réel au-dessus du bouton "Add". Chaque segment est coloré par type (même système que la version Streamlit) :

| Type          | Couleur     |
|---------------|-------------|
| PROGRAM       | Bleu        |
| VERSION       | Violet      |
| LANG_SUB      | Vert        |
| FILE_FORMAT   | Orange      |
| VIDEO_FORMAT  | Teal        |
| VIDEO_ASPECT  | Rose        |
| RESOLUTION    | Indigo      |
| CADENCE       | Brun        |
| AUDIO_FORMAT  | Rouge       |
| AUDIO_CODEC   | Gris foncé  |
| DATE          | Bleu clair  |

Les couleurs sont définies dans le schema (propriété optionnelle `color` par segment) ou en fallback dans un mapping par défaut.

### 8.3 Entry Row

Chaque ligne de la liste affiche :
- **Drag handle** (≡) pour réordonner
- **ID** (badge numéroté)
- **Filename** coloré par segments (monospace)
- **Description** (texte gris, éditable inline)
- **Actions** : Copier (📋), Éditer (✏), Dupliquer (⊕), Supprimer (✕)

Le bouton "Copier" copie le filename dans le presse-papier avec feedback visuel (✓).

### 8.4 Direction artistique

**Identité visuelle : "Studio Control Room"**

L'app évoque la rigueur d'une console de monitoring broadcast ou d'un DIT cart — un outil de précision technique, pas un SaaS marketing. L'atmosphère est celle d'une salle de post-prod : sombre, concentrée, avec des informations codées par couleur qui ressortent nettement.

Le design doit être **state of the art** : à la hauteur de ce que produisent les meilleures apps desktop pro actuelles (Linear, Raycast, Arc Browser, Warp terminal). Sobre, efficace, visuellement attractif, sans décoration superflue. Chaque pixel sert un objectif.

### 8.5 Palette de couleurs

**Mode sombre par défaut** (pas de light mode en v1 — l'app est faite pour des environnements de post-prod où les écrans sont calibrés et les lumières tamisées).

```css
:root {
  /* Surface hierarchy (du plus profond au plus en avant) */
  --bg-base:        #0C0C0E;     /* Fond global — quasi noir bleuté */
  --bg-surface:     #141418;     /* Panneaux principaux (formulaire, liste) */
  --bg-elevated:    #1C1C22;     /* Cartes, entry rows, modales */
  --bg-hover:       #24242C;     /* Hover sur les éléments interactifs */

  /* Bordures */
  --border-subtle:  #2A2A34;     /* Séparateurs, contours de cartes */
  --border-focus:   #4A4A5A;     /* Focus ring sur les inputs */

  /* Texte */
  --text-primary:   #E8E8EC;     /* Texte principal — blanc cassé chaud */
  --text-secondary: #8888A0;     /* Labels, placeholders, descriptions */
  --text-muted:     #555568;     /* Texte désactivé, hints */

  /* Accent principal — un bleu technique froid */
  --accent:         #3B82F6;     /* Boutons primaires, liens, focus */
  --accent-hover:   #2563EB;
  --accent-subtle:  rgba(59,130,246,0.12);  /* Fond léger pour highlight */

  /* Feedback */
  --success:        #22C55E;
  --error:          #EF4444;
  --warning:        #F59E0B;

  /* Segment colors (pour le filename preview — vifs sur fond sombre) */
  --seg-program:    #60A5FA;     /* Bleu clair */
  --seg-version:    #A78BFA;     /* Violet */
  --seg-langsub:    #34D399;     /* Vert émeraude */
  --seg-fileformat: #FB923C;     /* Orange */
  --seg-videoformat:#22D3EE;     /* Cyan */
  --seg-aspect:     #F472B6;     /* Rose */
  --seg-resolution: #818CF8;     /* Indigo */
  --seg-cadence:    #D4A574;     /* Cuivre/brun chaud */
  --seg-audioformat:#F87171;     /* Rouge clair */
  --seg-audiocodec: #94A3B8;     /* Gris bleuté */
  --seg-date:       #7DD3FC;     /* Bleu ciel */
}
```

### 8.6 Typographie

Deux familles chargées via Google Fonts, rien d'autre :

| Usage                        | Font                | Poids              |
|------------------------------|---------------------|--------------------|
| **UI** (labels, boutons, texte courant) | **Geist Sans** (ou fallback: Manrope) | 400 (regular), 500 (medium), 600 (semibold) |
| **Code** (filenames, preview, monospace) | **JetBrains Mono** | 400, 500, 700 (bold) |

Règles :
- Labels de champs : 13px, `--text-secondary`, font-weight 500, uppercase, letter-spacing 0.04em
- Valeurs de champs / inputs : 14px, `--text-primary`, font-weight 400
- Filename preview : 15px, JetBrains Mono, font-weight 500
- Filename dans les entry rows : 13px, JetBrains Mono, font-weight 500
- Titres de section (FORMULAIRE, EXPORT LIST) : 11px, uppercase, letter-spacing 0.08em, `--text-muted`, font-weight 600
- Description dans les entries : 13px, italic, `--text-secondary`

**Anti-pattern à éviter** : jamais de texte plus gros que 18px sauf le logo/titre de l'app. L'outil est dense et informationnel, pas éditorial.

### 8.7 Composants UI — Spécifications détaillées

#### Inputs (text, select, date)

```
┌─ LABEL (uppercase, muted, 11px, letter-spacing) ────────────┐
│                                                               │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  Placeholder text...                                  │    │
│  └──────────────────────────────────────────────────────┘    │
└───────────────────────────────────────────────────────────────┘
```

- Fond : `--bg-elevated`
- Bordure : 1px `--border-subtle`, border-radius 8px
- Padding : 10px 12px
- Au focus : bordure `--border-focus` + box-shadow `0 0 0 3px var(--accent-subtle)`
- Transition : `border-color 150ms ease, box-shadow 150ms ease`
- Les champs requis ont un petit dot `--accent` (3px, rond) à côté du label, PAS une étoile `*`
- Les selects ont une flèche chevron custom (icône Lucide `ChevronDown`, 16px, `--text-muted`)

#### Boutons

**Primaire** (Add to list, Export) :
- Fond : `--accent`, texte blanc, border-radius 8px
- Padding : 10px 20px, font-weight 600
- Hover : `--accent-hover` + léger scale(1.01)
- Active : scale(0.98), transition 80ms
- Disabled : opacity 0.4, cursor not-allowed

**Secondaire** (Import, Templates, Cancel) :
- Fond : transparent, bordure 1px `--border-subtle`, texte `--text-primary`
- Hover : fond `--bg-hover`

**Ghost** (actions inline — Copier, Éditer, Dupliquer, Supprimer) :
- Fond : transparent, pas de bordure
- Icône seule (Lucide, 16px), couleur `--text-muted`
- Hover : couleur `--text-primary`, fond `--bg-hover`, border-radius 6px
- Le bouton Supprimer hover en `--error`

**Bouton "Add to list"** : pleine largeur du formulaire, hauteur 44px, centré. Quand on est en mode édition, il devient "Update entry" avec une couleur `--warning` (ambre) au lieu de `--accent`.

#### Filename Preview (dans le formulaire)

La preview est un bandeau horizontal au-dessus du bouton "Add" :

- Fond : `--bg-base` (plus sombre que le formulaire pour créer un contraste "écran dans l'écran")
- Bordure : 1px `--border-subtle`, border-radius 10px
- Padding : 14px 18px
- Font : JetBrains Mono 15px, font-weight 500
- Chaque segment est coloré par sa variable CSS (`--seg-program`, `--seg-version`…)
- Les séparateurs (`_`) sont en `--text-muted`
- Si le formulaire est vide ou incomplet, afficher un placeholder en `--text-muted` : `program_version_lang_format_…`
- Animation : quand un segment change, il fait un très léger flash (opacity pulse 200ms) pour attirer l'œil

#### Entry Row (dans la liste)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ≡   01   MonFilm_V2_FR-STFR_MOV_HD_185_1920x1080_25_51_PCM_250519   │
│            Master ProRes FR                           📋  ✏  ⊕  ✕    │
└─────────────────────────────────────────────────────────────────────────┘
```

- Fond : `--bg-elevated`
- Bordure : 1px `--border-subtle`, border-radius 10px
- Padding : 12px 16px
- Marge entre les rows : 6px (gap)
- **Drag handle** : icône `GripVertical` (Lucide), `--text-muted`, cursor grab. Au drag : la row se soulève (box-shadow `0 8px 24px rgba(0,0,0,0.4)`, scale 1.02, opacity 0.95, z-index élevé). La zone de drop est marquée par un trait `--accent` de 2px.
- **ID badge** : fond `--accent-subtle`, texte `--accent`, border-radius 6px, padding 2px 8px, font-weight 600, JetBrains Mono 12px
- **Filename** : JetBrains Mono, segments colorés, tronqué avec `text-overflow: ellipsis` si trop long. Tooltip au hover montrant le filename complet.
- **Description** : sous le filename, 12px italic `--text-secondary`. Éditable inline au double-click (inline input qui se fond dans le style de la ligne).
- **Actions** : alignées à droite, apparaissent au hover de la row (opacity 0 → 1, transition 150ms). Toujours visibles sur mobile (pas de hover).
- Hover de la row : fond `--bg-hover`

#### Feedback "Copié"

Au clic sur le bouton Copier :
1. L'icône passe de `Copy` à `Check` (Lucide) avec un morph instantané
2. La couleur passe à `--success` pendant 1.2s
3. Un micro-toast apparaît à côté du bouton : "Copied!" en `--success`, 11px, opacity fade-out après 1s
4. Pas de notification système, pas de toast global — le feedback est local et discret

### 8.8 Animations et transitions

**Philosophie** : les animations servent le feedback et la lisibilité, jamais la décoration. Tout est rapide (100-300ms), easing `cubic-bezier(0.16, 1, 0.3, 1)` (out-expo, fluide et réactif).

| Interaction                    | Animation                                              | Durée  |
|--------------------------------|--------------------------------------------------------|--------|
| Ajout d'une entry              | La nouvelle row slide-in depuis le bas + fade-in       | 250ms  |
| Suppression d'une entry        | La row se compresse en hauteur (height → 0) + fade-out | 200ms  |
| Réordonnement (drag)           | Row soulevée (shadow + scale), drop avec spring settle | 300ms  |
| Duplication                    | Clone apparaît sous l'originale avec un flash `--accent-subtle` | 250ms  |
| Mode édition activé            | Le formulaire scroll-to-view si nécessaire, bordure passe en `--warning` | 200ms  |
| Hover entry row                | Fond → `--bg-hover`, actions fade-in                   | 150ms  |
| Focus input                    | Border color + box-shadow                              | 150ms  |
| Segment change dans preview    | Opacity pulse (1 → 0.5 → 1) sur le segment modifié    | 200ms  |
| Bouton click                   | Scale 0.98 → 1                                         | 80ms   |
| Panneau collapsible (expand)   | Height auto avec transition + rotation chevron 180°    | 250ms  |
| Import file drag-over          | Zone de drop passe en `--accent-subtle` + bordure dashed `--accent` | 150ms  |

Bibliothèque recommandée : **Framer Motion** pour les layout animations (AnimatePresence pour les ajouts/suppressions, layoutId pour le drag). Les transitions simples (hover, focus) restent en CSS pur via Tailwind `transition-*`.

### 8.9 Responsive Design

Trois breakpoints :

| Breakpoint        | Largeur        | Comportement                                          |
|-------------------|----------------|-------------------------------------------------------|
| **Desktop**       | ≥ 1024px       | Formulaire en grille 3 colonnes, liste pleine largeur |
| **Tablet**        | 640px – 1023px | Formulaire en grille 2 colonnes, entry rows empilent filename/description |
| **Mobile**        | < 640px        | Formulaire 1 colonne, entry rows compactes (filename tronqué, actions en swipe ou menu ⋯) |

**Desktop** (vue principale) :
- Container max-width : 960px, centré, padding 24px latéral
- Formulaire : grille CSS `grid-template-columns: 1fr 1fr 1fr`, gap 12px
- Liste : chaque row est un flex row horizontal

**Tablet** :
- Container : pleine largeur, padding 16px
- Formulaire : `grid-template-columns: 1fr 1fr`
- Preview : pleine largeur sous le formulaire
- Entry rows : filename sur une ligne, description en dessous, actions à droite

**Mobile** :
- Container : padding 12px
- Formulaire : 1 colonne
- Entry rows : layout vertical — ID + filename (tronqué), description dessous, actions accessibles via un menu "⋯" (three dots) qui ouvre un popover (Copier / Éditer / Dupliquer / Supprimer)
- Le drag & drop est remplacé par des boutons "↑ ↓" pour réordonner
- Les boutons d'export passent en stack vertical

### 8.10 Micro-interactions remarquables

Ces détails font la différence entre "ça marche" et "c'est pro" :

**1. Preview-as-you-type** : le filename se construit en temps réel dans la preview pendant que l'utilisateur tape. Chaque nouveau segment qui apparaît fait un micro fade-in. Les segments manquants (champs pas encore remplis) apparaissent en `--text-muted` comme placeholder positionnel, montrant à l'utilisateur la structure complète attendue.

**2. Validation inline douce** : les champs requis ne montrent PAS d'erreur tant que l'utilisateur n'a pas tenté un "Add". Après un "Add" échoué, seuls les champs manquants s'illuminent en `--error` (border + label). L'erreur disparaît dès que le champ est rempli. Pas de messages d'erreur textuels intrusifs.

**3. Empty state de la liste** : quand la liste est vide, afficher une zone en pointillés (`--border-subtle`, dashed) avec un message centré : "No entries yet — fill the form above to start building your export list" en `--text-muted`, avec une icône `FileText` (Lucide) en 32px au-dessus. Pas de tristesse, pas de mascotte — juste une indication claire.

**4. Counter badge** : à côté du titre "EXPORT LIST", un badge rond montre le nombre d'entries (ex: `3`), fond `--accent-subtle`, texte `--accent`.

**5. Scroll behavior** : si la liste est longue (>8 entries), elle scroll indépendamment dans sa zone (overflow-y auto, max-height ~50vh sur desktop). Le formulaire reste toujours visible en haut.

**6. Keyboard shortcuts** (power users, affichés dans un tooltip sur le bouton Add) :
- `Ctrl+Enter` : Add entry (ou Update si en mode édition)
- `Escape` : annuler le mode édition
- `Ctrl+Shift+E` : export CSV
- `Ctrl+Shift+P` : export PDF

### 8.11 Header

```
┌──────────────────────────────────────────────────────────┐
│  ◆ NOMENKLATURA              [Templates ▾]  [Import ↑]  │
│  Filename nomenclature engine                            │
└──────────────────────────────────────────────────────────┘
```

- Le logo `◆` est un losange géométrique simple (SVG inline), couleur `--accent`
- "NOMENKLATURA" : Geist Sans, 18px, font-weight 700, letter-spacing 0.06em, uppercase
- Sous-titre : 12px, `--text-muted`, font-weight 400
- Les boutons Templates et Import sont alignés à droite, style secondaire
- Hauteur totale : 64px, `--bg-surface`, border-bottom 1px `--border-subtle`
- Sticky en haut (position: sticky, top: 0, z-index 50)

### 8.12 Footer

- Hauteur : 48px, `--bg-base`, border-top 1px `--border-subtle`
- Texte centré : "Nomenklatura v1.0 — Félix Abt — Cairn Studios", 12px, `--text-muted`
- Liens vers le repo GitHub et la licence CC BY-NC-SA 4.0, style `--text-secondary` avec underline dashed au hover
- Non sticky, suit le flux naturel de la page

### 8.13 États visuels spéciaux

**Mode édition active** :
- Quand l'utilisateur clique "Éditer" sur une entry, le formulaire est pré-rempli et une bannière apparaît en haut du formulaire : fond `--warning` à 10% d'opacité, bordure gauche 3px solid `--warning`, texte "Editing entry #03 — MonFilm_V2_FR-STFR_…" tronqué, avec un bouton "Cancel" qui annule et restaure le formulaire vierge
- L'entry en cours d'édition dans la liste a une bordure `--warning` pulsante (animation 2s ease-in-out infinite alternate, border-opacity 0.4 → 1)
- Le bouton "Add" devient "Update entry" avec fond `--warning`

**Drag en cours** :
- La row draggée est semi-transparente (opacity 0.9) avec une ombre portée forte
- Les autres rows se tassent pour laisser de la place (layout animation Framer Motion)
- Un indicateur de position (trait horizontal 2px `--accent`) apparaît entre les rows pour montrer où l'élément sera déposé

**Import drag-over** :
- Quand un fichier est survolé au-dessus de la zone d'import, toute la zone passe en bordure dashed 2px `--accent`, fond `--accent-subtle`, avec un texte "Drop CSV or JSON file" centré

---

## 9. File Size Calculator

Utilitaire intégré (panneau collapsible en bas de page).

**Inputs** : Heures, Minutes, Secondes, Bitrate (Mbps)
**Output** : Taille estimée en MB et GB (formule H.264 High Profile avec +1% overhead conteneur)

```javascript
function estimateFileSize(hours, minutes, seconds, bitrateMbps) {
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;
  const sizeMB = (bitrateMbps * totalSeconds) / 8;
  const sizeGB = sizeMB / 1024;
  return { mb: sizeMB * 1.01, gb: sizeGB * 1.01 };
}
```

---

## 10. Dépendances npm

| Package              | Usage                                 |
|----------------------|---------------------------------------|
| `react`              | Framework UI                          |
| `react-dom`          | Rendu DOM                             |
| `tailwindcss`        | CSS utility-first                     |
| `@dnd-kit/core`      | Drag & drop pour réordonner           |
| `@dnd-kit/sortable`  | Extension sortable pour dnd-kit       |
| `jspdf`              | Génération PDF côté client            |
| `papaparse`          | Parsing CSV robuste                   |
| `lucide-react`       | Icônes (copy, edit, trash, grip…)     |
| `vite`               | Bundler / dev server                  |

| `framer-motion`        | Animations layout (AnimatePresence, layoutId) |

Optionnel :
| `@radix-ui/react-*`  | Composants accessibles (select, dialog, tooltip) |

---

## 11. Déploiement GitHub Pages

### 11.1 Configuration Vite

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/nomenklatura/',  // nom du repo GitHub
  build: {
    outDir: 'dist',
  },
});
```

### 11.2 GitHub Action (CI/CD)

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
      - uses: actions/deploy-pages@v4
```

---

## 12. Résumé des commandes Claude Code

Pour que Claude Code implémente ce projet, voici l'ordre suggéré :

1. **Scaffold** : `npm create vite@latest nomenklatura -- --template react` + Tailwind setup
2. **Schema** : créer `src/schemas/default.json` avec le schema complet Clean Masters
3. **Engine** : implémenter `nomenclature.js`, `sanitize.js`, `validator.js`
4. **DynamicForm** : composant qui lit le schema et rend le formulaire
5. **FilenamePreview** : preview live colorée
6. **EntryList** : liste avec drag & drop, CRUD complet
7. **Import/Export** : CSV (PapaParse), JSON, PDF (jsPDF)
8. **Templates** : loader + templates d'exemple
9. **FileSizeCalculator** : panneau utilitaire
10. **Polish** : dark mode, animations, responsive, footer
11. **Deploy** : GitHub Action + Pages config
