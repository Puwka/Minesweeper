// 9x9 field, 10 mines;

export default class Minesweeper {
  constructor({ mines, x, y }) {
    this.mines = mines;
    this.x = x;
    this.y = y
    this.container = document.querySelector('.container');
    this.gameStarted = false;
    this.renderField();
    this.minesCoords = []
  }

  renderField() {
    let row = 1;
    let rowCount = 1;
    while (row <= this.y) {
      while (rowCount <= this.x) {
        const cell = document.createElement('div');
        cell.classList.add('cell');

        cell.addEventListener('click', this.handleCellClick.bind(this))
        document.addEventListener('contextmenu', this.handleRightClick.bind(this))
        cell.dataset.x = String(rowCount - 1);
        cell.dataset.y = String(row - 1);

        this.container.append(cell)

        if (rowCount >= this.x) {
          row += 1;
        }
        rowCount += 1;
      }
      rowCount = 1;
    }
  }

  makeMap() {
    this.map = [];
    let row = 1;

    while (row <= this.x) {
      const arr = Array.from({length: 9}).fill('')
      this.map.push(arr)
      row += 1;
    }
  }

  fillMap({ x, y }) {
    const min = 0;
    const max = 8;
    let filled = 0;

    while (filled < this.mines) {
      let xCoord = Math.floor(min + Math.random() * (max - min + 1));
      let yCoord = Math.floor(min + Math.random() * (max - min + 1));

      if (xCoord === x && yCoord === y) {
        continue;
      }

      if (this.map[yCoord][xCoord] !== '*') {
        this.map[yCoord][xCoord] = '*';
        this.minesCoords.push({x: xCoord, y: yCoord});
        filled += 1;
      }
    }

    // к этому моменту у нас есть матрица 9х9, заполненная минами

    this.map.forEach((value, yIndex) => {
      this.map[yIndex].forEach((value, xIndex) => {
        this.checkSurroundingCells(xIndex, yIndex)
      })
    })

  }

  checkSurroundingCells(x, y) {
    if (this.map[y][x] === '*') {
      return;
    }

    const leftTop = this.map[y - 1] && this.map[y - 1][x - 1];
    const top = this.map[y - 1] && this.map[y - 1][x];
    const rightTop = this.map[y - 1] && this.map[y - 1][x + 1];
    const left = this.map[y] && this.map[y][x - 1];
    const right = this.map[y] && this.map[y][x + 1];
    const bottomLeft = this.map[y + 1] && this.map[y + 1][x - 1];
    const bottom = this.map[y + 1] && this.map[y + 1][x];
    const bottomRight = this.map[y + 1] && this.map[y + 1][x + 1];

    const arrayOfSurroundingCells = [
      leftTop,
      top,
      rightTop,
      left,
      right,
      bottomLeft,
      bottom,
      bottomRight
    ]

    this.map[y][x] = arrayOfSurroundingCells.filter(cell => cell === '*').length

  }

  fillField() {
    // for (let i = 0; i < this.x; i++) {
    //   for (let j = 0; j < this.y; j++) {
    //     const cells = document.querySelectorAll('div.cell');
    //     const cell = [].filter.call(cells, (cell =>
    //       Number(cell.dataset.x) === i && Number(cell.dataset.y) === j
    //     ))
    //     cell[0].innerHTML = this.map[i][j]
    //   }
    // }
  }

  handleCellClick(event) {
    if (!this.gameStarted) {
      this.startGame(event.target)
    }

    const x = event.target.dataset.x;
    const y = event.target.dataset.y;

    this.revealCell({
      x,
      y,
      clicked: true
    });
  }

  handleRightClick(event) {
    if (event.handled) {
      return;
    }
    event.handled = true;

    event.preventDefault();
    event.stopPropagation();
    const targetCell = this.locateCell({
      x: event.target.dataset.x,
      y: event.target.dataset.y
    });

    targetCell.classList.toggle('revealed');
    targetCell.classList.toggle('flag');

    if (targetCell.innerHTML === 'T') {
      targetCell.innerHTML = '';
      targetCell.revealed = false;
      return;
    }
    targetCell.innerHTML = 'T'
    targetCell.revealed = true;

    this.checkFlags();

  }

  checkFlags() {
    const cells = document.querySelectorAll('div.cell');
    const cellsWithFlags = [].filter.call(cells, cell => cell.innerHTML === 'T')

    if (cellsWithFlags.length !== this.mines) {
      return;
    }

    const flagsCoords = cellsWithFlags.map(cell => ({
      x: Number(cell.dataset.x),
      y: Number(cell.dataset.y),
    }))

    const match = flagsCoords.filter(coords => !this.minesCoords.some(_coords => _coords.x === coords.x && _coords.y === coords.y))
    if (!match.length) {
      alert('You win!');
      this.stopGame();
    }

  }

  revealCell({ x, y, clicked }) {
    if (!this.gameStarted) {
      return;
    }

    const targetCell = this.locateCell({ x, y });

    if (targetCell.revealed || (this.map[y][x] === '*' && !clicked)) {
      return;
    }

    targetCell.innerHTML = this.extractFromMap(x, y);
    targetCell.classList.add('revealed');
    targetCell.revealed = true;

    if (this.map[y][x] === '*') {
      this.minesCoords.forEach(coords => {
        const cell = this.locateCell(coords);
        cell.innerHTML = '*'
        cell.classList.add('revealed')
        cell.classList.add('bomb')
      })
      setTimeout(() => {
        alert('Game Over');
        this.stopGame()
      }, 10000)

    }

    if (this.map[y][x] !== 0 && !clicked) {
      return;
    }

    const surroundingCells = this.locateSurroundingCells({x, y})

    surroundingCells.filter(Boolean).forEach(cell => {
      this.revealCell({
        x: cell.dataset.x,
        y: cell.dataset.y
      })
    })
  }

  locateCell({ x, y }) {
    const cells = document.querySelectorAll('div.cell');

    return [].find.call(cells, (cell =>
        Number(cell.dataset.x) === Number(x) && Number(cell.dataset.y) === Number(y)
    ));
  }

  locateSurroundingCells({x, y}) {
    x = Number(x);
    y = Number(y);
    const leftTop = this.locateCell({x: x - 1, y: y - 1});
    const top = this.locateCell({x: x, y: y - 1});
    const rightTop = this.locateCell({x: x + 1, y: y - 1});
    const left = this.locateCell({x: x - 1, y});
    const right = this.locateCell({x: x + 1, y: y});
    const bottomLeft = this.locateCell({x: x - 1, y: y + 1});
    const bottom = this.locateCell({x, y: y + 1});
    const bottomRight = this.locateCell({x: x + 1, y: y + 1});

    return [
      leftTop,
      top,
      rightTop,
      left,
      right,
      bottomLeft,
      bottom,
      bottomRight
    ]
  }

  extractFromMap(x, y) {
    return this.map[y][x] || ''
  }

  startGame(clickedCell) {
    this.makeMap();

    this.fillMap({
      x: Number(clickedCell.dataset.x),
      y: Number(clickedCell.dataset.y)
    });

    this.fillField();
    this.gameStarted = true;
  }

  stopGame() {
    this.gameStarted = false;
    this.map = [];
    this.destroyField();
    this.renderField();
  }

  destroyField() {
    while (this.container.firstChild) {
      this.container.removeChild(this.container.firstChild);
    }
  }
}
