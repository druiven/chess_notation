const initialSetup = [
    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
];

// --- Game State ---
let board = [];
let turn = 'white';
let selectedSquare = null;
let validMoves = [];
let lastMove = null;
let isCheck = false;
let moveHistory = [];
let castlingRights = {
    w: {
        k: true,
        q: true
    },
    b: {
        k: true,
        q: true
    }
};
let enPassantTarget = null;

let gameHistoryStack = [];
let currentHistoryIndex = -1;
let isBoardFlipped = false;
let pendingPromotion = null;
let showMoveHints = true;

// --- IMAGE URL LOGIC ---
function getPieceUrl(pieceChar) {
    const isWhite = pieceChar === pieceChar.toUpperCase();
    const typeKey = pieceChar.toUpperCase(); // K, Q, R, B, N, P
    const colorKey = isWhite ? 'w' : 'b';

    return `pieces/${typeKey}${colorKey}.png`;
}

function initGame() {
    board = JSON.parse(JSON.stringify(initialSetup));
    turn = 'white';
    selectedSquare = null;
    validMoves = [];
    lastMove = null;
    isCheck = false;
    moveHistory = [];
    castlingRights = {
        w: {
            k: true,
            q: true
        },
        b: {
            k: true,
            q: true
        }
    };
    enPassantTarget = null;
    pendingPromotion = null;
    showMoveHints = true; // Default hints aan bij nieuw spel

    gameHistoryStack = [];
    currentHistoryIndex = -1;
    saveGameState();

    renderBoard();
    updateStatus();
    updateNavButtons();
    updateHintsButton();
    hidePromotionModal();
    updateMoveDisplay();
}

// --- UI Update Logic ---
function updateMoveDisplay() {
    const whiteEl = document.getElementById('moves-white');
    const blackEl = document.getElementById('moves-black');
    let whiteText = "";
    let blackText = "";

    moveHistory.forEach((turn, index) => {
        const num = index + 1;
        whiteText += `${num}. ${turn.white}\n`;
        if (turn.black) {
            blackText += `${num}. ${turn.black}\n`;
        }
    });

    whiteEl.value = whiteText;
    blackEl.value = blackText;
    whiteEl.scrollTop = whiteEl.scrollHeight;
    blackEl.scrollTop = blackEl.scrollHeight;
}

function saveGameState() {
    if (currentHistoryIndex < gameHistoryStack.length - 1) {
        gameHistoryStack = gameHistoryStack.slice(0, currentHistoryIndex + 1);
    }

    const state = {
        board: JSON.parse(JSON.stringify(board)),
        turn: turn,
        lastMove: lastMove,
        isCheck: isCheck,
        moveHistory: JSON.parse(JSON.stringify(moveHistory)),
        castlingRights: JSON.parse(JSON.stringify(castlingRights)),
        enPassantTarget: enPassantTarget ? {
            ...enPassantTarget
        } : null
    };
    gameHistoryStack.push(state);
    currentHistoryIndex++;
    updateNavButtons();
    updateMoveDisplay();
}

// --- HISTORY NAVIGATION ---
function loadState(index) {
    if (index >= 0 && index < gameHistoryStack.length) {
        currentHistoryIndex = index;
        const state = gameHistoryStack[currentHistoryIndex];

        board = JSON.parse(JSON.stringify(state.board));
        turn = state.turn;
        lastMove = state.lastMove;
        isCheck = state.isCheck;
        moveHistory = JSON.parse(JSON.stringify(state.moveHistory));
        castlingRights = JSON.parse(JSON.stringify(state.castlingRights));
        enPassantTarget = state.enPassantTarget ? {
            ...state.enPassantTarget
        } : null;

        selectedSquare = null;
        validMoves = [];

        renderBoard();
        updateStatus();
        updateNavButtons();
        updateMoveDisplay();
    }
}

function navigateHistory(direction) {
    loadState(currentHistoryIndex + direction);
}

function goToStart() {
    loadState(0);
}

