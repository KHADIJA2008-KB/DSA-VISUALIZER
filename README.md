# 🧠 DSA Visualizer

Watch algorithms actually *do* the thing, instead of just reading pseudocode and hoping it clicks.

This is an interactive tool for visualizing data structures and algorithms — sorting, searching, stacks, queues, linked lists, trees, and graphs — step by step, with play/pause/speed controls and the code running alongside the animation.

Built because staring at Big-O notation in a textbook only gets you so far. Sometimes you just need to *see* the bars swap.

---

## ✨ What's inside

- 🔢 **Sorting** — Bubble, Selection, Insertion, Merge, Quick Sort
- 🔍 **Searching** — Linear, Binary
- 📚 **Stack** — Push/Pop, Peek, IsEmpty/IsFull, Postfix & Prefix evaluation
- 🎟️ **Queue** — Enqueue/Dequeue, Circular, Priority, Deque
- 🔗 **Linked List** — Singly, Doubly, Circular + all the usual operations
- 🌳 **Tree** — BST, Traversals, AVL balancing, and yes, Tries and Segment Trees too
- 🕸️ **Graph** — BFS, DFS, Dijkstra's, Prim's, Kruskal's

Each visualizer comes with:
- ▶️ Play / pause / step-through controls
- 🐢🐇 Adjustable speed
- 💻 Live code panel that highlights the active line
- 🌗 Dark mode (because obviously)

---

## 🛠️ Built with

- **Next.js** + **TypeScript**
- **Tailwind CSS**
- Good old-fashioned step-based state machines (no animation library magic, just arrays of steps)

---

## 🚀 Getting started

```bash
# clone it
git clone https://github.com/your-username/dsa-visualizer.git
cd dsa-visualizer

# install deps
npm install

# run it
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) and start clicking around.

---

## 🗺️ Roadmap

This thing is being built in phases — not all modules are live yet. Rough order:

- [x] Sorting + Searching
- [ ] Stack + Queue
- [ ] Linked List
- [ ] Trees (basic → advanced)
- [ ] Graphs
- [ ] Quizzes / complexity cheat sheet

Check the [issues](../../issues) tab to see what's cooking or to suggest a module.

---

## 🤝 Contributing

Found a bug? Want to add an algorithm? PRs are welcome — just keep new visualizers consistent with the existing `Step[]` pattern (see `/lib/algorithms`) so the animation engine can pick them up without extra plumbing.

---

## 📄 License

MIT — do whatever you want with it, just don't sell it back to me.

---

**Made by [Khadija Bilal]** — if this helped you understand DSA a little better, that's the whole point. ⭐ the repo if you want more people to find it.

## Deploed on Vercel


