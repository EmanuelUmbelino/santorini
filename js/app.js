function inputImage() {
  const file = document.querySelector('#uploadImage').files[0];
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = function () {
    localStorage.setItem("image", reader.result);
    imagePreview.setAttribute("src", localStorage.getItem("image"))
    resetPanel();
  };
}

function createGrid() {
  const iGrid = document.getElementById("grid");

  grid = [];

  for(let i = 0; i < 5; i++) {
    grid.push([]);
    for (let j = 0; j < 5; j++) {
      grid[i].push([0,'N']);
      const iSquare = document.createElement("div");
      iSquare.className = "border square";
      const floor = document.createElement("div");
      floor.innerHTML = '0';
      iSquare.appendChild(floor);
      const player = document.createElement("div");
      player.innerHTML = 'N';
      iSquare.appendChild(player);

      floor.addEventListener("click", function () {
        const idx = floors.indexOf(grid[i][j][0]);
        floor.innerHTML = grid[i][j][0] = floors[(idx+1) % floors.length];
        generateJson();
      });
      player.addEventListener("click", function () {
        const idx = players.indexOf(player.innerHTML);
        player.innerHTML = grid[i][j][1] = players[(idx+1) % players.length];
        generateJson();
      });
      iGrid.appendChild(iSquare);
    }
  }
}

function resetPanel() {
  panel.style.width = '90%';
  panel.style.height = '90%';
  panel.style.top = '5%';
  panel.style.left = '5%';
  setTimeout(() => {

  panel_width = toInt(getComputedStyle(panel).width);
  panel_height = toInt(getComputedStyle(panel).height);
  panel_top = toInt(getComputedStyle(panel).top);
  panel_left = toInt(getComputedStyle(panel).left);

    const imageStl = getComputedStyle(imagePreview);

    img_w = toInt(imageStl.width);
    img_h = toInt(imageStl.height);

    updatePanel();
  }, 10);
}

function updatePanel() {
  panel.style.width = panel_width + 'px';
  panel.style.height = panel_height + 'px';
  panel.style.top = panel_top + 'px';
  panel.style.left = panel_left + 'px';

  setTimeout(() => {
    generateJson();
  }, 10)
}

function resize(e){
  const dx = e.x - x_pos;
  const dy = e.y - y_pos;
  let top = panel_top, left = panel_left, width = panel_width, height = panel_height;
  x_pos = e.x; y_pos = e.y;
  if (currEditing.includes('left')) {
    left += dx;
    width -= dx;
  }
  if (currEditing.includes('right')) {
    width += dx;
  }
  if (currEditing.includes('top')) {
    top += dy
    height -= dy;
  }
  if (currEditing.includes('bottom')) {
    height += dy;
  }
  if (currEditing.includes('move')) {
    top += dy
    left += dx;
  }
  panel_top = top < 0 ? 0 : top + panel_height > img_h ? img_h - panel_height : top;
  panel_left = left < 0 ? 0 : left + panel_width > img_w ? img_w - panel_width : left;
  panel_height = height < 50 ? 50 : panel_top + height > img_h ? panel_height : height;
  panel_width = width < 50 ? 50 : panel_left + width > img_w ? panel_width : width;

  updatePanel();
}

function startResize(e, edit){
  document.addEventListener("mousemove", resize, false);
  currEditing = edit;
  x_pos = e.x;
  y_pos = e.y;
}

function generateJson() {
  jsonPanel.innerHTML = "";

  jsonPanel.appendChild(createCodeLine("{", 0));
  jsonPanel.appendChild(createKeyOpen("resized", "{", 1, false));
  jsonPanel.appendChild(createKeyValue({key: "width", value: img_w, ident: 2}));
  jsonPanel.appendChild(createKeyValue({key: "height", value: img_h, ident: 2, last: true}));
  jsonPanel.appendChild(createCodeLine("},", 1));
  jsonPanel.appendChild(createKeyOpen("grid", "{", 1, false));
  jsonPanel.appendChild(createKeyValue({key: "top", value: panel_top, ident: 2}));
  jsonPanel.appendChild(createKeyValue({key: "left", value: panel_left, ident: 2}));
  jsonPanel.appendChild(createKeyValue({key: "width", value: panel_width, ident: 2}));
  jsonPanel.appendChild(createKeyValue({key: "height", value: panel_height, ident: 2, last: true}));
  jsonPanel.appendChild(createCodeLine("},", 1));
  jsonPanel.appendChild(createKeyOpen("classification", "[", 1, false));
  for (let i = 0; i < grid.length; i++) {
    const el = document.createElement("li");
    el.appendChild(createIdent(2));
    el.appendChild(createSpan({value: '[ ', quoted: false}));
    for (let j = 0; j < grid[i].length; j++) {
      el.appendChild(createSpan({value: grid[i][j][0]+grid[i][j][1], color: 't-string'}));
      if (j < grid[i].length -1) el.appendChild(createSpan({value: ',', quoted: false}));
    }
    if (i < grid.length - 1) {
      el.appendChild(createSpan({value: ' ],', quoted: false}));
    } else {
      el.appendChild(createSpan({value: ' ]', quoted: false}));
    }
    jsonPanel.appendChild(el);
  }
  jsonPanel.appendChild(createCodeLine("]", 1));
  jsonPanel.appendChild(createCodeLine("}", 0));
}

function createCodeLine(text, ident) {
  const line = document.createElement("li");
  line.innerHTML = '&nbsp;'.repeat(ident*4) + text;

  return line;
}
function createIdent(ident) {
  const el = document.createElement("span");
  el.innerHTML = "&nbsp;".repeat(ident*4);
  return el;
}
function createSpan({value, color, quoted = true}) {
  const el = document.createElement("span");
  el.innerHTML = quoted ? `"${value}"` : value;
  if (color) {
    el.className = color;
  }
  return el;
}
function createKeyOpen(key, value, ident) {
  const el = document.createElement("li");
  el.appendChild(createIdent(ident));
  el.appendChild(createSpan({value: key, color: 't-key'}));
  el.appendChild(createSpan({value: ':&nbsp;', quoted: false}));
  el.appendChild(createSpan({value, quoted: false}));
  return el;
}
function createKeyValue({key, value, ident, quoted = false, last = false}) {
  const el = document.createElement("li");
  el.appendChild(createIdent(ident));
  el.appendChild(createSpan({value: key, color: 't-key'}));
  el.appendChild(createSpan({value: ':&nbsp;', quoted: false}));
  el.appendChild(createSpan({value, color: quoted ? 't-string' : 't-value', quoted}));
  if (!last) {
    el.appendChild(createSpan({value: ',', quoted: false}));
  }
  return el;
}

function toInt(value) {
  return parseInt(value, 10);
}

function copyToClipboard() {
  navigator.clipboard.writeText(jsonPanel.innerText);
  alert("Copied the Json!");
}

const panel = document.getElementById("grid_panel");
const imagePreview = document.getElementById("imagePreview");
const jsonPanel = document.getElementById("json");

let x_pos, y_pos, img_w, img_h;
let panel_width = 100, panel_height = 100;
let panel_top = 50, panel_left = 50;
let currEditing = 'left';
let grid = [];

const floors = [0,1,2,3,4];
const players = ['N', 'A', 'C'];

document.addEventListener("mouseup", function(){
  document.removeEventListener("mousemove", resize, false);
}, false);

if(localStorage.getItem("image")) {
  imagePreview.setAttribute("src", localStorage.getItem("image"))
}

createGrid();
resetPanel();

