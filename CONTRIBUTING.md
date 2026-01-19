[English](CONTRIBUTING.md) | [中文](CONTRIBUTING.zh-CN.md)

# Contributing to SF6 Notebook

First of all, thank you for your interest in contributing to **SF6 Notebook** ❤️  
This project is a personal, tool-oriented notebook for *Street Fighter 6* players, and all contributions are welcome as long as they align with its core philosophy.

---

## 🧭 Project Philosophy

Before contributing, please keep these principles in mind:

- **Local-first**: User data should stay on the user’s device. Avoid features that require accounts or servers.
- **Tool over platform**: This is a utility for players, not a social network or content platform.
- **Practicality first**: Features should directly help training, matchup preparation, or match review.
- **Simplicity**: Prefer small, understandable changes over complex abstractions.

---

## 🐛 Reporting Bugs

If you find a bug:

1. Check the **Issues** tab to see if it has already been reported.
2. If not, open a new issue and include:
   - A clear description of the problem
   - Steps to reproduce
   - Expected vs actual behavior
   - Browser / OS information (desktop or mobile)
   - Screenshots if applicable

---

## 💡 Feature Requests

Feature ideas are welcome, especially if they relate to:

- Matchup / combo workflow improvements
- Fighter Input system refinements
- Mobile usability
- Performance or accessibility improvements

When opening a feature request, please explain:

- What problem it solves for players
- Why it fits SF6 Notebook’s philosophy
- Any rough UI or interaction idea you have

---

## 🔧 Development Setup

### 1. Fork & Clone

```bash
git clone https://github.com/<your-username>/sf6_notebook.git
cd sf6_notebook
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run locally

```bash
npm run dev
```

---

## 🔀 Pull Request Guidelines

- Create a new branch for your change:
  ```bash
  git checkout -b feature/your-feature-name
  ```

- Keep pull requests **focused**. One feature or fix per PR is preferred.
- Follow existing code style and patterns.
- Avoid introducing breaking changes unless discussed beforehand.
- If your change affects UI or UX, screenshots or short screen recordings are very helpful.

---

## 📱 Mobile Considerations

SF6 Notebook places special emphasis on mobile usability. When contributing UI changes, please consider:

- Touch target size (≥ 44px)
- Safe-area insets (notches, home indicator)
- Soft keyboard behavior
- Avoiding reliance on keyboard-only shortcuts

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the **MIT License**, the same license used by this project.

---

## 🙏 Thank You

Every issue report, suggestion, and pull request helps make SF6 Notebook better for players.

Whether you are a developer, a fighting game player, or both — your input is appreciated.