function goToEnd() {
    loadState(gameHistoryStack.length - 1);
}

function updateNavButtons() {
    const hasHistory = gameHistoryStack.length > 0;
    const atStart = currentHistoryIndex <= 0;
    const atEnd = currentHistoryIndex >= gameHistoryStack.length - 1;

    document.getElementById('btn-start').disabled = atStart;
    document.getElementById('btn-prev').disabled = atStart;
    document.getElementById('btn-next').disabled = atEnd;
    document.getElementById('btn-end').disabled = atEnd;
}

function toggleBoardFlip() {
    isBoardFlipped = !isBoardFlipped;
    const boardEl = document.getElementById('board');
    if (isBoardFlipped) {
        boardEl.classList.add('flipped');
    } else {
        boardEl.classList.remove('flipped');
    }
}

function toggleMoveHints() {
    showMoveHints = !showMoveHints;
    updateHintsButton();
    renderBoard();
}

function updateHintsButton() {
    const btn = document.getElementById('btn-hints');
    const iconOn = document.getElementById('icon-hints-on');
    const iconOff = document.getElementById('icon-hints-off');

    if (showMoveHints) {
        iconOn.classList.remove('hidden');
        iconOff.classList.add('hidden');
        btn.classList.remove('hints-off', 'bg-slate-300');
        btn.classList.add('bg-slate-200');
    } else {
        iconOn.classList.add('hidden');
        iconOff.classList.remove('hidden');
        btn.classList.add('hints-off', 'bg-slate-300');
        btn.classList.remove('bg-slate-200');
    }
}

// --- RENDER FUNCTIE MET PNG SUPPORT ---
function renderBoard() {
    const boardEl = document.getElementById('board');
    boardEl.innerHTML = '';

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const squareEl = document.createElement('div');
            const isDark = (r + c) % 2 === 1;
            squareEl.className = `square ${isDark ? 'dark' : 'light'}`;

            const pieceChar = board[r][c];

            if (pieceChar) {
                const imgUrl = getPieceUrl(pieceChar);

                // Fallback naar tekst als plaatje niet laadt
                squareEl.innerHTML = `<img src="${imgUrl}" class="piece-img" alt="${pieceChar}" onerror="this.style.display='none'; this.parentElement.innerText='${pieceChar}'">`;
            }

            if (selectedSquare && selectedSquare.row === r && selectedSquare.col === c) {
                squareEl.classList.add('selected');
            }
            if (lastMove && ((lastMove.from.row === r && lastMove.from.col === c) || (lastMove.to.row === r && lastMove.to.col === c))) {
                squareEl.classList.add('last-move');
            }

            if (showMoveHints) {
                const move = validMoves.find(m => m.row === r && m.col === c);
                if (move) {
                    const isEP = move.enPassant;
                    squareEl.classList.add((board[r][c] || isEP) ? 'valid-capture' : 'valid-move');
                }
            }

            if (isCheck && pieceChar && pieceChar.toLowerCase() === 'k' && (isWhite(pieceChar) === (turn === 'white'))) {
                squareEl.classList.add('check');
            }

            squareEl.onclick = () => handleSquareClick(r, c);
            boardEl.appendChild(squareEl);
        }
    }
}

function updateStatus() {
    const whiteName = document.getElementById('name-white').value || 'Wit';
    const blackName = document.getElementById('name-black').value || 'Zwart';
    const name = turn === 'white' ? whiteName : blackName;

    const text = isCheck ? `${name} staat SCHAAK!` : `${name} aan zet`;
    document.getElementById('status-text').textContent = text;

    const ind = document.getElementById('turn-indicator');
    ind.className = `w-6 h-6 rounded-full border-2 border-slate-300 shadow-sm transition-colors ${turn === 'white' ? 'bg-white' : 'bg-slate-800'}`;
}

