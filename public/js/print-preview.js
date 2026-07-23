/**
 * =====================================================
 * PRINT PREVIEW ENGINE
 * =====================================================
 */

const PrintPreview = {

    init() {
        this.workspace = document.querySelector(".j-print-workspace");
        if (!this.workspace) return;
        this.render();
        
        // Escuchar cambios en JuguemosState
        this.setupStateListener();
    },

    setupStateListener() {
        // Guardar referencia al estado anterior para detectar cambios
        this.lastState = JSON.stringify({
            quantity: JuguemosState.quantity,
            pages: JuguemosState.pages,
            grid: JuguemosState.grid,
            paper: JuguemosState.paper,
            orientation: JuguemosState.orientation,
            fondoColor: JuguemosState.fondoColor,
            marcoColor: JuguemosState.marcoColor
        });

        // Actualizar cada vez que cambien los controles relevantes
        const controls = [
            '#tables-range',
            '#tables-number',
            '#j-tables-per-page',
            '#j-pages',
            '.j-grid',
            '.j-orientation',
            '#j-paper-size',
            '.j-fondo-card',
            '.j-color-swatch'
        ];

        controls.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                el.addEventListener('change', () => this.scheduleRefresh());
                el.addEventListener('input', () => this.scheduleRefresh());
                el.addEventListener('click', () => this.scheduleRefresh());
            });
        });
    },

    scheduleRefresh() {
        // Debounce para evitar múltiples renders
        clearTimeout(this.refreshTimeout);
        this.refreshTimeout = setTimeout(() => {
            this.refresh();
        }, 100);
    },

    render() {
        if (!this.workspace) return;

        this.workspace.innerHTML = "";
    
        const totalPages = Number(JuguemosState.pages) || 1;
    
        for (let i = 0; i < totalPages; i++) {
            const sheet = this.createSheet(i);
            this.workspace.appendChild(sheet);
        }
    },

    createSheet(page) {
        const sheet = document.createElement("div");
        sheet.className = "j-print-sheet";
        sheet.dataset.paper = JuguemosState.paper;
        sheet.dataset.orientation = JuguemosState.orientation;

        // Aplicar colores
        sheet.style.setProperty('--j-marco-color', JuguemosState.marcoColor || '#FA299C');
        sheet.style.setProperty('--j-fondo-color', JuguemosState.fondoColor || '#FFFFFF');

        const margin = document.createElement("div");
        margin.className = "j-print-margin";

        // Marcas de corte
        const cropMarks = document.createElement("div");
        cropMarks.className = "j-print-cropmarks";
        cropMarks.style.display = JuguemosState.cutMarks ? '' : 'none';

        const grid = document.createElement("div");
        grid.className = "j-print-grid";

        margin.appendChild(cropMarks);
        margin.appendChild(grid);
        sheet.appendChild(margin);

        this.renderBoards(grid, page);

        return sheet;
    },

    renderBoards(grid, page) {
        grid.innerHTML = "";
    
        const totalBoards = Number(JuguemosState.quantity) || 1;
    
        for (let i = 0; i < totalBoards; i++) {
            grid.appendChild(this.createBoard(i, page));
        }
    },

    createBoard(index, page) {
        const board = document.createElement("div");
        board.className = "j-print-board";
        board.dataset.page = page + 1;
        board.dataset.board = index + 1;
        board.appendChild(this.createBoardGrid());
        return board;
    },

    createBoardGrid() {
        const grid = document.createElement("div");
        grid.className = "j-board-grid";

        const gridConfig = {
            "4x4": { totalCells: 16, columns: 4 },
            "5x5": { totalCells: 25, columns: 5 },
            "pocitos4": { totalCells: 16, columns: 4 },
            "pocitos3": { totalCells: 9, columns: 3 },
            "cruzadas": { totalCells: 16, columns: 4 }
        };

        const config = gridConfig[JuguemosState.grid] || gridConfig["4x4"];
        
        grid.dataset.grid = JuguemosState.grid;

        // Si hay casillas asignadas, mostrarlas
        const casillas = JuguemosState.casillasAsignadas || [];
        const totalCells = config.totalCells;

        for (let i = 0; i < totalCells; i++) {
            const cell = document.createElement("div");
            cell.className = "j-board-cell";
            
            // Si hay una baraja asignada para esta celda
            if (casillas[i]) {
                cell.dataset.baraja = casillas[i].nombre;
                const img = document.createElement("img");
                img.src = casillas[i].imagen;
                img.alt = casillas[i].nombre;
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'contain';
                cell.appendChild(img);
            }
            
            grid.appendChild(cell);
        }

        return grid;
    },

    refresh() {
        // Verificar si realmente cambió algo
        const currentState = JSON.stringify({
            quantity: JuguemosState.quantity,
            pages: JuguemosState.pages,
            grid: JuguemosState.grid,
            paper: JuguemosState.paper,
            orientation: JuguemosState.orientation,
            fondoColor: JuguemosState.fondoColor,
            marcoColor: JuguemosState.marcoColor,
            casillasAsignadas: JuguemosState.casillasAsignadas?.length || 0
        });

        if (currentState !== this.lastState) {
            this.lastState = currentState;
            this.render();
        }
    }
};

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PrintPreview.init());
} else {
    PrintPreview.init();
}