class DrawingObj extends UIObj {

	constructor() {
		super("Drawing tools");

		this.div.style.zIndex = 22;

		this.colors = ["#000000", "#ffffff", "#ea49ff", "#3cffde"];

		this.canvas = this.AddElement("canvas", document.body);
		this.canvas.classList.add("background-overlay");
		this.canvas.owner = this.self;
		this.canvas.style.zIndex = 21;
		this.canvas.style.pointerEvents = "auto";

		this.drawing = new Atrament(this.canvas, {width: window.innerWidth, height: window.innerHeight});
		this.drawing.owner = this.self;

		this.drawing.weight = 5;
		this.drawing.smoothing = 1.0;
		this.drawing.secondaryMouseButton = true;

		this.buttonbrush = this.AddElement("button", this.div, "click");
		this.buttonbrush.innerHTML = `<span class="material-symbols-outlined ui-span">brush</span>`;
		this.buttonbrush.classList.add("margin-10");

		this.button0brush = this.AddElement("button", this.div, "click");
		this.button0brush.innerHTML = `<span class="material-symbols-outlined ui-span" style="color: ${this.colors[0]}">colorize</span>`;
		this.button0brush.classList.add("margin-10");

		this.button1brush = this.AddElement("button", this.div, "click");
		this.button1brush.innerHTML = `<span class="material-symbols-outlined ui-span" style="color: ${this.colors[1]}">colorize</span>`;
		this.button1brush.classList.add("margin-10");

		this.button2brush = this.AddElement("button", this.div, "click");
		this.button2brush.innerHTML = `<span class="material-symbols-outlined ui-span" style="color: ${this.colors[2]}">colorize</span>`;
		this.button2brush.classList.add("margin-10");

		this.button3brush = this.AddElement("button", this.div, "click");
		this.button3brush.innerHTML = `<span class="material-symbols-outlined ui-span" style="color: ${this.colors[3]}">colorize</span>`;
		this.button3brush.classList.add("margin-10");

		this.AddElement("br");

		this.buttonerase = this.AddElement("button", this.div, "click");
		this.buttonerase.innerHTML = `<span class="material-symbols-outlined ui-span">ink_eraser</span>`;
		this.buttonerase.classList.add("margin-10");

		this.buttonmouse = this.AddElement("button", this.div, "click");
		this.buttonmouse.innerHTML = `<span class="material-symbols-outlined ui-span">arrow_selector_tool</span>`;
		this.buttonmouse.classList.add("margin-10");

		this.AddElement("br");

		this.buttonclear = this.AddElement("button", this.div, "click");
		this.buttonclear.innerHTML = `<span class="material-symbols-outlined ui-span">remove_selection</span>Clear`;
		this.buttonclear.classList.add("margin-10");

		this.cbut = this.AddElement("button");
		this.cbut.innerHTML = `<span class="material-symbols-outlined ui-span">colors</span>`;
		this.cbut.classList.add("margin-10");
		let bgc = window.getComputedStyle(document.body).getPropertyValue('--ui-bg');
		let bdc = window.getComputedStyle(document.body).getPropertyValue('--ui-border-c');
		this.picker = new JSColor(this.cbut, {
			mode: 'HSV',
			alphaChannel: false,
			previewElement: this.cbut,
			preset:'large',
			backgroundColor: bgc,
			borderColor: bdc,
			borderRadius: 5,
			padding: 15
		});
		jscolor.install();
		this.picker.randomize(85, 100, 70, 100);
		this.picker.owner = this.self;
		this.picker.option('onChange', function() {
			this.owner.PickerInput(this);
		});
		this.color = this.picker.toHEXString();
		this.Paint();

		//UI TODO:

		//weight
		//smoothing?

		//quick color brush select buttons?

		//RAINBOW DRAWING!  Slowly change hue?

		//undo

		//clear button

		//save button - sends drawing to QD as an image
	}

	PickerInput(picker) {
		this.SetColor(this.picker.toHEXString());
		this.Paint();
	}

	handleEvent(e) {
		if ( e.target == this.buttonbrush ) {
			this.drawing.mode = MODE_DRAW;
			this.canvas.style.pointerEvents = "auto";
		} else if ( e.target == this.buttonerase ) {
			this.drawing.mode = MODE_ERASE;
			this.canvas.style.pointerEvents = "auto";
		} else if ( e.target == this.buttonmouse ) {
			this.drawing.mode = MODE_DISABLED;
			this.canvas.style.pointerEvents = "none";
		} else if ( e.target == this.buttonclear ) {
			this.drawing.clear();
		} else if ( e.target == this.button0brush ) {
			this.picker.fromString(this.colors[0]);
			this.SetColor(this.picker.toHEXString());
			this.Paint();
		} else if ( e.target == this.button1brush ) {
			this.picker.fromString(this.colors[1]);
			this.SetColor(this.picker.toHEXString());
			this.Paint();
		} else if ( e.target == this.button2brush ) {
			this.picker.fromString(this.colors[2]);
			this.SetColor(this.picker.toHEXString());
			this.Paint();
		} else if ( e.target == this.button3brush ) {
			this.picker.fromString(this.colors[3]);
			this.SetColor(this.picker.toHEXString());
			this.Paint();
		}
	}

	Paint() {
		this.drawing.color = this.color;
		this.drawing.mode = MODE_DRAW;
		this.canvas.style.pointerEvents = "auto";
	}

	resizeWindow(ow, oh) {
		let x;
		let i;
		UIObj.prototype.resizeWindow.call(this, ow, oh);
		this.drawing.width = window.innerWidth;
		this.drawing.height = window.innerHeight;
		if ( this.page == 0 ) {
			x = 0;
		} else {
			i = this.div.getBoundingClientRect().x >= 0 ? 1 : -1;
			x = i * window.innerWidth;
		}
		$(this.canvas).css('left', x);
	}

	HandleMove(w) {
		let oldx = this.div.getBoundingClientRect().x;
		UIObj.prototype.HandleMove.call(this, w);
		let x = this.canvas.getBoundingClientRect().x;
		//set new location
		//use the difference calculation for the ui div
		let diff = this.goingtox - oldx;
		x += diff;
		//transition for smooth page move
		$(this.canvas).css({
			'left': x,
			'transition': "left 0.5s",
		});
	}

	remove() {
		this.drawing.clear();
		this.canvas.remove();
		UIObj.prototype.remove.call(this);
	}
}
