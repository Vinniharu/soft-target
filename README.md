# Soft Target

Soft Target is a **frontend-only web application** for generating structured investigation-style documents from user-inputted data.

The app allows users to input case details, IMEI numbers, target numbers, locations, and a dynamic list of soft targets, then automatically renders a **formatted document layout** identical to an official report. The generated document can be previewed and exported as an image or PDF.

This project is designed to replace **manual document creation** with a fast, repeatable, and error-free digital process.

---

## ✨ Features

- Frontend-only (no backend required)
- Structured form-based data entry
- Dynamic **Soft Target list** (add / remove rows)
- Real-time document preview
- Export document as **image or PDF**
- Print-ready layout
- Clean, reusable UI components

---

## 🧱 Tech Stack

- **Next.js (App Router)**
- **React**
- **Tailwind CSS**
- **React Hook Form** (form handling)
- **HTML-to-Image / PDF utility**

---

## 📄 Document Structure

Each generated document includes:

### Header Section

- Date
- Case ID

### Target Information

- IMEI (primary and optional secondary)
- Target phone number(s)
- Primary location
- Coordinates

### Soft Target Table (Dynamic)

Each row contains:

- Index number
- Soft target phone number
- Location / address
- Latitude & longitude

Users can dynamically **add or remove soft target rows** as needed.

---

## ➕ Dynamic Soft Target List

The Soft Target list is fully dynamic:

- "Add Soft Target" button appends a new row
- Each row contains its own controlled inputs
- Rows are automatically indexed
- No hard limit on number of entries

This makes the app flexible for small or large reports.

---

## 🖥️ Pages

### 1. Create Document

- Main form for all inputs
- Dynamic soft target list
- Live validation

### 2. Document Preview

- Displays the final formatted document
- Matches print/export layout exactly

---

## 📤 Export Options

- Download as **image (PNG/JPEG)**
- Print to PDF

The exported document matches the preview 1:1.

---

## 🚀 Getting Started

```bash
npm install
npm run dev
```

Then open:

```
http://localhost:3000
```

---

## 📁 Suggested Folder Structure

```
/app
  /create
  /preview
/components
  DocumentTemplate.tsx
  SoftTargetRow.tsx
  HeaderSection.tsx
/lib
  exportDocument.ts
/styles
```

---

## 🎯 Project Goal

Soft Target is built to:

- Eliminate repetitive manual document formatting
- Improve accuracy and consistency
- Speed up report generation
- Serve as a lightweight internal company tool

---

## 📌 Future Enhancements

- Multiple document templates
- Company logo & branding
- Saved drafts (local storage)
- Editable exported documents

---

## 📄 License

This project is intended for internal and private use.

---

**Soft Target** — structured documents, generated instantly.
