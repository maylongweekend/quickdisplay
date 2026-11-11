/* THE BASE BACKGROUND CLASS */
//a full-screen div
//subclasses handle specific implementation of various features

class BackgroundLayer {

	constructor(isanimating = false, hascanvas = false, hasui = false) {
		this.isanimating = isanimating;
		this.hascanvas = hascanvas;
		this.hasui = hasui;
		this.self = this;
		this.index = AllBackgrounds.length;
		this.uititle = "";

		this.CreateHTMLStructure();
		if ( hasui ) {
			this.initUI();
		}
	}

	CreateHTMLStructure() {
		if ( this.hascanvas ) {
			this.canvas = document.createElement("canvas");
			this.canvas.classList.add("background-overlay");
			document.body.appendChild(this.canvas);
			this.canvas.owner = this.self;
		} else {
			//create the div
			this.div = document.createElement("div");
			this.div.classList.add("background-overlay");
			document.body.appendChild(this.div);
			this.div.owner = this.self;
		}
	}

	//called by child class to build the ui elements
	//use AddElement, eg AddElement("button", undefined, "click", this.self) to build
	initUI() {
		this.ui = new UIObj(this.uititle);
		AllObjects.push(this.ui);
	}

	//handles passing event listeners to child classes
	//use switch ( e.type ) to detect eg "click" and call function on this
	//you can pass the background to the ui to make ui clicks come back here
	handleEvent(e) {}

	ToggleAnimate() {
		this.isanimating = !this.isanimating;
	}

	//called by master animation loop
	AnimateFrame(delta) {
		if ( this.isanimating ) {
			this.Frame(delta);
		}
	}

	//most backgrounds don't move when the page is changed
	HandleMove(w) {}

	resetTransition() {}

	//call on a child to handle animation
	Frame(delta) {}

	remove() {
		if ( this.div !== undefined ) {
			this.div.remove();
		}
		if ( this.canvas !== undefined ) {
			this.canvas.remove();
		}
		if ( this.hasui ) {
			this.ui.remove();
		}
		AllBackgrounds.splice(this.index, 1);
	}
}

class ParticlesLayer extends BackgroundLayer {

	constructor() {
		super(false, false, true);

		this.updateParticles = false;

		this.index = AllEffects.length;//switch otherwise clearing wont work!

		this.SetParticleOptions();
		this.spart = new Sparticles(this.div, this.options);
	}

	initUI() {
		BackgroundLayer.prototype.initUI.call(this);

		//set the defaults here before initializing controls
		this.options = {};
		this.count = 350;
		this.blur = 10;

		this.posselect = this.ui.AddElement("select", undefined, "change", this.self);
		this.posselect.innerHTML = `<option value="back">Background</option><option value="fore">Foreground</option>`;
		this.posselect.selectedIndex = 0;
		this.div.style.zIndex = 5;

		this.ui.AddElement("br");

		this.slidcount = this.ui.AddElement("input", undefined, "change", this.self);
		this.slidcount.type = "range";
		this.slidcount.min = "4";
		this.slidcount.max = "1000";
		this.slidcount.value = this.count;
		this.ui.AddElement("label").textContent = "Particle count";

		this.ui.AddElement("br");

		this.slidblur = this.ui.AddElement("input", undefined, "input", this.self);
		this.slidblur.type = "range";
		this.slidblur.min = "10";
		this.slidblur.max = "400";
		this.slidblur.value = this.blur;
		this.ui.AddElement("label").textContent = "Blur";

		this.ui.AddElement("br");
	}

	//child handles setting changes here
	//if the particles need to be respawned set this.updateParticles true
	//then call super
	handleEvent(e) {
		if ( e.target == this.posselect ) {
			if ( e.target.value == "fore" ) {
				this.div.style.zIndex = 40;
			} else {
				this.div.style.zIndex = 5;
			}
		} else if ( e.target == this.slidcount ) {
			this.count = e.target.value;
			this.options.count = this.count;
			this.updateParticles = true;
		} else if ( e.target == this.slidblur ) {
			this.blur = e.target.value;
			this.SetBlur();
		}
		//apply setting changes by destroying old particles
		//and creating new ones with new settings
		if ( this.updateParticles ) {
			this.updateParticles = false;
			this.spart.destroy();
			this.spart = new Sparticles(this.div, this.options);
			this.SetBlur();
		}
	}

