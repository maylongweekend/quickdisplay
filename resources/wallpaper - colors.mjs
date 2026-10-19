//by Mr L 2026
//do what you want with it, just give credit

//for checkboxes
let bRotate = false;
let bHue = false;

//arrays
const colors = [];
const buttons = [];

//get the canvas
const canvas = document.getElementById("back-canvas");
const ctx = canvas.getContext("2d");

//for rotation calc
let x0 = 0;
let y0 = 0;
let x1,y1;
let x2,y2;//opposite points
let angle = 90;
let cangle;
let hyp = Math.min(canvas.height,canvas.width) / 1.4;//diameter of effect

//create the controls inside a draggable div
let outer = CreateNewUI();

//colors boxes section
let list = document.createElement("div");
outer.appendChild(list);
//add a default color to list of colors
addColor();

//click on to add another color
let adder = document.createElement("div");
outer.appendChild(adder);
adder.style.minHeight = "1.6vh";
adder.style.cursor = "copy";
adder.addEventListener('click',addColor);
adder.textContent = "+";

//reset button
let resetbut = document.createElement("button");resetbut.type = "button";resetbut.textContent = "Reset";outer.appendChild(resetbut);
resetbut.addEventListener("click",resetColors);
let br3 = document.createElement("br");outer.appendChild(br3);

//create the buttons for various settings:
//rotate colors button
let rotinput = document.createElement("input");rotinput.type = "checkbox";rotinput.id = "autorot";rotinput.checked = bRotate;outer.appendChild(rotinput);
rotinput.addEventListener("change",watchRotInput);
let rotinlabel = document.createElement("label");rotinlabel.textContent = "Rotate?";rotinlabel.htmlFor = "autorot";outer.appendChild(rotinlabel);
let br1 = document.createElement("br");outer.appendChild(br1);

//change hues button
let hueinput = document.createElement("input");hueinput.type = "checkbox";hueinput.id = "autohue";hueinput.checked = bHue;outer.appendChild(hueinput);
hueinput.addEventListener("change",watchHueInput);
let hueinlabel = document.createElement("label");hueinlabel.textContent = "Cycle?";hueinlabel.htmlFor = "autohue";outer.appendChild(hueinlabel);
let br2 = document.createElement("br");outer.appendChild(br2);

//opacity slider
let opacinput = document.createElement("input");opacinput.type = "range";opacinput.id = "opacity";opacinput.value = "100";opacinput.min = "0";opacinput.max = "100";outer.appendChild(opacinput);
opacinput.addEventListener("change",watchOpacInput);
let opacinlabel = document.createElement("label");opacinlabel.textContent = "Opacity";opacinlabel.htmlFor = "opacity";outer.appendChild(opacinlabel);
let br4 = document.createElement("br");outer.appendChild(br4);

//blend mode dropdown
let blendinput = document.createElement("select");
blendinput.innerHTML = `
<option value="normal">Normal</option>
<option value="multiply">Multiply</option>
<option value="screen">Screen</option>
<option value="overlay">Overlay</option>
<option value="darken">Darken</option>
<option value="lighten">Lighten</option>
<option value="color-dodge">Color dodge</option>
<option value="color-burn">Color burn</option>
<option value="hard-light">Hard light</option>
<option value="soft-light">Soft light</option>
<option value="difference">Difference</option>
<option value="exclusion">Exclusion</option>
<option value="hue">Hue</option>
<option value="saturation">Saturation</option>
<option value="color">Color</option>
<option value="luminosity">Luminosity</option>
`;
outer.appendChild(blendinput);
blendinput.addEventListener("change",watchBlendPicker);

//create the context menu for right click
let panelmenu = CreateDefaultContextMenu(outer);

//starts the animation every frame
animate();

