# 📚 Introduction

Welcome to this repository! This project contains a collection of common databases that provide users with access to various information, including:

- Geographic locations of Iran
- Complete lists of colors
- Academic fields
- Persian proverbs
- Iranian names
- Iranian skills
- Words and phrases

These databases can be utilized in different projects, including software development and research.

For more detailed information, you can check the following documents:

- [دیتابیس های پرکاربرد (فارسی)](README.fa.md)
- [Common Databases (English)](README.en.md)

We hope you find this repository useful!

## Running The App

The React viewer app is in the `app/` directory.

### Option 1: Run from `app/` directory

```bash
cd app
npm install
npm run dev
```

### Option 2: Run from repository root

```bash
npm --prefix ./app install
npm --prefix ./app run dev
```

By default, Vite prints the local URL in terminal (for example: `http://127.0.0.1:5173/`).

### Build for production

```bash
npm --prefix ./app run build
```

Important: do not run `npm run dev` from repository root without `--prefix ./app`, because there is no `package.json` at root for the app runtime.
