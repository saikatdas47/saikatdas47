# Portfolio Admin — local setup and use

This folder contains the complete local Node.js backend and form-based admin interface. The website data is deliberately stored outside this folder in `../data/`, so the static website can read and publish it through GitHub Pages.

## Start the admin

1. Open the `admin` folder in VS Code.
2. Open **Terminal → New Terminal**.
3. Run:

```bash
npm start
```

4. Open this address in a browser:

```text
http://localhost:4173
```

No `npm install`, database, Express, or environment file is required. Node.js 18 or newer is enough. Stop the server with `Ctrl+C`.

## AI-generated recent news

Copy `.env.example` to `.env`, then place a newly generated Groq API key in `.env`:

```text
GROQ_API_KEY=your_new_key_here
GROQ_MODEL=openai/gpt-oss-120b
```

Never commit `.env`; it is ignored by Git. When the admin creates or updates portfolio content, the backend asks Groq for a short third-person news item and stores it in `../data/news.json`. The static portfolio displays the newest ten items. If the key or AI service is unavailable, the backend writes a factual non-AI fallback update instead.

Recent News is limited to projects, research/publications, experience (including contract roles), education, credentials, CV changes, and contact changes. General profile edits such as the name, biography, title, skills, or profile photo never create a news item.

News is created only for Experience, Projects, Publications/Research, Education, Credentials, CV availability, and Contact availability. Ordinary profile edits such as name, biography, title, skills, links, or profile image never create a Recent News item.

The same local AI setup powers the portfolio chatbot. It receives public portfolio fields only; private contact fields and local files are excluded. On GitHub Pages, the chatbot falls back to searching the published portfolio data without exposing the API key.

The chatbot sends a short, bounded conversation history to the local backend so Groq can understand follow-up questions. The API key remains server-side and is never included in the browser or committed files.

The Home profile form includes separate uploads for the industry-focused CV and academic-focused CV. Both are stored under `../data/assets/documents/`.

## How to add or edit content

1. Select Home, Projects, Experience, Education, Publications, Blogs, or Licences.
2. Use **Add new**, or choose **Edit** beside a saved record.
3. Complete the form. Required fields have an asterisk.
4. Upload an image or PDF where applicable. Wait until the form says the upload has completed.
5. Select **Save data**.

The Home profile form includes a **Current focus** field. Its short text appears directly below the profile picture.

Projects also support **Full project details** and an optional **Live project URL**. Every project opens in an accessible popup on the Projects page with its original image aspect ratio, technology stack, repository link, and live link when supplied.

The admin generates and updates JSON automatically. You never need to edit JSON manually.

## Data structure

```text
data/
├── home.json
├── projects.json
├── experience.json
├── education.json
├── publications.json
├── blogs.json
├── licences.json
└── assets/
    ├── profile/
    ├── projects/
    ├── blogs/
    ├── licences/
    └── documents/
        ├── education/
        ├── experience/
        ├── publications/
        └── licences/
```

Each saved record has a stable `id`, `createdAt`, and `updatedAt`. Content dates such as project date, employment dates, publication date, and credential issue date remain separate from those audit timestamps.

Uploaded files are limited to 12 MB each. Supported types are JPG, PNG, WebP, GIF, SVG, PDF, and DOCX. Files receive safe unique names to prevent accidental overwrites.

## Sorting

The admin list can be searched and sorted by manual sort order, last update, creation time, content date, or title/name. `sortOrder` is the single ordering field throughout the system: a higher value appears before a lower value on the public portfolio.

## Portfolio grouping controls

The public portfolio groups content from three admin checkboxes:

- **Industry-focused project:** checked projects appear under “Industry-focused Projects”; unchecked projects appear under “Undergraduate Projects”.
- **Ongoing research:** checked research appears under “Ongoing Research”. Uncheck it later to move the item into “Research Works”.
- **Highlight this certificate:** checked certificates appear under “Highlighted Certificates”; unchecked certificates remain under “Other Certificates”.

These options are saved as normal Boolean values in the corresponding JSON records. IDs and timestamps continue to be generated automatically.

## Volunteer experience

Use **Volunteer experience** to add an organization, role, cause, start month, optional end month, description and manual sort order. Select **I am currently volunteering in this role** to show the start month through “Present”; the end month is disabled and cleared automatically.

Each volunteer record can contain up to 50 media entries. A media entry may contain a title, an external website URL, an uploaded image, PDF, Word document, or PowerPoint presentation. Uploaded media is saved under `../data/assets/volunteer/` and follows the same automatic cleanup rules as other managed files.

## Validation and backups

Validate every JSON file without starting the server:

```bash
npm run check:data
```

Before every create, update, or delete, the previous JSON file is copied to `admin/.backups/`. This backup folder is local and ignored by Git.

Uploaded files are also lifecycle-managed. When a saved CV, image, PDF or other managed upload is replaced, the old file is removed from `data/assets/` after the new JSON is saved. Deleting a record removes its linked uploaded files as well. A file is retained whenever another saved record still references the same path, and paths outside `data/assets/` are never deleted by this cleanup.

## GitHub publishing workflow

After reviewing the changes locally, run Git commands from the repository root (the folder above `admin`):

```bash
cd ..
git status
git add admin data
git commit -m "Update portfolio content"
git push
```

The Node.js admin is local-only. GitHub Pages publishes the static site and reads the committed files under `data/`; it does not run this backend.

## Adjusting the gold background pattern

In `../style.css`, edit the alpha value in this variable:

```css
--ornament-color: rgba(154,111,31,.20);
```

Increase `.20` for a darker ornament or decrease it for a lighter ornament.
