# 🗺️ Grid Game

A simple browser-based 2D grid exploration game, built with **vanilla HTML/CSS/JavaScript** — no external assets or frameworks.

play here > https://krealer.github.io/grid-game/

---

## 🎮 Features

- 🧍 **Grid-based movement** (19×12 map)
- 🚪 **Interactive doors** (transition between maps)
- 💬 **NPC dialog** with randomized greetings
- 🧳 **Inventory system** (collect items from chests)
- ❌ **Walls and obstacles** with real pathfinding
- 🪄 **Step-by-step movement** (0.5s per tile)
- 📁 **Modular map structure** via JSON files
- 🌐 **Runs on GitHub Pages** — no backend required

---

## 🧠 How It Works

- All maps are JSON grids containing tile data (e.g. `floor`, `wall`, `npc`, `chest`, `door`).
- Doors contain a `target` map and an `entry` coordinate — enabling map transitions.
- NPCs display one of 10 randomized dialog messages.
- Chests add items to a persistent inventory UI.
- Player uses A* pathfinding to auto-navigate around walls.

---