# Farkle Game

A browser-based Farkle dice game built with React, featuring interactive dice selection, scoring logic, hot dice handling, and turn-based gameplay.

## Screenshots
Screenshots coming soon.

## Features
- Interactive dice rolling
- Click-to-select dice
- 3x2 dice grid
- Visual selection feedback
- Farkle scoring logic
- Hot Dice rule
- Score banking
- Reset/resign flow
- Bot turn placeholder

## Tech Stack
- React
- JavaScript
- Tailwind CSS
- lucide-react
- npm

## Getting Started (Windows PowerShell)
```powershell
git clone https://github.com/YOUR_USERNAME/farkle-game.git
cd farkle-game
npm install
npm start
```

Open: `http://localhost:3000`

## Troubleshooting
- If `node`/`npm` are not recognized, reinstall Node.js and ensure it is added to PATH.
- If an OpenSSL error appears on newer Node versions:

```powershell
$env:NODE_OPTIONS="--openssl-legacy-provider"
npm start
```

- If dependencies are broken:

```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install
```

## What this demonstrates
- React component architecture
- State management with hooks
- Game logic implementation
- UI/UX interaction design
- Debugging and iterative development
- GitHub-ready project documentation

## Future Improvements
- Full bot AI
- Multiplayer support
- Win condition
- Roll animations
- Sound effects
- Mobile layout
- Persistent high scores

## License
MIT

## Publishing to GitHub
Replace `YOUR_USERNAME` with your actual GitHub username.

```powershell
git init
git add .
git commit -m "Initial portfolio-ready Farkle game"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/farkle-game.git
git push -u origin main
```
