# Stash

**Your ideas, parked safely.**

Stash is a dedicated mobile app for capturing, organising, and revisiting ideas before they disappear. Built for the moments when ideas arrive at the worst time — mid-conversation, commuting, in the shower — Stash gets out of the way and lets you capture a thought in under ten seconds, then finds it again when you need it.

---

## The Problem

Most ideas die in the gap between having them and finding somewhere proper to put them. Notes apps are too slow to open and too distracting once open. Notion and Trello are too heavy. Voice memos are unsearchable. Stash is a single-purpose parking lot — fast enough to capture ideas the moment they arrive, organised enough to surface them when they matter.

---

## Features

### Fast Capture
Tap the `+` button anywhere in the app. A bottom sheet opens with the keyboard already focused. Type your idea and hit **Stash it**. The whole flow takes under ten seconds. No titles, no folders, no friction.

### The Lot
Your main idea feed. All active ideas in one scrollable list, sorted newest first. Filter by priority (Hot, Warm, Cold) with a single tap. Each card shows the idea text, its tags, and how long ago it was added. Ideas older than your configured threshold surface an amber age badge so nothing quietly rots.

### Priority Flags
Three levels — **Hot**, **Warm**, and **Cold** — signal how excited you are about an idea right now. Hot means you want to act on it soon. Cold means it's parked for later. Priority is always optional and always changeable.

### Tags
Organise ideas with colour-coded tags. Create tags inline while capturing or from the Tags screen. Filter your feed or search by tag. Each tag shows a live count of how many ideas it's linked to. Long-press any tag to rename or delete it — deletion unlinks cleanly without destroying the ideas themselves.

### Collections
Group related ideas together — *App Ideas*, *Business Ideas*, *Content Ideas*. Collections are optional and non-destructive. An idea can belong to a collection while also having tags, or neither. Delete a collection and the ideas inside survive, just unassigned.

### Idea Detail
Tap any idea to open its full detail view. Edit the idea text inline. Change its status (Active, Complete, Archived), priority, tags, and collection. Add running notes below the idea — a lightweight thread that lets an idea grow in place over time without you losing the original thought.

### Search
Full-text search across your entire stash. Results appear as you type with a 300ms debounce so Convex isn't hammered on every keystroke. Filter results by status. The same familiar idea cards, same swipe actions, same tap-to-detail flow.

### Idea Ageing
Ideas that sit untouched past your configured threshold (30, 60, or 90 days) automatically show an amber **age badge** in the feed. A quiet signal that something has been parked long enough to deserve a decision.

### Daily Resurfacing
A scheduled background job picks one of your older ideas at random each day and sends you a push notification. Tapping the notification deep-links directly to that idea. The parking lot never becomes a graveyard.

### Settings
Configure your experience without noise. Toggle the daily nudge on or off. Set the resurfacing cadence (daily, every two days, weekly). Adjust the ageing threshold. Change your default feed sort order. Everything persists to your account and syncs across devices.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Expo (managed workflow) |
| Language | TypeScript |
| Navigation | Expo Router |
| Backend & Database | Convex |
| Authentication | Clerk |
| Styling | NativeWind (Tailwind CSS) |
| Bottom sheets | @gorhom/bottom-sheet |
| Push notifications | Expo Notifications |
| Animations | React Native Reanimated |

---

## Project Structure

```
app/
  _layout.tsx              # Root layout — Clerk + Convex providers
  (auth)/
    sign-in/               # Sign in screen
    sign-up/               # Sign up + email verification
  (tabs)/
    index.tsx              # The Lot — home feed
    search.tsx             # Full-text search
    tags.tsx               # Tag manager
    settings.tsx           # User preferences
  idea/[id].tsx            # Idea detail (push screen)
  collection/[id].tsx      # Collection view (push screen)
  tag/[id].tsx             # Tag filtered list (push screen)
  quick-add/               # Quick capture bottom sheet
  tag-picker.tsx           # Tag picker bottom sheet

convex/
  schema.ts                # Database schema
  ideas.ts                 # Idea queries and mutations
  notes.ts                 # Note mutations
  tags.ts                  # Tag queries and mutations
  ideaTags.ts              # Tag-to-idea join mutations
  collections.ts           # Collection queries and mutations
  userPreferences.ts       # Settings persistence

constants/
  colors.js                # Design token palette

utils/
  tagSelection.ts          # Cross-screen tag state utility
```

---

## Color Palette

Stash uses a **Teal Punch** palette throughout.

| Token | Hex | Usage |
|---|---|---|
| Primary dark | `#042F2E` | Header backgrounds, nav bar |
| Brand teal | `#0D9488` | Buttons, FAB, active states |
| Accent teal | `#5DCAA5` | Secondary icons, muted text on dark |
| Light teal | `#CCFBF1` | Tag pills, text on dark backgrounds |
| Screen background | `#F0FDFA` | All screen surfaces |
| Hot priority | `#F97316` | Hot priority indicator |
| Cold priority | `#94A3B8` | Cold priority indicator |
| Age badge | `#FEF3C7` / `#92400E` | Aged idea indicator |
| Destructive | `#E11D48` | Archive and delete actions |

---

## Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI
- Android Studio (for Android development)
- A [Convex](https://convex.dev) account
- A [Clerk](https://clerk.com) account

### Installation

```bash
git clone https://github.com/your-username/stash.git
cd stash
npm install
```

### Environment variables

Create a `.env.local` file in the project root:

```
EXPO_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
```

### Set up Convex

```bash
npx convex dev
```

This creates your Convex project, pushes the schema, and starts watching for changes. Leave it running in a separate terminal.

### Run the app

```bash
npx expo start --clear
```

For a development build with full native module support:

```bash
npx expo run:android
```

---

## Screens

| Screen | Type | Description |
|---|---|---|
| Sign In | Auth | Email + password, Google, Apple |
| Sign Up | Auth | Registration with email verification |
| The Lot | Tab | Main idea feed with priority filters |
| Search | Tab | Full-text search with status filters |
| Tags | Tab | Tag manager with idea counts |
| Settings | Tab | Preferences and account |
| Idea Detail | Push | Full idea view — edit, notes, status |
| Collection View | Push | Ideas grouped by collection |
| Tag Filtered List | Push | Ideas filtered by a single tag |
| Quick Add | Sheet | Fast capture — opens over any screen |
| Tag Picker | Sheet | Multi-select tags, create inline |

---

## Roadmap

- [ ] Home screen widget (iOS and Android) for one-tap capture
- [ ] Share extension — pipe links and text from other apps into Stash
- [ ] Voice-to-text capture
- [ ] Idea-to-task promotion — convert a parked idea into a mini project
- [ ] Collections tab in main navigation
- [ ] Dark mode
- [ ] Android rename sheet (currently iOS only via `Alert.prompt`)

---

## License

MIT