function showPromotionModal() {
    const modal = document.getElementById('promotion-modal');
    const container = document.getElementById('promo-options');
    modal.classList.remove('hidden');
    const pieces = turn === 'white' ? ['Q', 'R', 'B', 'N'] : ['q', 'r', 'b', 'n'];

    container.innerHTML = '';
    pieces.forEach(pieceChar => {
        const btn = document.createElement('div');
        btn.className = 'promo-btn w-16 h-16 p-2';
        const imgUrl = getPieceUrl(pieceChar);
        btn.innerHTML = `<img src="${imgUrl}">`;
        btn.onclick = () => completePromotion(pieceChar.toUpperCase());
        container.appendChild(btn);
    });
}

function hidePromotionModal() {
    document.getElementById('promotion-modal').classList.add('hidden');
}

function completePromotion(type) {
    hidePromotionModal();
    if (pendingPromotion) {
        executeMove(pendingPromotion, type);
        pendingPromotion = null;
    }
}

function handleSquareClick(r, c) {
    if (!document.getElementById('promotion-modal').classList.contains('hidden')) return;

    const piece = board[r][c];
    const isOwn = piece && isWhite(piece) === (turn === 'white');
    const move = validMoves.find(m => m.row === r && m.col === c);

    if (move) {
        const movingPiece = board[selectedSquare.row][selectedSquare.col];
        const isPawn = movingPiece.toLowerCase() === 'p';
        const isPromotionRank = (turn === 'white' && move.row === 0) || (turn === 'black' && move.row === 7);

        if (isPawn && isPromotionRank) {
            pendingPromotion = move;
            showPromotionModal();
        } else {
            executeMove(move);
        }
    } else if (isOwn) {
        selectedSquare = {
            row: r,
            col: c
        };
        validMoves = getValidMoves(r, c, board);
        renderBoard();
    } else {
        if (selectedSquare !== null) {
            flashInvalidSquare(r, c);
            return; // stuk blijft geselecteerd, gebruiker kan opnieuw proberen
        }
        selectedSquare = null;
        validMoves = [];
        renderBoard();
    }
}

function flashInvalidSquare(r, c) {
    const boardEl = document.getElementById('board');
    const squareEl = boardEl.children[r * 8 + c];
    if (!squareEl) return;
    squareEl.classList.remove('flash-invalid');
    // Forceer reflow zodat de animatie opnieuw start bij herhaling
    void squareEl.offsetWidth;
    squareEl.classList.add('flash-invalid');
    squareEl.addEventListener('animationend', () => {
        squareEl.classList.remove('flash-invalid');
    }, { once: true });
}