	SetBlur() {
		let c = this.spart.ctx;
		if ( c ) {
			c.filter = `blur(${Math.round( ( this.blur - 10 ) / 10)}px)`;
		}
	}

	//child sets this.options here with sparticles settings
	SetParticleOptions() {}

	remove() {
		if ( this.div !== undefined ) {
			this.div.remove();
		}
		if ( this.ui !== undefined ) {
			this.ui.remove();
		}
		AllEffects.splice(this.index, 1);
	}
}


//SHAPESLAYER
//a layer of shapes that can be customized
//AllEffects.push(new ShapesLayer());

class ShapesLayer extends ParticlesLayer {

	SetParticleOptions() {
		let c = this.color;
		this.options = {
			"count": this.count,
			"speed": Math.round(this.speed / 10),
			"parallax": 50,
			"direction": this.direction,
			"alphaSpeed": 13.9,
			"minSize": this.size / 3,
			"maxSize": this.size,
			"drift": this.drift / 10,
			"spawnArea": 1,
			"style": this.style,
			"twinkle": this.twinkle,
			"color": "random",
			"shape": this.shape,
			"randomColor": function(index, total) {
				let h = c.h;
				h += ( Math.floor(Math.random() * 100) - 50 );
				if ( h < 0 ) {
					h += 360;
				}
				return `hsl(${h}, ${c.s}%, ${c.l}%)`;
			}
		}
	}

	initUI() {
		//set variables before super
		this.count = 480;
		this.uititle = "Flying Shapes";
		this.speed = 195;
		this.size = 40;
		this.drift = 145;
		this.shape = "star";
		this.style = "fill";
		this.twinkle = false;
		this.direction = 60;
		this.color = {
			h: 0,
			s: 0,
			l: 0,
			r: 0,
			g: 0,
			b: 0
		};

		ParticlesLayer.prototype.initUI.call(this);

		this.shapeselect = this.ui.AddElement("select", undefined, "change", this.self);
		this.shapeselect.innerHTML = `
			<option value="star">Stars</option>
			<option value="circle">Circles</option>
			<option value="square">Squares</option>
			<option value="triangle">Triangles</option>
			<option value="diamond">Diamonds</option>
			<option value="line">Lines</option>
			<option value="random">Random shapes</option>
		`;
		this.shapeselect.value = this.shape;

		this.ui.AddElement("br");

		this.styleselect = this.ui.AddElement("select", undefined, "change", this.self);
		this.styleselect.innerHTML = `
		<option value="fill">Fill shape</option>
		<option value="stroke">Outline only</option>
		<option value="both">Randomize</option>
		`;
		this.styleselect.value = this.style;

		this.ui.AddElement("br");

		this.slidsize = this.ui.AddElement("input", undefined, "change", this.self);
		this.slidsize.type = "range";
		this.slidsize.min = "10";
		this.slidsize.max = "400";
		this.slidsize.value = this.size;
		this.ui.AddElement("label").textContent = "Size";

		this.ui.AddElement("br");

		this.slidspeed = this.ui.AddElement("input", undefined, "change", this.self);
		this.slidspeed.type = "range";
		this.slidspeed.min = "100";
		this.slidspeed.max = "2500";
		this.slidspeed.value = this.speed;
		this.ui.AddElement("label").textContent = "Speed";

		this.ui.AddElement("br");

		this.sliddir = this.ui.AddElement("input", undefined, "change", this.self);
		this.sliddir.type = "range";
		this.sliddir.min = "0";
		this.sliddir.max = "360";
		this.sliddir.value = this.direction;
		this.ui.AddElement("label").textContent = "Direction";

		this.ui.AddElement("br");

		this.sliddrift = this.ui.AddElement("input", undefined, "change", this.self);
		this.sliddrift.type = "range";
		this.sliddrift.min = "10";
		this.sliddrift.max = "200";
		this.sliddrift.value = this.drift;
		this.ui.AddElement("label").textContent = "Drift";

		this.ui.AddElement("br");

		//color button and picker
		this.cbut = this.ui.AddElement("button");
		this.cbut.innerHTML = `<span class="material-symbols-outlined ui-span">colors</span>`;
		this.cbut.classList.add("margin-10");
		this.picker = this.ui.AddColorPicker(this.cbut, this.cbut, undefined, undefined, false);

		this.color.r = this.picker.channel("R");
		this.color.g = this.picker.channel("G");
		this.color.b = this.picker.channel("B");
		RGBToHSL(this.color);//get HSL values
		this.picker.owner = this.self;
		this.picker.option('onInput', function() {
			this.owner.ChangeColor(this);
		});

		//twinkle button
		this.tbut = this.ui.AddElement("button", undefined, "click", this.self);
		this.tbut.innerHTML = `<span class="material-symbols-outlined ui-span">check_box_outline_blank</span><span class="material-symbols-outlined ui-span">star_shine</span>`;
		this.tbut.classList.add("margin-10");
	}

