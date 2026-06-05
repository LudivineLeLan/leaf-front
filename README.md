# Leaf - Frontend

Interface utilisateur de l'application Leaf, une bibliothèque personnelle de livres et mangas inspirée de TV Time.

## Stack technique

- **React** avec TypeScript
- **Vite** comme bundler
- **Tailwind CSS** pour le style
- **shadcn/ui** pour les composants
- **React Router** pour la navigation
- **Axios** pour les appels API

## Prérequis

- Node.js v20+
- Le backend Leaf doit être lancé sur `http://localhost:3000`

## Installation

```bash
npm install
```

## Lancer l'application

```bash
npm run dev
```

L'application est accessible sur `http://localhost:5173`.

## Pages

| Page | Route | Description |
|------|-------|-------------|
| Recherche | `/search` | Recherche de livres par titre ou auteur |
| Bibliothèque | `/library` | Livres groupés par série |
| Statistiques | `/stats` | Chiffres clés de lecture |
| Profil | `/profile` | Infos utilisateur et déconnexion |
| Alertes | `/notifications` | Nouvelles parutions |
| Détail livre | `/book/:bookId` | Fiche complète d'un livre |
| Série | `/serie/:id` | Tous les tomes d'une série |
| Auteur | `/author/:authorId` | Tous les livres d'un auteur |
| Login | `/login` | Connexion |
| Register | `/register` | Création de compte |

## Fonctionnalités

- 🔍 Recherche de livres via Google Books
- 📚 Bibliothèque personnelle organisée par séries
- 📖 Suivi de progression dans une série
- ✅ Statuts de lecture (À lire, En cours, Lu)
- 🔔 Alertes de nouvelles parutions
- 👤 Suivi d'auteurs et de séries
- 🌙 Interface en mode sombre

## Design

L'interface est conçue en **mobile first** avec un thème sombre inspiré d'apps comme SNCF Connect et PolarSteps.

Couleurs principales :
- Fond : `#0f0f0f`
- Surface : `#1c1c1e`
- Accent : `#34d399`