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
- Save a game to the site database and browse/load the latest 100 saved games
- Download the game as a PGN file or open it in the default mail client
- Upload a PGN file and replay its moves
- Request a screen wake lock on supported browsers
- Save a game explicitly or automatically when mailing; duplicate PGNs are not stored twice

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

The chess board and PGN download/upload run in the browser. Saving and browsing games additionally require the MartiniStad site's PHP bootstrap, database configuration and `SiteDb` class. Create the `schaak_game` table from [`schaak_game.sql`](schaak_game.sql) in the configured site database. If running this directory outside the MartiniStad site, the `save.php` and `games.php` endpoints will not have those site dependencies.

## PGN

- **Save** stores the current position's game in the database. If you navigate back through the moves and save, that shorter game is saved as a separate PGN.
- **Show** lists up to 100 saved games by save date and player names; choose one to load it and restore its names, or use the red delete button beside it and confirm to remove it.
- **Download *.pgn** downloads the current game without saving it to the database.
- **Upload *.pgn** loads the player names and replays the moves in a selected PGN file.
- **Mail** saves the game first, then opens the default mail client with the PGN in the message body. An identical PGN is not saved twice.

Games must contain at least one move to be saved or mailed.

## Files

```text
schaak/
├── index.php       # Password-protected game page
├── auth.php        # Login and signed-cookie authentication
├── config.php      # Local password-hash configuration (not committed)
├── save.php        # Authenticated endpoint for database storage
├── games.php       # Authenticated endpoint for listing/loading saved games
├── delete.php      # Authenticated endpoint for deleting a saved game
├── schaak_game.sql # Database schema for stored games
├── js/
│   └── s.js        # Chess rules, board UI, history and PGN handling
└── pieces/         # PNG images for the chess pieces
```

Piece image filenames use `[Type][Color].png`, where `K`, `Q`, `R`, `B`, `N` and `P` mean king, queen, rook, bishop, knight and pawn; `w` and `b` mean White and Black. For example, `Kw.png` is the White king and `Qb.png` is the Black queen.

## Credits

Made by **D art-painters** with the help of **GitHub Copilot**.  
&copy; 2025–2026 D art-painters / MartiniStad.nl