//handles the actual drawing of the colors
function drawBackground() {

    //cycle background hue
    if ( bHue ) {
        for ( let i = 0; i < colors.length; i++ ) {
            colors[i].h = ( colors[i].h + 0.1 )  % 360;
        }
    }

    //cycle angle
    if ( bRotate ) {
        angle = ( angle + 0.2 ) % 360;
    }

    //ANGLE MATH:
    //convert degrees to radians
    cangle = angle / 180 * Math.PI;
    //get coords for gradient drawing
    x1 = Math.cos(cangle) * hyp;
    y1 = Math.sin(cangle) * hyp;
    x2 = x1 * -1;
    y2 = y1 * -1;
    //adjust points as if origin was in middle of screen
    x1 += canvas.width / 2;
    y1 += canvas.height / 2;
    x2 += canvas.width / 2;
    y2 += canvas.height / 2;

    //create the gradient
    const gradient = ctx.createLinearGradient(x1, y1, x2, y2);

    //calculate the colors and add locations
    let iStops = 1 / colors.length;
    let stop = 0;
    for ( let i = 0; i < colors.length; i++ ) {
        if ( i == colors.length - 1 ) {
            stop = 1;
        }
        gradient.addColorStop(stop, `hsl(${colors[i].h}, ${colors[i].s}%, ${colors[i].l}%)`);
        stop += iStops;
    }
    //if only one color
    if ( colors.length == 1 ) {
        gradient.addColorStop(1, `hsl(${colors[0].h}, ${colors[0].s}%, ${colors[0].l}%)`);
    }

    //fill the canvas
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

//adds a color to the array and creates a button for it
function addColor() {
    const color = {};
    //generate a random color
    let letters = "0123456789ABCDEF";
    color.hex = "#";
    for ( let i = 0; i < 6; i++ ) {
        color.hex += letters[(Math.floor(Math.random() * 16))];
    }
    HextoHSL(color);
    colors[colors.length] = color;
    let iButton = buttons.length;
    buttons[iButton] = document.createElement("input");
    buttons[iButton].type = "color";
    buttons[iButton].value = color.hex;
    list.appendChild(buttons[iButton]);
    buttons[iButton].addEventListener("change",watchColorPicker);
}

//resets things
function resetColors() {
    for ( let i = 0; i < buttons.length; i++ ) {
        buttons[i].remove();
    }
    buttons.length = 0;
    colors.length = 0;
    addColor();
}

function watchBlendPicker (event) {
  $(canvas).css('mixBlendMode', event.target.value );
}

//watch for settings changes
function watchRotInput (event) {
  bRotate = !bRotate;
}

function watchHueInput (event) {
  bHue = !bHue;
}

function watchOpacInput (event) {
  let i = 0.01 * event.target.value;
  $(canvas).css('opacity', `${i}`);
}

function watchColorPicker (event) {
    for ( let i = 0; i < colors.length; i++ ) {
        colors[i].hex = buttons[i].value;
        HextoHSL(colors[i]);
    }
}

//called every frame
function animate() {
    drawBackground();
    requestAnimationFrame(animate);
}

//utility to convert hex color value to hsl
//Source - https://css-tricks.com/converting-color-spaces-in-javascript/
//by John Kantner
function HextoHSL(color) {
  // Convert hex to RGB first
  let r = 0, g = 0, b = 0;
  if (color.hex.length == 4) {
    r = "0x" + color.hex[1] + color.hex[1];
    g = "0x" + color.hex[2] + color.hex[2];
    b = "0x" + color.hex[3] + color.hex[3];
  } else if (color.hex.length == 7) {
    r = "0x" + color.hex[1] + color.hex[2];
    g = "0x" + color.hex[3] + color.hex[4];
    b = "0x" + color.hex[5] + color.hex[6];
  }
  // Make r, g, and b fractions of 255
  r /= 255;
  g /= 255;
  b /= 255;

  // Find greatest and smallest channel values
  let cmin = Math.min(r,g,b),
      cmax = Math.max(r,g,b),
      delta = cmax - cmin,
      h = 0,
      s = 0,
      l = 0;

  // Calculate hue
  // No difference
  if (delta === 0)
    h = 0;
  // Red is max
  else if (cmax === r)
    h = ((g - b) / delta) % 6;
  // Green is max
  else if (cmax === g)
    h = (b - r) / delta + 2;
  // Blue is max
  else
    h = (r - g) / delta + 4;

  h = Math.round(h * 60);
    
  // Make negative hues positive behind 360°
  if (h < 0)
      h += 360;

  // Calculate lightness
  l = (cmax + cmin) / 2;

  // Calculate saturation
  s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    
  // Multiply l and s by 100
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  color.h = h;
  color.s = s;
  color.l = l;
}
