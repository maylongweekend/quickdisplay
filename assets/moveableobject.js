/*
 * -----------------------------------
 *	THE BASE CLASS
 * ------------------------------------
 */


class BaseObject {

	constructor() {
		this.self = this;
	}

	load(options) {
		let keys = Object.keys(options);
		let update = false;
		for (let k of keys ) {
			for ( let n in this.self ) {
				if ( n == k ) {
					log("Match found! Old value: " + this.self[n]);
					this.self[n] = options[k];
					log("Set object key " + n + " to value " + this.self[n]);
					update = true;
				}
			}
		}
		update && this.UpdateAfterLoad();
	}

	//called by children
	//to take account of loaded changes
	UpdateAfterLoad() {}
}


//THE BASE MOVEABLE ITEM CLASS
//a moveable scalable div with various right click options
//subclasses handle specific implementation of various features

//structure note:
//the outermost div is this.outerdiv
// - handles dragging
//inside this is this.div
// - handles scaling/flipping and all else
//use this.div for everything unless you need to mess with the outerdiv

class MoveableObject extends BaseObject {

	constructor(bdrag = true, bscale = true, btext = false, bcolor = false, bfont = false, banimate = false, blink = false) {

		super();

		this.bdrag = bdrag;
		this.bscale = bscale;
		this.text = "Edit text";
		this.colorinput = null;
		this.bfont = bfont;
		this.font = "";
		this.color = "";
		this.index = AllObjects.length;
		this.banimate = banimate;
		this.isanimating = false;
		this.blink = blink;
		this.link = "";
		this.isflipped = false;
		this.colors = [];
		this.pickers = [];

		//create the div and handle basic drag/scale settings
		this.outerdiv = document.createElement("div");
		document.body.appendChild(this.outerdiv);
		this.div = document.createElement("div");
		this.div.classList.add("object-div");
		this.outerdiv.appendChild(this.div);
		$(this.outerdiv).draggable();
		this.SetDraggable(bdrag);
		$(this.div).css('transform', 'scale(1, 1)');//init the transform style for later scaling/flipping
		this.SetScalable(bscale);
		$(this.outerdiv).css({
			top: rcloc.y,
			left: rcloc.x,
		});
		this.div.owner = this.self;
		this.outerdiv.owner = this.self;

		//set up the context menu
		this.menu = document.getElementById("default-context").cloneNode(true);
		this.menu.id = "context-" + this.index;
		document.body.appendChild(this.menu);
		AddContextMenu(this.div, this.menu);

		//set up link menu item
		if ( blink ) {
			//add edit entry to top of menu
			let lili = AddContextItem(this.menu,"link",`<span class="material-symbols-outlined">add_link</span>Edit link`,true);
			this.div.addEventListener('click', function GoToLink() {
				let s = this.owner.link;
				if ( s != "" ) {
					if ( !s.includes("http") ) {
						s = "http://" + s;
					}
					window.open(s, 'Link', 'width=900,height=600');
				}
			});
		}

		//set up animation menu item
		if ( banimate ) {
			let anli = AddContextItem(this.menu, "animate", `<span class="material-symbols-outlined">motion_play</span>Toggle animation`, true);
		}

		//set up the color picker
		if ( bcolor ) {
			let ccli = AddContextItem(this.menu, "color", `<span class="material-symbols-outlined">colors</span>Change color`, true);
			this.HandleInitialColor();
			this.colorinput = this.AddColorPicker(ccli, '', this.color);
			//give the picker a reference to this class and set the callback function to this class setcolor
			this.colorinput.owner = this.self;
			this.colorinput.option('onInput', function() {
				this.owner.PickerInput(this);
			});
		}

		//set up text editing
		if ( btext ) {
			let stli = AddContextItem(this.menu, "edit", `<span class="material-symbols-outlined">edit</span>Edit text`, true);
		}

		//set up the font selector
		if ( bfont ) {
			let fsp = document.createElement("p");
			this.fontselector = document.getElementById("default-font-selector").cloneNode(true);
			this.fontselector.id = "font-" + this.index;
			this.fontselector.style.display = "inline";
			this.fontselector.owner = this.self;
			this.font = "Verdana, Geneva, Tahoma, sans-serif";
			fsp.appendChild(this.fontselector);
			let temp = this.index;
			this.fontselector.addEventListener("change", function(event) {
				this.owner.SetFont(event.target.value);
				$(".context").hide(100);
			});
			this.menu.insertBefore(fsp,this.menu.children[0]);
		}
		let lis = $(this.menu).children("li");
		for ( let i = 0; i < lis.length; i++ ) {
			this.AssignMenuAction(lis[i], this.div, this.self);
		}
	}