	ChangeColor(p) {
		this.color.r = p.channel("R");
		this.color.g = p.channel("G");this.options.maxSize = this.size;
		this.color.b = p.channel("B");
		RGBToHSL(this.color);//get HSL values
		this.spart.destroy();
		this.spart = new Sparticles(this.div, this.options);
		this.SetBlur();
	}

	handleEvent(e) {
		if ( e.target == this.slidsize ) {
			this.size = e.target.value;
			this.options.minSize = Math.round(this.size / 3);
			this.options.maxSize = this.size;
			this.updateParticles = true;
		} else if ( e.target == this.slidspeed ) {
			this.speed = e.target.value;
			this.options.speed = this.speed / 10;
			this.updateParticles = true;
		} else if ( e.target == this.shapeselect )  {
			this.shape = e.target.value;
			this.options.shape = this.shape;
			this.updateParticles = true;
		} else if ( e.target == this.sliddrift ) {
			this.drift = e.target.value;
			this.options.drift = this.drift / 10;
			this.updateParticles = true;
		} else if ( e.target == this.sliddir ) {
			this.direction = e.target.value;
			this.options.direction = this.direction;
			this.updateParticles = true;
		} else if ( e.target == this.styleselect ) {
			this.style = e.target.value;
			this.options.style = this.style;
			this.updateParticles = true;
		} else if ( e.target == this.tbut ) {
			this.twinkle = !this.twinkle;
			if ( this.twinkle ) {
				this.tbut.innerHTML = `<span class="material-symbols-outlined ui-span">check_box</span><span class="material-symbols-outlined ui-span">star_shine</span>`;
			} else {
				this.tbut.innerHTML = `<span class="material-symbols-outlined ui-span">check_box_outline_blank</span><span class="material-symbols-outlined ui-span">star_shine</span>`;
			}
			this.options.twinkle = this.twinkle;
			this.updateParticles = true;
		}
		ParticlesLayer.prototype.handleEvent.call(this, e);
	}
}

//SNOWLAYER
//a layer of snow particles that drifts from the top
//AllEffects.push(new SnowLayer());

class SnowLayer extends ParticlesLayer {

	SetParticleOptions() {
		this.options = {
			"count": this.count,
			"speed": this.speed / 10,
			"parallax": 50,
			"direction": 160,
			"xVariance": 3.2,
			"yVariance": 0,
			"rotation": 0.8,
			"alphaSpeed": 0.5,
			"minAlpha": -0.7,
			"minSize": Math.round(this.size / 4),
			"maxSize": this.size,
			"drift": 5.6,
			"twinkle": true,
			"spawnArea": 1,
			"color": ["white","#d5f4f8"],
			"shape": "image",
			"imageUrl": ["./assets/snowflake1.png","./assets/snowflake2.png","./assets/snowflake3.png"]
		}
	}

	initUI() {
		//set variables before super
		this.size = 35;
		this.count = 350;
		this.speed = 200;
		this.uititle = "Snowflakes";

		ParticlesLayer.prototype.initUI.call(this);

		this.slidsize = this.ui.AddElement("input", undefined, "change", this.self);
		this.slidsize.type = "range";
		this.slidsize.min = "4";
		this.slidsize.max = "230";
		this.slidsize.value = this.size;
		this.ui.AddElement("label").textContent = "Size";

		this.ui.AddElement("br");

		this.slidspeed = this.ui.AddElement("input", undefined, "change", this.self);
		this.slidspeed.type = "range";
		this.slidspeed.min = "100";
		this.slidspeed.max = "1000";
		this.slidspeed.value = this.speed;
		this.ui.AddElement("label").textContent = "Speed";
	}

