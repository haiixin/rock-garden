# Graph Report - rock-garden  (2026-10-11)

## Corpus Check
- Corpus is ~31,324 words - fits in a single context window. You may not need a graph.

## Summary
- 124 nodes · 213 edges · 12 communities (10 shown, 2 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 17 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Index Page UI
- Renderer Core
- Electron Main Process
- Pet Window Behavior
- Package Config
- Design Taste Skill
- Shop and Prizes
- Timer and Sound
- Icon Library
- Todo List
- Points System

## God Nodes (most connected - your core abstractions)
1. `save()` - 11 edges
2. `complete()` - 10 edges
3. `cheer()` - 8 edges
4. `renderPoints()` - 8 edges
5. `start()` - 8 edges
6. `Rock Garden (Electron productivity companion)` - 8 edges
7. `stop()` - 7 edges
8. `renderShop()` - 7 edges
9. `claimPrize()` - 7 edges
10. `buy()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `design-taste-frontend skill (agents copy)` --semantically_similar_to--> `design-taste-frontend skill`  [INFERRED] [semantically similar]
  .agents/skills/design-taste-frontend/SKILL.md → .claude/skills/design-taste-frontend/SKILL.md
- `Icon policy (Phosphor preferred, no hand-rolled SVG)` --semantically_similar_to--> `Phosphor icon set`  [INFERRED] [semantically similar]
  .claude/skills/design-taste-frontend/SKILL.md → README.md
- `Level and points bar` --implements--> `Coins and levels`  [INFERRED]
  index.html → README.md
- `Timer with mode buttons and controls` --implements--> `Pomodoro timer`  [INFERRED]
  index.html → README.md
- `Mascot slot and speech bubble` --implements--> `Pet rock mascot with moods`  [INFERRED]
  index.html → README.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Earn coins, level up, and spend in shop loop** — readme_pomodoro_timer, readme_todo_list, readme_coins_and_levels, readme_shop, readme_my_prizes [EXTRACTED 0.95]
- **Main screen sections** — index_timer, index_mascot_slot, index_points_section, index_todos_section [EXTRACTED 0.95]

## Communities (12 total, 2 thin omitted)

### Community 0 - "Index Page UI"
Cohesion: 0.17
Nodes (20): index.html main app window, Main screen, Mascot slot and speech bubble, Level and points bar, Prize form, Purchase confirmation receipt overlay, Shop screen with preview, tabs, grid, Timer with mode buttons and controls (+12 more)

### Community 1 - "Renderer Core"
Cohesion: 0.15
Nodes (15): bubble, currentLook(), DEFAULT_EQUIPPED, defaults, DURATIONS, mascot, POINTS, refreshLook() (+7 more)

### Community 2 - "Electron Main Process"
Cohesion: 0.17
Nodes (10): { app, BrowserWindow, ipcMain, screen }, createWindow(), fs, FULL, loadPos(), MINI, path, PET (+2 more)

### Community 3 - "Pet Window Behavior"
Cohesion: 0.24
Nodes (12): anim(), Pet animations (waddle, hop, squash), bubble, flip, pick(), rand(), say(), send() (+4 more)

### Community 4 - "Package Config"
Cohesion: 0.17
Nodes (10): description, devDependencies, electron, main, name, scripts, start, version (+2 more)

### Community 5 - "Design Taste Skill"
Cohesion: 0.20
Nodes (7): design-taste-frontend skill (agents copy), design-taste-frontend skill, Default architecture and conventions, Brief to design system map, Rock Garden README, Geist variable font, Phosphor icon set

### Community 6 - "Shop and Prizes"
Cohesion: 0.36
Nodes (10): applyCompact(), applyLook(), buy(), claimPrize(), equip(), renderPrizes(), renderShop(), save() (+2 more)

### Community 7 - "Timer and Sound"
Cohesion: 0.39
Nodes (9): beep(), blip(), fmt(), onTick(), renderTimer(), setMode(), setMood(), start() (+1 more)

### Community 9 - "Todo List"
Cohesion: 0.40
Nodes (5): cheer(), removeTodo(), renderTodos(), restingMood(), toggleTodo()

### Community 10 - "Points System"
Cohesion: 0.83
Nodes (4): addPoints(), complete(), renderPoints(), todayKey()

## Knowledge Gaps
- **4 isolated node(s):** `Geist variable font`, `Pet animations (waddle, hop, squash)`, `Brief to design system map`, `design-taste-frontend skill (agents copy)`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 43 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Rock Garden (Electron productivity companion)` connect `Index Page UI` to `Design Taste Skill`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **What connects `Geist variable font`, `Pet animations (waddle, hop, squash)`, `Brief to design system map` to the rest of the system?**
  _4 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Why does `Pet stage with flip and mascot slot` connect `Index Page UI` to `Pet Window Behavior`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Why does `Rock Garden README` connect `Design Taste Skill` to `Index Page UI`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._