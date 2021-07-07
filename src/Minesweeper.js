// 9x9 field, 10 mines;

export default class Minesweeper {
  constructor({ mines, x, y }) {
    this.mines = mines;
    this.x = x;
    this.y = y
    this.container = document.querySelector('.container');
    this.gameStarted = false;
    this.renderField();
  }

  renderField() {
    let row = 1;
    let rowCount = 1;
    while (row <= this.x) {

      while (rowCount <= this.y) {
        const cell = document.createElement('div');
        cell.classList.add('cell');

        cell.addEventListener('click', this.handleCellClick.bind(this))
        cell.dataset.x = String(rowCount - 1);
        cell.dataset.y = String(row - 1);

        this.container.append(cell)

        if (rowCount >= this.y) {
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
    // 0, 0
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
    console.log(x, y, arrayOfSurroundingCells)
    this.map[y][x] = arrayOfSurroundingCells.filter(cell => cell === '*').length

  }

  fillField() {
    for (let i = 0; i < this.x; i++) {
      for (let j = 0; j < this.y; j++) {
        const cells = document.querySelectorAll('div.cell');
        const cell = [].filter.call(cells, (cell =>
          Number(cell.dataset.x) === i && Number(cell.dataset.y) === j
        ))
        cell[0].innerHTML = this.map[i][j]
      }
    }
    console.log(this.map);
  }

  handleCellClick(event) {
    if (!this.gameStarted) {
      this.startGame(event.target)
    }
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
}
