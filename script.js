const correctOrder = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

document.querySelector(".sort-wrapper").style.gridTemplateColumns = `repeat(${correctOrder.length}, 1fr)`;

correctOrder.forEach(el => {
  const col = document.createElement("div");
  col.classList.add("column");
  document.querySelector(".sort-wrapper").insertAdjacentElement("beforeend", col);
});

const columnsElements = document.querySelectorAll(".column");

class Column {
  constructor(element, weight, text) {
    this.weight = weight;
    this.element = element;
    this.text = text;
  }

  updateHTML(i) {
    this.element.textContent = this.text;
    this.element.style.height = this.weight * 100 + "%";
    this.element.style.order = i;
    this.element.dataset.col = Math.round(this.weight / (1 / columnsElements.length));
  }
}

class Columns {
  constructor() {
    this.content = [];
    this.interval = 250;
  }

  append(col) {
    this.content.push(col);
  }

  updateHTML() {
    this.content.forEach((col, i) => {
      col.updateHTML(i);
    });
  }

  shuffle() {
    let ids = this.content.map((c, i) => i);
    this.content = this.content.map((col, i) => {
      const idsi = Math.floor(Math.random() * ids.length);
      const newCol = this.content[ids[idsi]];
      ids.splice(idsi, 1);
      return newCol;
    });
    columns.updateHTML();
  }

  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async _sortOnce() {
    for (let i = 0; i < this.content.length; i++) {
      if (this.content[i + 1] === undefined) return;

      const col = this.content[i];
      const nextEl = this.content[i + 1];

      col.element.style.backgroundColor = "#b5e4f3";
      nextEl.element.style.backgroundColor = "#b5e4f3";

      await this._sleep(this.interval / 2);

      if (col.weight > this.content[i + 1].weight) {
        this.content[i + 1] = col;
        this.content[i] = nextEl;

        nextEl.element.style.transition = "transform 120ms ease-in-out";
        col.element.style.transition = "transform 120ms ease-in-out";

        nextEl.element.style.transform = "translateX(calc(-100% - 16px))";
        col.element.style.transform = "translateX(calc(100% + 16px))";
      }

      await this._sleep(this.interval / 2);

      nextEl.element.style.transition = "";
      col.element.style.transition = "";

      nextEl.element.style.transform = "";
      col.element.style.transform = "";

      col.element.style.backgroundColor = "";
      nextEl.element.style.backgroundColor = "";

      this.updateHTML();
    }
  }

  async sort() {
    let sorted = false;
    while (!sorted) {
      sorted = true;
      this.content.forEach((col, i) => {
        if (this.content[i + 1] === undefined) return;
        if (col.weight > this.content[i + 1].weight) {
          sorted = false;
        }
      });

      await this._sortOnce();
    }
  }
}

const columns = new Columns();
columnsElements.forEach((column, i) =>
  columns.append(new Column(column, (i + 1) / columnsElements.length, correctOrder[i]))
);
columns.shuffle();

const btn = document.querySelector(".start-btn");

function shuffleListener() {
  columns.shuffle();
  btn.removeEventListener("click", shuffleListener);
  btn.addEventListener("click", sortListener);
  btn.textContent = "Start";
}

function sortListener() {
  columns.sort().then(() => {
    btn.classList.remove("disabled");
    btn.textContent = "Shuffle";
    btn.removeEventListener("click", sortListener);
    btn.addEventListener("click", shuffleListener);
  });
  btn.classList.add("disabled");
}

btn.addEventListener("click", sortListener);

document.querySelector('#time-range').addEventListener('change', e => {
  columns.interval = e.target.value;
  document.querySelector('label[for="time-range"]').textContent = `Duration (${e.target.value}ms)`;
})
