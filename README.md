# Schaak Notatie Spel

A browser-based chess notation tool for recording and replaying chess games, with PGN import and export. Built for [MartiniStad.nl](https://www.martinistad.nl).

## Features

- Play by selecting a piece and then its destination square
- Toggle legal-move hints with **Hulp**
- Highlight check and provide feedback for invalid moves
- Handle castling, en passant and pawn promotion
- Flip the board to play from Black's perspective
- Review the game using the move-history controls (`<<`, `<`, `>` and `>>`)
- Save and restore the current game and player names in the browser
- Download the game as a PGN file or open it in the default mail client
- Upload a PGN file and replay its moves
- Request a screen wake lock on supported browsers
- Store played games in the site's database when downloading, mailing or starting a new game

## Use

This is a PHP application, not a standalone static page. Serve it through PHP and open `schaak/` on the site. The page requires a configured `config.php` password hash before it can be used.

To create the password hash, run:

```sh
php -r "echo password_hash('your-password', PASSWORD_DEFAULT);"
```

Create `config.php` in this directory with the generated hash:

```php
<?php
return [
    'password_hash' => 'paste-the-generated-hash-here',
];
```

`config.php` is intentionally excluded from version control; do not commit it or put the plain-text password in it. The login cookie is scoped to `/schaak/` and lasts up to 90 days.

### Database game storage

The chess board and PGN download/upload run in the browser. Server-side game storage additionally requires the MartiniStad site's PHP bootstrap, database configuration and `SiteDb` class. Create the `schaak_game` table from [`../_database/schaak_game.sql`](../_database/schaak_game.sql) in the configured site database. If running this directory outside the MartiniStad site, the `save.php` endpoint will not have those site dependencies.

## PGN

- **Download *.pgn** downloads the current game.
- **Upload *.pgn** loads the player names and replays the moves in a selected PGN file.
- **Mail** opens the default mail client with the PGN in the message body.

The game is also sent to the server for storage when a non-empty game is downloaded, mailed or replaced by starting a new game. Identical PGNs are stored only once.

## Files

```text
schaak/
├── index.php       # Password-protected game page
├── auth.php        # Login and signed-cookie authentication
├── config.php      # Local password-hash configuration (not committed)
├── save.php        # Authenticated endpoint for database storage
├── js/
│   └── s.js        # Chess rules, board UI, history and PGN handling
└── pieces/         # PNG images for the chess pieces
```

Piece image filenames use `[Type][Color].png`, where `K`, `Q`, `R`, `B`, `N` and `P` mean king, queen, rook, bishop, knight and pawn; `w` and `b` mean White and Black. For example, `Kw.png` is the White king and `Qb.png` is the Black queen.

## Credits

Made by **D art-painters** with the help of **GitHub Copilot**.  
&copy; 2025–2026 D art-painters / MartiniStad.nl
