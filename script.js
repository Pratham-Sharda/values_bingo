class AtlassianBingo {
    constructor() {
        this.grid = Array(5).fill().map(() => Array(5).fill(false));
        this.winningCombinations = [];
        this.gameWon = false;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadGameState();
    }

    bindEvents() {
        // Add click event to all bingo cells
        document.querySelectorAll('.bingo-cell').forEach(cell => {
            cell.addEventListener('click', (e) => this.handleCellClick(e));
        });

        // Reset button
        document.getElementById('resetButton').addEventListener('click', () => this.resetGame());
    }

    handleCellClick(event) {
        const cell = event.currentTarget;
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);

        // Toggle cell state
        this.grid[row][col] = !this.grid[row][col];
        
        // Update visual state
        if (this.grid[row][col]) {
            cell.classList.add('checked');
        } else {
            cell.classList.remove('checked');
        }

        // Save game state
        this.saveGameState();

        // Check for wins
        this.checkForWins();
    }

    checkForWins() {
        this.clearWinningHighlights();
        this.winningCombinations = [];

        // Check rows
        for (let row = 0; row < 5; row++) {
            if (this.grid[row].every(cell => cell)) {
                this.winningCombinations.push({
                    type: 'row',
                    index: row,
                    cells: Array.from({length: 5}, (_, col) => ({row, col}))
                });
            }
        }

        // Check columns
        for (let col = 0; col < 5; col++) {
            if (this.grid.every(row => row[col])) {
                this.winningCombinations.push({
                    type: 'column',
                    index: col,
                    cells: Array.from({length: 5}, (_, row) => ({row, col}))
                });
            }
        }

        // Check diagonal (top-left to bottom-right)
        if (this.grid.every((row, index) => row[index])) {
            this.winningCombinations.push({
                type: 'diagonal',
                index: 0,
                cells: Array.from({length: 5}, (_, i) => ({row: i, col: i}))
            });
        }

        // Check diagonal (top-right to bottom-left)
        if (this.grid.every((row, index) => row[4 - index])) {
            this.winningCombinations.push({
                type: 'diagonal',
                index: 1,
                cells: Array.from({length: 5}, (_, i) => ({row: i, col: 4 - i}))
            });
        }

        // Check full card
        const allChecked = this.grid.every(row => row.every(cell => cell));
        if (allChecked) {
            this.winningCombinations.push({
                type: 'fullcard',
                cells: Array.from({length: 5}, (_, row) => 
                    Array.from({length: 5}, (_, col) => ({row, col}))
                ).flat()
            });
        }

        // Update display
        this.updateWinDisplay();
        this.highlightWinningCells();
    }

    updateWinDisplay() {
        const winMessage = document.getElementById('winMessage');
        
        if (this.winningCombinations.length === 0) {
            winMessage.textContent = '';
            winMessage.classList.remove('show');
            this.gameWon = false;
            return;
        }

        this.gameWon = true;
        let message = '🎉 BINGO! ';

        if (this.winningCombinations.some(combo => combo.type === 'fullcard')) {
            message += 'FULL CARD COMPLETE! 🏆';
        } else {
            const types = this.winningCombinations.map(combo => {
                switch(combo.type) {
                    case 'row': return `Row ${combo.index + 1}`;
                    case 'column': return `Column ${combo.index + 1}`;
                    case 'diagonal': return combo.index === 0 ? 'Main Diagonal' : 'Anti Diagonal';
                    default: return '';
                }
            });
            message += types.join(', ') + ' Complete!';
        }

        winMessage.textContent = message;
        winMessage.classList.add('show');

        // Play celebration animation
        this.celebrateWin();
    }

    highlightWinningCells() {
        this.winningCombinations.forEach(combo => {
            combo.cells.forEach(({row, col}) => {
                const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                if (cell) {
                    cell.classList.add('winning-line');
                }
            });
        });
    }

    clearWinningHighlights() {
        document.querySelectorAll('.winning-line').forEach(cell => {
            cell.classList.remove('winning-line');
        });
    }

    celebrateWin() {
        // Add some confetti effect or celebration animation
        document.body.style.animation = 'none';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 100);
    }

    resetGame() {
        // Clear grid state
        this.grid = Array(5).fill().map(() => Array(5).fill(false));
        this.winningCombinations = [];
        this.gameWon = false;

        // Clear visual state
        document.querySelectorAll('.bingo-cell').forEach(cell => {
            cell.classList.remove('checked', 'winning-line');
        });

        // Clear win message
        const winMessage = document.getElementById('winMessage');
        winMessage.textContent = '';
        winMessage.classList.remove('show');

        // Clear saved state
        localStorage.removeItem('atlassianBingoState');
    }

    saveGameState() {
        const gameState = {
            grid: this.grid,
            timestamp: Date.now()
        };
        localStorage.setItem('atlassianBingoState', JSON.stringify(gameState));
    }

    loadGameState() {
        const savedState = localStorage.getItem('atlassianBingoState');
        if (!savedState) return;

        try {
            const gameState = JSON.parse(savedState);
            this.grid = gameState.grid;

            // Restore visual state
            document.querySelectorAll('.bingo-cell').forEach(cell => {
                const row = parseInt(cell.dataset.row);
                const col = parseInt(cell.dataset.col);
                
                if (this.grid[row][col]) {
                    cell.classList.add('checked');
                }
            });

            // Check for wins with loaded state
            this.checkForWins();
        } catch (error) {
            console.error('Error loading game state:', error);
            localStorage.removeItem('atlassianBingoState');
        }
    }

    // Utility method to get completion statistics
    getStats() {
        const totalCells = 25;
        const checkedCells = this.grid.flat().filter(cell => cell).length;
        const completionPercentage = Math.round((checkedCells / totalCells) * 100);

        return {
            totalCells,
            checkedCells,
            completionPercentage,
            winningCombinations: this.winningCombinations.length,
            gameWon: this.gameWon
        };
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.bingoGame = new AtlassianBingo();
    
    // Add some helpful console messages
    console.log('🎯 Atlassian Values Bingo loaded!');
    console.log('Click on cells to mark your experiences.');
    console.log('Complete rows, columns, diagonals, or the full card to win!');
});

// Add keyboard support for accessibility
document.addEventListener('keydown', (event) => {
    if (event.key === 'r' && event.ctrlKey) {
        event.preventDefault();
        window.bingoGame.resetGame();
    }
});

// Add some fun easter eggs
let clickCount = 0;
document.addEventListener('click', () => {
    clickCount++;
    if (clickCount === 50) {
        console.log('🎉 Wow, you\'re really into this bingo game!');
    } else if (clickCount === 100) {
        console.log('🏆 Bingo master level achieved!');
    }
});