	handleEvent(e) {
		 if ( e.target == this.slidsize ) {
			this.size = e.target.value;
			this.options.minSize = Math.round(this.size / 4);
			this.options.maxSize = this.size;
			this.updateParticles = true;
		} else if ( e.target == this.slidspeed ) {
			this.speed = e.target.value;
			this.options.speed = this.speed / 10;
			this.updateParticles = true;
		}
		ParticlesLayer.prototype.handleEvent.call(this, e);
	}

}

//HEARTSLAYER
//valentine theme
//AllBackgrounds.push(new HeartsLayer());

class HeartsLayer extends SnowLayer {

	SetParticleOptions() {
		this.size = 200;
		this.slidsize.min = "30";
		this.slidsize.max = "500";
		this.slidsize.value = this.size;
		this.count = 100;
		this.slidcount.value = this.count;
		this.options = {
			"count": this.count,
			"speed": this.speed / 10,
			"parallax": 50,
			"direction": 0,
			"xVariance": 1,
			"yVariance": 1,
			"rotation": 0.8,
			"alphaSpeed": 0.5,
			"minAlpha": -0.7,
			"minSize": Math.round(this.size / 2),
			"maxSize": this.size,
			"drift": 3.0,
			"twinkle": false,
			"spawnArea": 1,
			"color": ["#ff33cc", "#ff3399", "#ff3385", "#ff00ff", "#ffb3d9"],
			"shape": "image",
			"imageUrl": ["./assets/heart1.svg","./assets/heart2.svg"]
		}
	}
}


/* VIDEOLAYER */
//a background that holds a video
//AllBackgrounds.push(new VideoLayer(filesrc));

class VideoLayer extends BackgroundLayer {

	constructor(src = "") {
		super();
		this.video.src = src;
	}

	CreateHTMLStructure() {
		BackgroundLayer.prototype.CreateHTMLStructure.call(this);
		this.video = document.createElement("video");
		this.video.muted = true;
		this.video.loop = true;
		this.video.autoplay = true;
		this.div.appendChild(this.video);
	}

	SetSrc(s) {
		this.video.src = s;
	}
}


/* IMAGELAYER */
//a background that holds an image
//AllBackgrounds.push(new ImageLayer(filesrc));

class ImageLayer extends BackgroundLayer {

	constructor(src = "") {
		super();
		this.img.src = src;
	}

	CreateHTMLStructure() {
		BackgroundLayer.prototype.CreateHTMLStructure.call(this);
		this.img = document.createElement("img");
		this.div.appendChild(this.img);
	}

	SetSrc(s) {
		this.img.src = s;
	}
}


/* GRADIENTLAYER */
//a background that lets you build gradients
//can animate them
//AllBackgrounds.push(new GradientLayer());

class GradientLayer extends BackgroundLayer {

	constructor() {
		super(true, true, true);

		this.isanimating = true;//always call the frame draw
		this.ishueanim = false;
		this.isrotanim = false;
		this.angle = 90;
		this.ctx = this.canvas.getContext("2d");
	}

	initUI() {
		this.buttons = [];
		this.colors = [];
		this.pickers = [];
		this.uititle = "Gradient creator";
		BackgroundLayer.prototype.initUI.call(this);
		this.uidiv = this.ui.AddElement("div")
		this.uidiv.style.display = "grid";
		this.uidiv.style.gridTemplateColumns = "120px 120px 120px";
		this.uidiv.style.gridTemplateRows = "fit-content(70px)";
		this.AddColorButton();
		this.adder = this.ui.AddElement("button", undefined, "click", this.self);
		this.adder.innerHTML = `<span class="material-symbols-outlined ui-span">add_box</span>`;
		this.adder.classList.add("margin-10");
		this.reset = this.ui.AddElement("button", undefined, "click", this.self);
		this.reset.innerHTML = `<span class="material-symbols-outlined ui-span">reset_colors</span>`;
		this.reset.classList.add("margin-10");
		this.rotate = this.ui.AddElement("button", undefined, "click", this.self);
		this.rotate.innerHTML = `<span class="material-symbols-outlined ui-span">check_box_outline_blank</span><span class="material-symbols-outlined ui-span">rotate_right</span>`;
		this.rotate.classList.add("margin-10");
		this.hue = this.ui.AddElement("button", undefined, "click", this.self);
		this.hue.innerHTML = `<span class="material-symbols-outlined ui-span">check_box_outline_blank</span><span class="material-symbols-outlined ui-span">palette</span>`;
		this.hue.classList.add("margin-10");
	}

