# Schaak Notatie Spel

A browser-based chess notation tool for recording and replaying chess games, with PGN file support.  
Built for **[MartiniStad.nl](https://www.martinistad.nl)**.

---

## Features

- **Interactive chess board** — click a piece, then click the destination square
- **Move hints** — toggle valid move indicators on/off (the "Hulp" button)
- **Invalid move feedback** — wrong square flashes red, piece stays selected
- **Check highlighting** — the king's square turns red when in check
- **Pawn promotion** — modal to choose Queen, Rook, Bishop or Knight
- **Castling & en passant** — fully supported
- **Board flip** — rotate the board to play from Black's perspective
- **Move history** — notation displayed per player in standard algebraic notation (SAN)
- **Navigate history** — step forward/backward through all moves (`<<` `<` `>` `>>`)
- **Download PGN** — save the game as a `.pgn` file
- **Upload PGN** — load and replay any existing `.pgn` file
- **Mail game** — send the PGN via your mail client
- **Stay Awake** — uses the Wake Lock API to keep the screen on during play

---

## How to Use

1. Open `index.html` in a browser (works as a static file too — no server required)
2. Enter player names in the name fields above each move list
3. Click a piece to select it — valid moves are highlighted
4. Click the destination square to execute the move
5. Use the navigation buttons to review moves
6. Download or mail the game when finished

### PGN Support

- **Download** saves the current game as a standard `.pgn` file
- **Upload** loads any `.pgn` file and replays all moves automatically

---

## File Structure

```
schaak/
├── index.html          # Main page — board, UI, buttons
├── js/
│   └── s.js           # Chess engine & game logic
└── pieces/            # PNG piece images (Kw.png, Qb.png, etc.)
```

Piece filenames follow the pattern `[Type][Color].png`  
e.g. `Kw.png` = White King, `Qb.png` = Black Queen

---

## Credits

Made by **D art-painters** with the help of **GitHub Copilot**.  
&copy; 2025 – 2026 D art-painters / MartiniStad.nl