function executeMove(move, promotionType = null) {
    const fr = selectedSquare.row,
        fc = selectedSquare.col;
    const tr = move.row,
        tc = move.col;
    const piece = board[fr][fc];

    const cols = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    let moveStr = "";

    // --- FIX START: DISAMBIGUATION LOGIC (Onderscheid dubbele stukken) ---
    if (piece.toLowerCase() !== 'p') {
        moveStr += piece.toUpperCase();

        let conflicts = [];
        // Zoek alle andere stukken van hetzelfde type en kleur
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (r === fr && c === fc) continue;
                if (board[r][c] === piece) {
                    // Kijk of dit andere stuk ook naar de doelpositie kan
                    let mvs = getValidMoves(r, c, board);
                    if (mvs.some(m => m.row === tr && m.col === tc)) {
                        conflicts.push({
                            r,
                            c
                        });
                    }
                }
            }
        }

        if (conflicts.length > 0) {
            const sameFile = conflicts.some(o => o.c === fc);
            const sameRank = conflicts.some(o => o.r === fr);

            if (!sameFile) {
                // Niemand anders staat op deze lijn, dus de lijnletter is genoeg (bv. Pgf3)
                moveStr += cols[fc];
            } else if (!sameRank) {
                // Iemand staat op dezelfde lijn, dus gebruik het rijnummer (bv. P1f3)
                moveStr += (8 - fr);
            } else {
                // Zeer zeldzaam: zowel rij als lijn dubbel, gebruik beide (bv. Dc2e4)
                moveStr += cols[fc] + (8 - fr);
            }
        }
    }
    // --- FIX END ---

    const isCapture = board[tr][tc] || move.enPassant;
    if (isCapture) {
        if (piece.toLowerCase() === 'p') moveStr += cols[fc];
        moveStr += "x";
    }

    moveStr += `${cols[tc]}${8 - tr}`;

    board[tr][tc] = piece;
    board[fr][fc] = null;

    if (move.castle) {
        if (move.castle === 'kingside') {
            board[fr][5] = board[fr][7];
            board[fr][7] = null;
            moveStr = "O-O";
        } else if (move.castle === 'queenside') {
            board[fr][3] = board[fr][0];
            board[fr][0] = null;
            moveStr = "O-O-O";
        }
    }

    if (move.enPassant) {
        board[fr][tc] = null;
        if (!moveStr.includes('x')) moveStr = `${cols[fc]}x${cols[tc]}${8 - tr}`;
    }

    let nextEnPassantTarget = null;
    if (piece.toLowerCase() === 'p' && Math.abs(tr - fr) === 2) {
        nextEnPassantTarget = {
            row: (fr + tr) / 2,
            col: fc
        };
    }

    const color = turn === 'white' ? 'w' : 'b';
    const oppColor = turn === 'white' ? 'b' : 'w';

    if (piece.toLowerCase() === 'k') {
        castlingRights[color].k = false;
        castlingRights[color].q = false;
    }
    if (piece.toLowerCase() === 'r') {
        if (fr === (turn === 'white' ? 7 : 0) && fc === 0) castlingRights[color].q = false;
        if (fr === (turn === 'white' ? 7 : 0) && fc === 7) castlingRights[color].k = false;
    }
    if (move.captured === 'r' || move.captured === 'R') {
        if (tr === (turn === 'white' ? 0 : 7) && tc === 0) castlingRights[oppColor].q = false;
        if (tr === (turn === 'white' ? 0 : 7) && tc === 7) castlingRights[oppColor].k = false;
    }

    if (promotionType) {
        const newPiece = turn === 'white' ? promotionType.toUpperCase() : promotionType.toLowerCase();
        board[tr][tc] = newPiece;
        moveStr += "=" + promotionType.toUpperCase();
    }

    const isOpponentInCheck = isKingInCheck(turn === 'white' ? 'black' : 'white', board);
    if (isOpponentInCheck) moveStr += "+";

    if (turn === 'white') {
        moveHistory.push({
            white: moveStr,
            black: ''
        });
    } else {
        moveHistory[moveHistory.length - 1].black = moveStr;
    }

    lastMove = {
        from: {
            row: fr,
            col: fc
        },
        to: {
            row: tr,
            col: tc
        }
    };
    turn = turn === 'white' ? 'black' : 'white';
    enPassantTarget = nextEnPassantTarget;
    isCheck = isOpponentInCheck;

    selectedSquare = null;
    validMoves = [];

    saveGameState();
    renderBoard();
    updateStatus();
}

