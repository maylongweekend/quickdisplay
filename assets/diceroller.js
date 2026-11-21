//simple controller to roll the dice from dice.js
//AllObjects.push(new DiceRollerObj());

class DiceRollerObj extends UIObj {

	constructor() {
		super("Dice roller");

		this.dicestart = "2d6 + 1d20";

		this.scale = 11;//bigger is smaller, default 8

		this.container = this.AddElement("div", document.body);
		this.container.classList.add("background-overlay");
		this.container.style.zIndex = 21;//not sure where to put this? - on top of all but able to be easily under?
		this.dice = new DICE.dice_box(this.container);
		this.dice.owner = this.self;
		this.dice.setDice("2d6");

		//UI
		this.rollbutton = this.AddElement("button", undefined, "click");
		this.rollbutton.innerHTML = `<span class="material-symbols-outlined ui-span">shuffle</span>`;
		this.rollbutton.classList.add("margin-10");

		this.AddElement("br");

		this.dicebutton = this.AddElement("button", undefined, "click");
		this.dicebutton.innerHTML = `<span class="material-symbols-outlined ui-span">dashboard_customize</span>`;
		this.dicebutton.classList.add("margin-10");
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
		this.picker.randomize(70, 95, 80, 100);
		this.picker.owner = this.self;
		this.picker.option('onChange', function() {
			this.owner.PickerInput(this);
		});
		this.color = this.picker.toHEXString();

		this.dice.start_throw();
		this.RollFresh();
	}

	PickerInput(picker) {
		this.SetColor(this.picker.toHEXString());
		this.RollFresh();
	}

	//receives the message that a new die has been created
	NewDice(dice) {}

	handleEvent(e) {
		log("click " + e.target )
		if ( e.target == this.rollbutton || e.target == this.container ) {
			this.RollNow();
		}
		else if ( e.target == this.dicebutton ) {
			let s = prompt(`Enter dice in this format:\n[amount][d#] + [amount][d#]\nEg: 3d6 + 1d12 + 2d20\n\nAllowed dice: d4, d6, d8, d10, d12, d20, d100`, this.dicestart);
			if ( !s ) {
				return;
			}
			while ( s.includes(" ") ) {
				s = s.replace(" ", "");
			}
			this.dicestart = s;
			this.dice.setDice(this.dicestart);
			this.RollFresh();
		}
	}

	RollNow() {
		this.dice.push_dice();
	}

	RollFresh() {
		this.dice.change_dice_color(this.color, this.picker.isLight());
		this.dice.start_throw();
	}

	//dice can move pages
	HandleMove(w) {
		let oldx = this.div.getBoundingClientRect().x;
		UIObj.prototype.HandleMove.call(this, w);
		let x = this.container.getBoundingClientRect().x;
		//set new location
		//use the difference calculation for the ui div
		let diff = this.goingtox - oldx;
		x += diff;
		//transition for smooth page move
		$(this.container).css({
			'left': x,
			'transition': "left 0.5s",
		});
	}

	SpaceBar() {
		this.RollNow();
	}

	BackClick() {
		this.RollNow();
	}

	resetTransition() {
		$(this.container).css('transition', 'left 0s');
		UIObj.prototype.resetTransition.call(this);
	}

	remove() {
		this.dice.clear();
		this.container.remove();
		UIObj.prototype.remove.call(this);
	}
}
