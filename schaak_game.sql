CREATE TABLE IF NOT EXISTS `schaak_game` (
  `id`         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `played_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `white_name` VARCHAR(80)  NOT NULL DEFAULT 'Wit',
  `black_name` VARCHAR(80)  NOT NULL DEFAULT 'Zwart',
  `pgn`        TEXT         NOT NULL,
  `pgn_hash`   CHAR(64)     NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_pgn_hash` (`pgn_hash`),
  KEY `idx_played_at` (`played_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