function isSquareUnderAttack(r, c, defenderColor, currentBoard) {
    const attackerIsWhite = defenderColor !== 'white';
    const pDir = attackerIsWhite ? -1 : 1;

    const checkPawnRow = r - pDir;
    if (isOnBoard(checkPawnRow, c - 1)) {
        const p = currentBoard[checkPawnRow][c - 1];
        if (p && p.toLowerCase() === 'p' && isWhite(p) === attackerIsWhite) return true;
    }
    if (isOnBoard(checkPawnRow, c + 1)) {
        const p = currentBoard[checkPawnRow][c + 1];
        if (p && p.toLowerCase() === 'p' && isWhite(p) === attackerIsWhite) return true;
    }

    const nMoves = [
        [2, 1],
        [2, -1],
        [-2, 1],
        [-2, -1],
        [1, 2],
        [1, -2],
        [-1, 2],
        [-1, -2]
    ];
    for (let m of nMoves) {
        if (isOnBoard(r + m[0], c + m[1])) {
            const p = currentBoard[r + m[0]][c + m[1]];
            if (p && p.toLowerCase() === 'n' && isWhite(p) === attackerIsWhite) return true;
        }
    }

    const kMoves = [
        [0, 1],
        [0, -1],
        [1, 0],
        [-1, 0],
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1]
    ];
    for (let m of kMoves) {
        if (isOnBoard(r + m[0], c + m[1])) {
            const p = currentBoard[r + m[0]][c + m[1]];
            if (p && p.toLowerCase() === 'k' && isWhite(p) === attackerIsWhite) return true;
        }
    }

    const dirs = [
        [0, 1],
        [0, -1],
        [1, 0],
        [-1, 0],
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1]
    ];
    for (let i = 0; i < 8; i++) {
        const dr = dirs[i][0],
            dc = dirs[i][1];
        let nr = r + dr,
            nc = c + dc;
        while (isOnBoard(nr, nc)) {
            const p = currentBoard[nr][nc];
            if (p) {
                const isAttacker = isWhite(p) === attackerIsWhite;
                if (isAttacker) {
                    const type = p.toLowerCase();
                    const isOrtho = i < 4;
                    if (type === 'q') return true;
                    if (isOrtho && type === 'r') return true;
                    if (!isOrtho && type === 'b') return true;
                }
                break;
            }
            nr += dr;
            nc += dc;
        }
    }
    return false;
}

let wakeLock = null;
async function initWakeLock() {
    if ('wakeLock' in navigator && !wakeLock) {
        try {
            wakeLock = await navigator.wakeLock.request('screen');
            document.getElementById('wakelock-status').textContent = "Stay Awake Actief";
            document.getElementById('wakelock-status').style.color = "#22c55e";
        } catch (err) {
            console.log('Wake Lock error:', err);
        }
    }
}
document.addEventListener('visibilitychange', async () => {
    if (wakeLock !== null && document.visibilityState === 'visible') initWakeLock();
});

function getPGN() {
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '.');
    const white = document.getElementById('name-white').value || 'Wit';
    const black = document.getElementById('name-black').value || 'Zwart';

    let pgn = `[Event "Casual Game"]\n[Site "MartiniStad.nl"]\n[Date "${date}"]\n[White "${white}"]\n[Black "${black}"]\n\n`;

    moveHistory.forEach((turn, index) => {
        pgn += `${index + 1}. ${turn.white} ${turn.black || ''} `;
    });
    return pgn;
}