	 //here set listeners for each context item
	AssignMenuAction(li, elem, owner) {
		let zi;
		let s;
		let t;
		li.addEventListener('click', function() {
			$(".context").hide(100);
			switch ( $(li).attr("data-action") ) {
				case "link":
					t = $(li).attr("data-url") != undefined ? $(li).attr("data-url") : "www.example.ca";
					s = prompt("Enter URL to open when double-clicked", t);
					li.setAttribute('data-url', s);
					owner.HandleLinkEdit(s);
					break;
				case "edit":
					owner.HandleTextEdit();
					break;
				case "color":
					break;
				case "animate":
					owner.ToggleAnimate();
					break;
				case "up":
					zi = $(elem).css('z-index');
					zi++;
					$(elem).css('z-index', zi);
					break;
				case "down":
					zi = $(elem).css('z-index');
					zi--;
					$(elem).css('z-index', zi);
					break;
				case "mirror":
					owner.isflipped = !owner.isflipped;
					let scale = elem.getBoundingClientRect().width / elem.offsetWidth;
					let xscale = owner.isflipped ? scale * -1 : scale;
					$(elem).css('transform', `scale(${xscale}, ${scale})`);
					break;
				case "lock":
					if ( $(owner.outerdiv).draggable("option", "disabled") ) {
						this.innerHTML = `<span class="material-symbols-outlined">lock</span>Lock position`;
						owner.SetDraggable(true);
					} else {
						this.innerHTML = `<span class="material-symbols-outlined">lock_open_right</span>Allow moving`;
						owner.SetDraggable(false);
					}
					break;
				case "duplicate":
					//todo: clone using class functions for fully functional clones
					let newitem = elem.cloneNode(true);
					document.body.appendChild(newitem);
					$(newitem).css({
						top: rcloc.y,
						left: rcloc.x,
					});
					$(newitem).draggable();
					CreateDefaultContextMenu(newitem);
					MakeObjScale(newitem);
					//set clone scale to old object scale
					s = elem.getBoundingClientRect().width / elem.offsetWidth;
					$(newitem).css('transform', `scale(${s})`);
					break;
				case "reset":
					owner.resetTransform();
					break;
				case "hide":
					$(elem).css('visibility','hidden');
					break;
				case "delete":
					owner.remove();//call remove on class instance and it will handle deleting needed dom elements
					break;
			}
		});
	}

	HandleLinkEdit(s) {
		this.link = s;
	}
	HandleTextEdit() {
		this.text = prompt("Enter your text", this.text);
	}

	 //children can this to set the default color for picker
	HandleInitialColor() {}

	HandleMove(w) {
		let x = this.outerdiv.getBoundingClientRect().left;
		//set new location
		x -= w;
		//transition for smooth page move
		$(this.outerdiv).css({
			'left': x,
			'transition': "left 0.5s",
		});
	}

	resetTransition() {
		$(this.outerdiv).css('transition', 'left 0s');
	}