	AddColorButton() {
		let b = this.ui.AddElement("button", this.uidiv);
		this.buttons.push(b);
		b.innerHTML = `<span class="material-symbols-outlined ui-span">colors</span>`;
		b.classList.add("margin-10");
		b.index = this.colors.length;
		let p = this.ui.AddColorPicker(b, b, undefined, undefined, false);
		this.pickers.push(p);
		let color = {};
			color.r = p.channel("R");
			color.g = p.channel("G");
			color.b = p.channel("B");
			color.a = p.channel("A");
			color.rgba = p.toRGBAString();
			RGBToHSL(color);//get HSL values
		this.colors.push(color);
		p.owner = this.self;
		p.index = this.pickers.length;
		p.option('onInput', function() {
			this.owner.PickerInput(this);
		});
	}

	PickerInput(picker) {
		let color = this.colors[picker.index - 1];
		color.r = picker.channel("R");
		color.g = picker.channel("G");
		color.b = picker.channel("B");
		color.a = picker.channel("A");
		color.rgba = picker.toRGBAString();
		RGBToHSL(color);//get HSL values
		this.colors[picker.index - 1] = color;
	}

	//use switch ( e.type ) to detect eg "click" and call function on this
	//you can pass the background to the ui to make ui clicks come back here
	handleEvent(e) {
		let s;
		if ( e.target == this.adder ) {
			this.AddColorButton();
		} else if ( e.target == this.reset ){
			for ( let c of this.buttons ) {
				c.remove();
			}
			this.colors.length = 0;
			this.buttons.length = 0;
			this.pickers.length = 0;
			this.AddColorButton();
		} else if ( e.target == this.hue ) {
			this.ishueanim = !this.ishueanim;
			if ( !this.ishueanim ) {
				this.hue.innerHTML = `<span class="material-symbols-outlined ui-span">check_box_outline_blank</span><span class="material-symbols-outlined ui-span">palette</span>`;
			} else {
				this.hue.innerHTML = `<span class="material-symbols-outlined ui-span">check_box</span><span class="material-symbols-outlined ui-span">palette</span>`;
			}
		} else if ( e.target == this.rotate ) {
			this.isrotanim = !this.isrotanim;
			if ( !this.isrotanim ) {
				this.rotate.innerHTML = `<span class="material-symbols-outlined ui-span">check_box_outline_blank</span><span class="material-symbols-outlined ui-span">rotate_right</span>`;
			} else {
				this.rotate.innerHTML = `<span class="material-symbols-outlined ui-span">check_box</span><span class="material-symbols-outlined ui-span">rotate_right</span>`;
			}
		}
	}

	Frame(delta) {
		//cycle background hue
		if ( this.ishueanim  ) {
			for ( let color of this.colors ) {
				color.h = ( color.h + 0.1 )  % 360;
			}
		}
		//cycle angle
		if ( this.isrotanim ) {
			this.angle = ( this.angle + 0.2 ) % 360;
		}

		//math for the angle of gradient
		let rads = this.angle / 180 * Math.PI;//convert degrees to radians
		let hyp = Math.min(this.canvas.height, this.canvas.width) / 1.4;//diameter of effect
		let x1 = Math.cos(rads) * hyp;
		let y1 = Math.sin(rads) * hyp;
		let x2 = x1 * -1;
		let y2 = y1 * -1;
		//adjust points as if origin was in middle of screen
		x1 += this.canvas.width / 2;
		y1 += this.canvas.height / 2;
		x2 += this.canvas.width / 2;
		y2 += this.canvas.height / 2;

		//create the gradient
		let gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);

		//calculate stops
		let c;
		if ( this.colors.length == 1 ) {
			c = this.colors[0];
			gradient.addColorStop(0, `hsl(${c.h}, ${c.s}%, ${c.l}%)`);
		} else {
			let i = 1 / ( this.colors.length - 1 );
			let stop = 0;
			for ( c of this.colors ) {
				gradient.addColorStop(stop, `hsl(${c.h}, ${c.s}%, ${c.l}%)`);
				stop += i;
			}
		}

		//fill the canvas
		this.ctx.fillStyle = gradient;
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
	}
}
