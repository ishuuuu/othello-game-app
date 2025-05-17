document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('board');
    const resetButton = document.getElementById('reset-button');
    const passButton = document.getElementById('pass-button');
    const messageEl = document.getElementById('message');
    const blackCountEl = document.getElementById('black-count');
    const whiteCountEl = document.getElementById('white-count');
    const turnTextEl = document.getElementById('turn-text');
    
    // ゲームの状態を保持する
    const gameState = {
        board: [],
        currentPlayer: 1, // 1: 黒, 2: 白
        gameOver: false
    };
    
    // 方向ベクトル（8方向）
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1]
    ];
    
    // 初期化関数
    function initGame() {
        // ボードの状態を初期化
        gameState.board = Array(8).fill().map(() => Array(8).fill(0));
        gameState.currentPlayer = 1;
        gameState.gameOver = false;
        
        // 初期配置
        gameState.board[3][3] = 2;
        gameState.board[3][4] = 1;
        gameState.board[4][3] = 1;
        gameState.board[4][4] = 2;
        
        // ボードをクリアして再描画
        while (board.firstChild) {
            board.removeChild(board.firstChild);
        }
        
        // セルを作成
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                // クリックイベントを追加
                cell.addEventListener('click', () => handleCellClick(row, col));
                
                board.appendChild(cell);
            }
        }
        
        // ゲーム状態を更新
        updateBoard();
        updateGameInfo();
        
        // 合法手をハイライト
        highlightValidMoves();
        
        // メッセージをクリア
        messageEl.textContent = '';
    }
    
    // ボードの状態を更新する関数
    function updateBoard() {
        const cells = document.querySelectorAll('.cell');
        
        cells.forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            
            // 既存の石を削除
            while (cell.firstChild) {
                cell.removeChild(cell.firstChild);
            }
            
            // 石を配置
            if (gameState.board[row][col] !== 0) {
                const disc = document.createElement('div');
                disc.className = `disc ${gameState.board[row][col] === 1 ? 'black' : 'white'}`;
                cell.appendChild(disc);
            }
        });
    }
    
    // セルクリック時の処理
    function handleCellClick(row, col) {
        // ゲームが終了している場合や既に石がある場合は何もしない
        if (gameState.gameOver || gameState.board[row][col] !== 0) {
            return;
        }
        
        // 指定された位置に石を置けるか確認
        const flips = getFlips(row, col, gameState.currentPlayer);
        
        // 石を置けない場合は何もしない
        if (flips.length === 0) {
            return;
        }
        
        // 石を置く
        gameState.board[row][col] = gameState.currentPlayer;
        
        // 挟んだ石をひっくり返す（アニメーション付き）
        flipDiscs(flips);
        
        // プレイヤーを交代
        gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
        
        // ゲーム情報を更新
        updateGameInfo();
        
        // パスが必要か確認
        checkPass();
        
        // ゲーム終了チェック
        checkGameOver();
    }
    
    // 挟んだ石をひっくり返す関数
    function flipDiscs(flips) {
        flips.forEach(([row, col]) => {
            gameState.board[row][col] = gameState.currentPlayer;
            
            // アニメーション用にフリップクラスを追加
            const cells = document.querySelectorAll('.cell');
            const index = row * 8 + col;
            const cell = cells[index];
            
            // 既存の石を削除
            while (cell.firstChild) {
                cell.removeChild(cell.firstChild);
            }
            
            // 新しい石を追加
            const disc = document.createElement('div');
            disc.className = `disc ${gameState.currentPlayer === 1 ? 'black' : 'white'} flipping`;
            cell.appendChild(disc);
        });
        
        // アニメーション後にボードを更新
        setTimeout(() => {
            updateBoard();
            // 合法手をハイライト
            highlightValidMoves();
        }, 500);
    }
    
    // 指定位置に石を置いた時にひっくり返せる石の座標を取得
    function getFlips(row, col, player) {
        if (gameState.board[row][col] !== 0) {
            return [];
        }
        
        const opponent = player === 1 ? 2 : 1;
        const flips = [];
        
        // 8方向をチェック
        for (const [dRow, dCol] of directions) {
            let r = row + dRow;
            let c = col + dCol;
            const temp = [];
            
            // ボード内にあり、相手の石がある間ループ
            while (r >= 0 && r < 8 && c >= 0 && c < 8 && gameState.board[r][c] === opponent) {
                temp.push([r, c]);
                r += dRow;
                c += dCol;
            }
            
            // 自分の石で挟めるかチェック
            if (temp.length > 0 && r >= 0 && r < 8 && c >= 0 && c < 8 && gameState.board[r][c] === player) {
                flips.push(...temp);
            }
        }
        
        return flips;
    }
    
    // 合法手をハイライトする関数
    function highlightValidMoves() {
        const cells = document.querySelectorAll('.cell');
        
        // ハイライトをリセット
        cells.forEach(cell => {
            cell.classList.remove('valid');
        });
        
        // ゲームが終了している場合はハイライトしない
        if (gameState.gameOver) {
            return;
        }
        
        // 全てのセルをチェック
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                // 石を置けるかチェック
                const flips = getFlips(row, col, gameState.currentPlayer);
                
                if (flips.length > 0) {
                    const index = row * 8 + col;
                    cells[index].classList.add('valid');
                }
            }
        }
    }
    
    // パスが必要か確認する関数
    function checkPass() {
        // 現在のプレイヤーが石を置ける場所があるか確認
        let canPlay = false;
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (getFlips(row, col, gameState.currentPlayer).length > 0) {
                    canPlay = true;
                    break;
                }
            }
            if (canPlay) break;
        }
        
        // 石を置ける場所がない場合
        if (!canPlay) {
            // 相手プレイヤーも石を置けるか確認
            const opponent = gameState.currentPlayer === 1 ? 2 : 1;
            let opponentCanPlay = false;
            
            for (let row = 0; row < 8; row++) {
                for (let col = 0; col < 8; col++) {
                    if (getFlips(row, col, opponent).length > 0) {
                        opponentCanPlay = true;
                        break;
                    }
                }
                if (opponentCanPlay) break;
            }
            
            if (opponentCanPlay) {
                // パスが必要
                const currentPlayerName = gameState.currentPlayer === 1 ? '黒' : '白';
                const nextPlayerName = gameState.currentPlayer === 1 ? '白' : '黒';
                
                messageEl.textContent = `${currentPlayerName}の手番をパスします。${nextPlayerName}の番です。`;
                
                // プレイヤーを交代
                gameState.currentPlayer = opponent;
                
                // ゲーム情報を更新
                updateGameInfo();
                
                // 合法手をハイライト
                highlightValidMoves();
            } else {
                // 両プレイヤーとも石を置けない場合はゲーム終了
                gameState.gameOver = true;
                endGame();
            }
        }
        
        // パスボタンの有効/無効を設定
        passButton.disabled = canPlay;
    }
    
    // ゲーム終了チェック
    function checkGameOver() {
        // ボード上の全てのセルが埋まっているか確認
        let isBoardFull = true;
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (gameState.board[row][col] === 0) {
                    isBoardFull = false;
                    break;
                }
            }
            if (!isBoardFull) break;
        }
        
        // ボードが全て埋まっている場合はゲーム終了
        if (isBoardFull) {
            gameState.gameOver = true;
            endGame();
        }
    }
    
    // ゲーム終了時の処理
    function endGame() {
        // 石の数をカウント
        const counts = countDiscs();
        
        // 勝敗を判定
        let message;
        if (counts.black > counts.white) {
            message = `ゲーム終了！ 黒の勝ちです！ (黒: ${counts.black}, 白: ${counts.white})`;
        } else if (counts.white > counts.black) {
            message = `ゲーム終了！ 白の勝ちです！ (黒: ${counts.black}, 白: ${counts.white})`;
        } else {
            message = `ゲーム終了！ 引き分けです！ (黒: ${counts.black}, 白: ${counts.white})`;
        }
        
        messageEl.textContent = message;
        
        // パスボタンを無効化
        passButton.disabled = true;
    }
    
    // 石の数をカウントする関数
    function countDiscs() {
        let black = 0;
        let white = 0;
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (gameState.board[row][col] === 1) {
                    black++;
                } else if (gameState.board[row][col] === 2) {
                    white++;
                }
            }
        }
        
        return { black, white };
    }
    
    // ゲーム情報を更新する関数
    function updateGameInfo() {
        // 石の数をカウント
        const counts = countDiscs();
        
        // 石の数を表示
        blackCountEl.textContent = counts.black;
        whiteCountEl.textContent = counts.white;
        
        // 手番を表示
        const currentPlayerName = gameState.currentPlayer === 1 ? '黒' : '白';
        turnTextEl.textContent = `${currentPlayerName}の番です`;
    }
    
    // リセットボタンのイベントハンドラ
    resetButton.addEventListener('click', () => {
        initGame();
    });
    
    // パスボタンのイベントハンドラ
    passButton.addEventListener('click', () => {
        // 現在のプレイヤーが石を置ける場所があるか確認
        let canPlay = false;
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (getFlips(row, col, gameState.currentPlayer).length > 0) {
                    canPlay = true;
                    break;
                }
            }
            if (canPlay) break;
        }
        
        // 石を置ける場所がある場合はパスできない
        if (canPlay) {
            return;
        }
        
        const currentPlayerName = gameState.currentPlayer === 1 ? '黒' : '白';
        const nextPlayerName = gameState.currentPlayer === 1 ? '白' : '黒';
        
        messageEl.textContent = `${currentPlayerName}の手番をパスします。${nextPlayerName}の番です。`;
        
        // プレイヤーを交代
        gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
        
        // ゲーム情報を更新
        updateGameInfo();
        
        // 合法手をハイライト
        highlightValidMoves();
        
        // パスボタンの有効/無効を設定
        checkPass();
    });
    
    // ゲーム初期化
    initGame();
});