function downloadPGN() {
    const pgnContent = getPGN();
    const blob = new Blob([pgnContent], {
        type: 'text/plain'
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `schaakpartij_${new Date().getTime()}.pgn`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

function sendGameEmail() {
    const pgnBody = getPGN();
    const subject = encodeURIComponent("Mijn Schaakpartij (PGN)");
    const bodyEnc = encodeURIComponent(pgnBody);
    window.location.href = `mailto:?subject=${subject}&body=${bodyEnc}`;
}

function handlePGNUpload(input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const text = e.target.result;
        parseAndLoadPGN(text);
    };
    reader.readAsText(file);
}

function parseAndLoadPGN(pgn) {
    initGame();

    const whiteMatch = pgn.match(/\[White "(.*?)"\]/);
    const blackMatch = pgn.match(/\[Black "(.*?)"\]/);

    if (whiteMatch && whiteMatch[1]) document.getElementById('name-white').value = whiteMatch[1];
    if (blackMatch && blackMatch[1]) document.getElementById('name-black').value = blackMatch[1];

    updateStatus();

    let clean = pgn.replace(/\[.*?\]/gs, '');
    clean = clean.replace(/\{.*?\}/gs, '').replace(/;.*$/gm, '');
    clean = clean.replace(/\d+\.+/g, '');
    const tokens = clean.trim().split(/\s+/);

    for (let token of tokens) {
        if (['1-0', '0-1', '1/2-1/2', '*'].includes(token)) break;
        attemptMoveFromSAN(token);
    }
    updateMoveDisplay();
}

function attemptMoveFromSAN(san) {
    let allLegalMoves = [];
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            if (p && isWhite(p) === (turn === 'white')) {
                const mvs = getValidMoves(r, c, board);
                mvs.forEach(m => {
                    allLegalMoves.push({
                        from: {
                            row: r,
                            col: c
                        },
                        to: m
                    });
                });
            }
        }
    }

    const targetSquare = san.match(/[a-h][1-8]/);
    if (!targetSquare) {
        if (san.includes('O-O')) {
            const row = turn === 'white' ? 7 : 0;
            const isLong = san.includes('O-O-O');
            const targetCol = isLong ? 2 : 6;
            const matched = allLegalMoves.find(m => {
                return m.to.row === row && m.to.col === targetCol && board[m.from.row][m.from.col].toLowerCase() === 'k';
            });
            if (matched) {
                selectedSquare = matched.from;
                executeMove(matched.to);
            }
        }
        return;
    }

    const colMap = {
        a: 0,
        b: 1,
        c: 2,
        d: 3,
        e: 4,
        f: 5,
        g: 6,
        h: 7
    };
    const tCol = colMap[targetSquare[0].charAt(0)];
    const tRow = 8 - parseInt(targetSquare[0].charAt(1));

    let pieceType = 'p';
    if (/^[RNBQK]/.test(san)) pieceType = san.charAt(0).toLowerCase();

    const candidates = allLegalMoves.filter(m => {
        const p = board[m.from.row][m.from.col].toLowerCase();
        if (m.to.row !== tRow || m.to.col !== tCol) return false;
        if (p !== pieceType) return false;
        return true;
    });

    let chosenMove = candidates[0];
    if (candidates.length > 1) {
        for (let cand of candidates) {
            const fromColChar = Object.keys(colMap).find(key => colMap[key] === cand.from.col);
            const fromRowChar = (8 - cand.from.row).toString();
            // Verbeterde disambiguatie parsing
            if (san.includes(fromColChar) && san.indexOf(fromColChar) < san.indexOf(targetSquare[0])) {
                chosenMove = cand;
                break;
            }
            if (san.includes(fromRowChar) && san.indexOf(fromRowChar) < san.indexOf(targetSquare[0])) {
                chosenMove = cand;
                break;
            }
        }
    }

    if (chosenMove) {
        selectedSquare = chosenMove.from;
        let promo = null;
        if (san.includes('=')) {
            promo = san.split('=')[1].charAt(0);
        }
        executeMove(chosenMove.to, promo);
    }
}

async function copySourceCode() {
    try {
        const html = document.documentElement.outerHTML;
        const fullCode = "<!DOCTYPE html>\n" + html;
        await navigator.clipboard.writeText(fullCode);
        const btn = document.getElementById('copy-btn');
        const originalContent = btn.innerHTML;
        btn.innerHTML = `<span class="text-green-600 font-bold">Gekopieerd!</span>`;
        setTimeout(() => {
            btn.innerHTML = originalContent;
        }, 2000);
    } catch (err) {
        alert("Kon code niet automatisch kopiëren. Gebruik Ctrl+U en Ctrl+A.");
    }
}


function isWhite(p) {
    return p === p.toUpperCase();
}

function isOnBoard(r, c) {
    return r >= 0 && r < 8 && c >= 0 && c < 8;
}

function isKingInCheck(color, bd) {
    let kPos;
    const isW = color === 'white';
    for (let r = 0; r < 8; r++)
        for (let c = 0; c < 8; c++)
            if (bd[r][c] && bd[r][c].toLowerCase() == 'k' && isWhite(bd[r][c]) === isW) kPos = {
                r,
                c
            };
    if (!kPos) return false;
    return isSquareUnderAttack(kPos.r, kPos.c, color, bd);
}

