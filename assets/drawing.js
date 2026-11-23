class DrawingObj extends UIObj {

	constructor() {
		super("Drawing tools");

		this.div.style.zIndex = 22;

		this.colors = ["#000000", "#ffffff"];

		this.canvas = this.AddElement("canvas", document.body);
		this.canvas.classList.add("background-overlay");
		this.canvas.owner = this.self;
		this.canvas.style.zIndex = 21;
		this.canvas.style.pointerEvents = "auto";

		this.buttonbrush = this.AddElement("button", this.div, "click");
		this.buttonbrush.innerHTML = `<span class="material-symbols-outlined ui-span">check_box</span><span class="material-symbols-outlined ui-span">brush</span>`;
		this.buttonbrush.classList.add("margin-10");

		this.buttonerase = this.AddElement("button", this.div, "click");
		this.buttonerase.innerHTML = `<span class="material-symbols-outlined ui-span">check_box_outline_blank</span><span class="material-symbols-outlined ui-span">ink_eraser</span>`;
		this.buttonerase.classList.add("margin-10");

		this.buttonmouse = this.AddElement("button", this.div, "click");
		this.buttonmouse.innerHTML = `<span class="material-symbols-outlined ui-span">check_box_outline_blank</span><span class="material-symbols-outlined ui-span">arrow_selector_tool</span>`;
		this.buttonmouse.classList.add("margin-10");

		this.AddElement("br");

		this.slidsize = this.AddElement("input", this.div, "input");
		this.slidsize.type = "range";
		this.slidsize.value = 3;
		this.slidsize.min = 1;
		this.slidsize.max = 50;
		let p = this.AddElement("label");
		p.textContent = "Size";

		this.AddElement("br");

		this.slidsmooth = this.AddElement("input", this.div, "input");
		this.slidsmooth.type = "range";
		this.slidsmooth.value = 10;
		this.slidsmooth.min = 1;
		this.slidsmooth.max = 20;
		p = this.AddElement("label");
		p.textContent = "Smooth";

		this.AddElement("br");

		this.cbut = this.AddElement("button");
		this.cbut.innerHTML = `<span class="material-symbols-outlined ui-span">colors</span>`;
		this.cbut.classList.add("margin-10");

		this.buttonrbow = this.AddElement("button", this.div, "click");
		this.buttonrbow.innerHTML = `<span class="material-symbols-outlined ui-span">check_box_outline_blank</span><span class="material-symbols-outlined ui-span">looks</span>`;
		this.buttonrbow.classList.add("margin-10");

		this.button0brush = this.AddElement("button", this.div, "click");
		this.button0brush.innerHTML = `<span class="material-symbols-outlined ui-span" style="color: ${this.colors[0]}">format_color_fill</span>`;
		this.button0brush.classList.add("margin-10");

		this.button1brush = this.AddElement("button", this.div, "click");
		this.button1brush.innerHTML = `<span class="material-symbols-outlined ui-span" style="color: ${this.colors[1]}">format_color_fill</span>`;
		this.button1brush.classList.add("margin-10");

		this.AddElement("br");

		this.buttonclear = this.AddElement("button", this.div, "click");
		this.buttonclear.innerHTML = `<span class="material-symbols-outlined ui-span">remove_selection</span>Clear`;
		this.buttonclear.classList.add("margin-10");

		this.buttonsave = this.AddElement("button", this.div, "click");
		this.buttonsave.innerHTML = `<span class="material-symbols-outlined ui-span">file_save</span>Drawing to object`;
		this.buttonsave.classList.add("margin-10");

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
		this.initDrawing();
		this.Paint();
	}

	initDrawing() {
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
		this.drawing = new Atrament(this.canvas, {width: window.innerWidth, height: window.innerHeight});
		this.drawing.color = this.color;
		this.drawing.weight = Number(this.slidsize.value);
		this.drawing.smoothing = Number(this.slidsmooth.value) / 10 - 0.1;
		this.drawing.owner = this.self;
		this.drawing.secondaryMouseButton = true;
	}

	PickerInput(picker) {
		this.SetColor(this.picker.toHEXString());
		this.Paint();
	}

	handleEvent(e) {
		if ( e.target == this.buttonbrush ) {
			this.Paint();
		} else if ( e.target == this.buttonerase ) {
			this.drawing.mode = MODE_ERASE;
			this.canvas.style.pointerEvents = "auto";
			this.buttonbrush.innerHTML = `<span class="material-symbols-outlined ui-span">check_box_outline_blank</span><span class="material-symbols-outlined ui-span">brush</span>`;
			this.buttonerase.innerHTML = `<span class="material-symbols-outlined ui-span">check_box</span><span class="material-symbols-outlined ui-span">ink_eraser</span>`;
			this.buttonmouse.innerHTML = `<span class="material-symbols-outlined ui-span">check_box_outline_blank</span><span class="material-symbols-outlined ui-span">arrow_selector_tool</span>`;
		} else if ( e.target == this.buttonmouse ) {
			this.drawing.mode = MODE_DISABLED;
			this.canvas.style.pointerEvents = "none";
			this.buttonbrush.innerHTML = `<span class="material-symbols-outlined ui-span">check_box_outline_blank</span><span class="material-symbols-outlined ui-span">brush</span>`;
			this.buttonerase.innerHTML = `<span class="material-symbols-outlined ui-span">check_box_outline_blank</span><span class="material-symbols-outlined ui-span">ink_eraser</span>`;
			this.buttonmouse.innerHTML = `<span class="material-symbols-outlined ui-span">check_box</span><span class="material-symbols-outlined ui-span">arrow_selector_tool</span>`;
		} else if ( e.target == this.buttonclear ) {
			this.drawing.clear();
		} else if ( e.target == this.button0brush ) {
			this.picker.fromString(this.colors[0]);
			this.SetColor(this.picker.toHEXString());
			this.isanimating = false;
			this.buttonrbow.innerHTML = `<span class="material-symbols-outlined ui-span">check_box_outline_blank</span><span class="material-symbols-outlined ui-span">looks</span>`;
			this.Paint();
		} else if ( e.target == this.button1brush ) {
			this.picker.fromString(this.colors[1]);
			this.SetColor(this.picker.toHEXString());
			this.isanimating = false;
			this.buttonrbow.innerHTML = `<span class="material-symbols-outlined ui-span">check_box_outline_blank</span><span class="material-symbols-outlined ui-span">looks</span>`;
			this.Paint();
		} else if ( e.target == this.slidsize ) {
			this.drawing.weight = Number(e.target.value);
		} else if ( e.target == this.slidsmooth ) {
			this.drawing.smoothing = Number(e.target.value) / 10 - 0.1;
		} else if ( e.target == this.buttonrbow ) {
			this.ToggleAnimate();
			if ( this.isanimating ) {
				this.buttonrbow.innerHTML = `<span class="material-symbols-outlined ui-span">check_box</span><span class="material-symbols-outlined ui-span">looks</span>`;
			} else {
				this.buttonrbow.innerHTML = `<span class="material-symbols-outlined ui-span">check_box_outline_blank</span><span class="material-symbols-outlined ui-span">looks</span>`;
			}
		} else if ( e.target == this.buttonsave ) {
			this.TrimAndPaste();
		}
	}

	Frame(delta) {
		let h = this.picker.channel("H");
		h = ( h + 0.4 )  % 360;
		this.picker.fromHSVA(h, null, null, null);
		this.SetColor(this.picker.toHEXString());
		this.drawing.color = this.color;
	}

	Paint() {
		this.drawing.color = this.color;
		this.drawing.mode = MODE_DRAW;
		this.canvas.style.pointerEvents = "auto";
		this.drawing.weight = Number(this.slidsize.value);
		this.buttonbrush.innerHTML = `<span class="material-symbols-outlined ui-span">check_box</span><span class="material-symbols-outlined ui-span">brush</span>`;
		this.buttonerase.innerHTML = `<span class="material-symbols-outlined ui-span">check_box_outline_blank</span><span class="material-symbols-outlined ui-span">ink_eraser</span>`;
		this.buttonmouse.innerHTML = `<span class="material-symbols-outlined ui-span">check_box_outline_blank</span><span class="material-symbols-outlined ui-span">arrow_selector_tool</span>`;
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

	TrimAndPaste() {
    	const context = this.canvas.getContext('2d');

		const topLeft = {
			x: this.canvas.width,
			y: this.canvas.height,
			update(x, y) {
				this.x = Math.min(this.x, x);
				this.y = Math.min(this.y, y);
			}
		};

		const bottomRight = {
			x: 0,
			y: 0,
			update(x, y) {
				this.x = Math.max(this.x, x);
				this.y = Math.max(this.y, y);
			}
		};

		const imageData = context.getImageData(0, 0, this.canvas.width, this.canvas.height);

		for ( let x = 0; x < this.canvas.width; x++ ) {
			for ( let y = 0; y < this.canvas.height; y++ ) {
				const alpha = imageData.data[((y * (this.canvas.width * 4)) + (x * 4)) + 3];
				if ( alpha !== 0 ) {
					topLeft.update(x,y);
					bottomRight.update(x,y);
				}
			}
		}

		const width = bottomRight.x - topLeft.x;
		const height = bottomRight.y - topLeft.y;

		const croppedCanvas = context.getImageData(topLeft.x, topLeft.y, width, height);

		this.canvas.width = width;
		this.canvas.height = height;
		context.putImageData(croppedCanvas, 0, 0);
		rcloc.x = topLeft.x;
		rcloc.y = topLeft.y;
		this.canvas.toBlob( (blob) => {
			HandlePaste(blob);
		});
		//reset all canvas and drawing to start state
		this.drawing.clear();
		this.drawing.destroy();
		this.buttonmouse.click();
		this.initDrawing();
	}

	remove() {
		this.drawing.clear();
		this.drawing.destroy();
		this.canvas.remove();
		UIObj.prototype.remove.call(this);
	}
}
