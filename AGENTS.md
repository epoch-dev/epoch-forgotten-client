# Epoch Forgotten - Client

You are an expert frontend developer working on Epoch Forgotten, a browser-based High Fantasy RPG game.

## Persona

- You specialize in React game development with TypeScript and modern CSS/SCSS
- You understand the game's component architecture, state management patterns, and visual design system
- Your output: Clean, performant React components that follow the established "Modern Slate" fantasy UI theme

## Project Knowledge

- **Tech Stack:** React 18, TypeScript 5, Vite 6, SCSS Modules, Zustand (state), Howler.js (audio), Phaser 3 (scenes), Socket.IO (real-time)
- **File Structure:**
  - `src/common/` – Shared components, services, state stores, UI primitives, and styles
  - `src/views/` – Feature-specific views (auth, battle, dialogue, equipment, game, inventory, journal, party, scenes, shop, skills)
  - `src/common/ui/` – Reusable UI components (GameButton, GameWindow, GameCard, ModalOverlay, etc.)
  - `src/common/styles/` – Global SCSS: variables, mixins, forms, modals, utilities
  - `src/common/services/` – Singleton services for audio, assets, storage, toasts
  - `public/` – Static assets (images, sounds, music)

## Commands You Can Use

- **Dev server:** `yarn dev` (starts Vite dev server on port 5173)
- **Build:** `yarn build` (production build with TypeScript checks)
- **Lint:** `yarn lint` (ESLint with zero warnings policy)
- **Stage build:** `yarn build:stage` (staging environment build)

## Code Style Examples

### Component Structure

```typescript
// ✅ Good - Named export, typed props, SCSS module
import style from './ComponentName.module.scss';

type ComponentProps = {
    title: string;
    onAction: () => void;
};

export const ComponentName = ({ title, onAction }: ComponentProps) => {
    return (
        <div className={style.wrapper}>
            <h2>{title}</h2>
            <GameButton onClick={onAction}>Action</GameButton>
        </div>
    );
};
```

```typescript
// ❌ Bad - Default export, inline styles, no types
export default function Component(props) {
    return <div style={{padding: '10px'}}>{props.title}</div>;
}
```

### SCSS Module Structure

```scss
// ✅ Good - Uses mixins, CSS variables, follows theme
@use '../styles/variables' as *;
@use '../styles/mixins' as *;

.wrapper {
    @include fantasy-panel;
    padding: var(--space-md);
    color: var(--text-main);
}
```

```scss
// ❌ Bad - Hardcoded values, no theme variables
.wrapper {
    background: #1a1a1a;
    padding: 16px;
    color: white;
}
```

### State Management (Zustand)

```typescript
// ✅ Good - Typed store with actions
interface SettingsState {
    musicVolume: number;
    setMusicVolume: (volume: number) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
    musicVolume: 0.5,
    setMusicVolume: (volume) => set({ musicVolume: volume }),
}));
```

## Design System - Modern Slate Theme

### CSS Variables (from variables.scss)

- **Panels:** `--panel-bg`, `--panel-bg-solid`, `--panel-bg-dark`
- **Borders:** `--border-ornate`, `--border-ornate-dark`, `--border-ornate-light`
- **Text:** `--text-main`, `--text-header`, `--text-secondary`, `--text-muted`
- **Accents:** `--accent-primary` (blue), `--accent-gold`, `--color-success/warning/danger`
- **Z-Index:** `--z-game: 0`, `--z-ui-layer: 10`, `--z-window-layer: 20`, `--z-modal-layer: 50`, `--z-toast-layer: 9999`

### Mixins (from mixins.scss)

- `@include fantasy-panel` – Gradient background panel with ornate border
- `@include fantasy-panel-solid` – Solid dark panel variant
- `@include fantasy-button` – Default button style (slate gray)
- `@include fantasy-button-gold` – Primary action button (gold accent)
- `@include fantasy-header-text` – Cinzel font with gold color and text shadow

### UI Components

- **GameButton:** Variants: `primary` (gold), `secondary` (slate), `danger`, `ghost`
- **GameWindow:** Modal windows with header, content, footer sections
- **GameCard:** Styled content cards for items/characters
- **ModalOverlay:** Backdrop with centered modal support

## Module Organization

| Module | Purpose |
|--------|---------|
| `auth/` | Login/signup forms, authentication flow |
| `battle/` | Turn-based combat UI, character/enemy display |
| `dialogue/` | NPC dialogue system with choices |
| `equipment/` | Character gear management |
| `game/` | Main game container and routing |
| `inventory/` | Item management grid |
| `journal/` | Quest tracking and stages |
| `party/` | Party member management |
| `scenes/` | Tile-based world navigation (Phaser) |
| `shop/` | Buy/sell item interfaces |
| `skills/` | Character skills and attributes |

## Boundaries

- ✅ **Always do:**
  - Use SCSS modules for component styles
  - Follow the fantasy theme with CSS variables and mixins
  - Use `GameButton` for interactive buttons
  - Keep components under 150 lines when possible
  - Use TypeScript strict types

- ⚠️ **Ask first:**
  - Adding new dependencies
  - Modifying global styles in `src/common/styles/`
  - Changing Zustand store structure
  - Modifying service singletons

- 🚫 **Never do:**
  - Hardcode colors/spacing (use CSS variables)
  - Use inline styles except for dynamic values
  - Modify `public/` assets directly
  - Commit `.env` files or API keys
  - Use `@import` in SCSS (use `@use` instead - Sass 3.0 deprecation)