function getValidMoves(r, c, bd, safe = true) {
    const p = bd[r][c];
    if (!p) return [];
    let mvs = [];
    const type = p.toLowerCase(),
        W = isWhite(p);

    const dirs = {
        r: [
            [0, 1],
            [0, -1],
            [1, 0],
            [-1, 0]
        ],
        b: [
            [1, 1],
            [1, -1],
            [-1, 1],
            [-1, -1]
        ],
        n: [
            [2, 1],
            [2, -1],
            [-2, 1],
            [-2, -1],
            [1, 2],
            [1, -2],
            [-1, 2],
            [-1, -2]
        ],
        q: [
            [0, 1],
            [0, -1],
            [1, 0],
            [-1, 0],
            [1, 1],
            [1, -1],
            [-1, 1],
            [-1, -1]
        ],
        k: [
            [0, 1],
            [0, -1],
            [1, 0],
            [-1, 0],
            [1, 1],
            [1, -1],
            [-1, 1],
            [-1, -1]
        ]
    };

    if (type == 'p') {
        const d = W ? -1 : 1,
            start = W ? 6 : 1;
        if (isOnBoard(r + d, c) && !bd[r + d][c]) {
            mvs.push({
                row: r + d,
                col: c
            });
            if (r === start && isOnBoard(r + d * 2, c) && !bd[r + d * 2][c]) mvs.push({
                row: r + d * 2,
                col: c
            });
        }
        [
            [d, 1],
            [d, -1]
        ].forEach(([dr, dc]) => {
            const tr = r + dr,
                tc = c + dc;
            if (isOnBoard(tr, tc)) {
                const t = bd[tr][tc];
                if (t && isWhite(t) !== W) {
                    mvs.push({
                        row: tr,
                        col: tc
                    });
                } else if (enPassantTarget && enPassantTarget.row === tr && enPassantTarget.col === tc) {
                    mvs.push({
                        row: tr,
                        col: tc,
                        enPassant: true
                    });
                }
            }
        });
    } else if (type == 'n' || type == 'k') {
        dirs[type].forEach(([dr, dc]) => {
            const nr = r + dr,
                nc = c + dc;
            if (isOnBoard(nr, nc)) {
                const t = bd[nr][nc];
                if (!t || isWhite(t) !== W) mvs.push({
                    row: nr,
                    col: nc
                });
            }
        });
    } else {
        dirs[type].forEach(([dr, dc]) => {
            let nr = r + dr,
                nc = c + dc;
            while (isOnBoard(nr, nc)) {
                const t = bd[nr][nc];
                if (!t) mvs.push({
                    row: nr,
                    col: nc
                });
                else {
                    if (isWhite(t) !== W) mvs.push({
                        row: nr,
                        col: nc
                    });
                    break;
                }
                nr += dr;
                nc += dc;
            }
        });
    }

    if (type === 'k' && safe && !isCheck) {
        const cRight = W ? castlingRights.w : castlingRights.b;
        const row = r;
        if (cRight.k) {
            if (!bd[row][5] && !bd[row][6]) {
                if (!isSquareUnderAttack(row, 5, W ? 'white' : 'black', bd) &&
                    !isSquareUnderAttack(row, 6, W ? 'white' : 'black', bd)) {
                    mvs.push({
                        row: row,
                        col: 6,
                        castle: 'kingside'
                    });
                }
            }
        }
        if (cRight.q) {
            if (!bd[row][1] && !bd[row][2] && !bd[row][3]) {
                if (!isSquareUnderAttack(row, 3, W ? 'white' : 'black', bd) &&
                    !isSquareUnderAttack(row, 2, W ? 'white' : 'black', bd)) {
                    mvs.push({
                        row: row,
                        col: 2,
                        castle: 'queenside'
                    });
                }
            }
        }
    }

    if (safe) {
        mvs = mvs.filter(m => {
            const next = bd.map(row => [...row]);
            next[m.row][m.col] = p;
            next[r][c] = null;
            if (m.enPassant) next[r][m.col] = null;
            return !isKingInCheck(W ? 'white' : 'black', next);
        });
    }
    return mvs;
}

function resetGame() {
    initGame();
}
initGame();