	AddColorPicker(elem, preview = '', defaultcolor = '', mode = 'HSV', alpha = true) {
		let bgc = window.getComputedStyle(document.body).getPropertyValue('--ui-bg');
		let bdc = window.getComputedStyle(document.body).getPropertyValue('--ui-border-c');
		let p = new JSColor(elem, {
			mode: mode,
			alphaChannel: alpha,
			previewElement: preview,
			preset:'large',
			backgroundColor: bgc,
			borderColor: bdc,
			borderRadius: 5,
			padding: 15
		});
		this.pickers.push(p);
		jscolor.install();
		let color = {};
		if ( defaultcolor != '' ) {
			p.fromString(defaultcolor);
			color.rgba = p.toRGBAString();
		} else {
			color.r = Math.floor(Math.random() * 256);
			color.g = Math.floor(Math.random() * 256);
			color.b = Math.floor(Math.random() * 256);
			color.a = 1.0;
			color.rgba = `rgba(${color.r},${color.g},${color.b},${color.a})`;
			p.fromString(color.rgba);
		}
		this.colors.push(color);
		p.owner = this.self;
		p.index = this.pickers.length;
		p.option('onInput', function() {
			this.owner.PickerInput(this);
		});
		return p;
	}

	//called when jscolor picker receives input
	//standard behaviour is to send color string to setcolor
	PickerInput(picker) {
		this.SetColor(picker.toRGBAString());
	}

	SetColor(s) {
		this.color = s;
	}

	SetFont(s) {
		this.font = s;
	}

	ToggleAnimate() {
		this.isanimating = !this.isanimating;
	}

	//called by master animation loop
	AnimateFrame(delta) {
		this.isanimating && this.Frame(delta);
	}

	//call on a child to handle animation
	Frame(delta) {}

	SetDraggable(b) {
		let s = b ? "enable" : "disable";
		$(this.outerdiv).draggable(s);
		this.bdrag = b;
	}

	SetScalable(b) {
		if ( b ) {
			this.div.addEventListener('wheel',function ObjScale(event) {
				event.preventDefault();
				let dir = event.deltaY < 0 ? 1 : -1;
				let scale = this.getBoundingClientRect().width / this.offsetWidth;
				scale += dir * 0.1;
				scale = Math.max(0.1, Math.min(5, scale));
				let xscale = this.owner.isflipped ? scale * -1 : scale;
				$(this).css('transform', `scale(${xscale}, ${scale})`);
			});
		} else {
			this.div.removeEventListener('wheel', ObjScale);
		}
		this.bscale = b;
	}

	resetTransform() {
		$(this.div).css('transform','scale(1, 1)');
		this.isflipped = false;
	}

	//creates an HTML dom object
	//and appends it to anything (default this.div)
	//pass an event to it for an event listener
	//pass a class reference in order to have that.handleEvent() called instead of a function
	AddElement(type, to = this.div, ev = "", ref = this) {
		let newelem = document.createElement(type);
		to.appendChild(newelem);
		if ( ev != "" ) {
			//if ref is not a function, it will look for handleEvent() inside ref
			newelem.addEventListener(ev, ref);
		}
		return newelem;
	}

	//handles passing event listeners to child classes
	//use switch ( e.type ) to detect eg "click" and call function on this
	handleEvent(e) {}

	//moveable objects need to be able to load extra keys
	//xy location, scale
	load(options) {
		let keys = Object.keys(options);
		for (let k of keys ) {
			if ( k == "x") {
				Number(options[k]) && $(this.outerdiv).css('left', Number(options[k]));
			} else if ( k == "y") {
				Number(options[k]) && $(this.outerdiv).css('top', Number(options[k]));
			} else if ( k == "scale" ) {
				if ( Number(options[k]) ) {
					let scale = Number(options[k]);
					let xscale = this.isflipped ? scale * -1 : scale;
					log(xscale + " " + scale)
					$(this.div).css('transform', `scale(${xscale}, ${scale})`);
				}
			}
		}
		BaseObject.prototype.load.call(this, options);
	}

	remove() {
		this.outerdiv.remove();
		this.menu.remove();
		AllObjects.splice(this.index, 1);
	}
}
