//simple controller to roll the dice from dice.js
//AllObjects.push(new DiceRollerObj());

class DiceRollerObj extends UIObj {

	constructor() {
		super("Dice roller");

		this.dicestart = "2d6 + 1d20";

		this.scale = 11;//bigger is smaller, default 8

		this.container = this.AddElement("div", document.body);
		this.container.classList.add("background-overlay");
		this.container.style.zIndex = 6;
		this.dice = new DICE.dice_box(this.container);
		this.dice.owner = this.self;
		this.dice.setDice(this.dicestart);

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
		this.picker.randomize(65, 85, 80, 100);
		this.picker.owner = this.self;
		this.picker.option('onChange', function() {
			this.owner.PickerInput(this);
		});
		this.color = this.picker.toHEXString();

		this.dice.start_throw();
		this.dice.change_dice_color(this.color, this.picker.isLight());
		this.dice.start_throw();
	}

	PickerInput(picker) {
		this.SetColor(this.picker.toHEXString());
		this.dice.change_dice_color(this.color, this.picker.isLight());
		this.RollFresh();
	}

	//receives the message that a new die has been created
	NewDice(dice) {}

	handleEvent(e) {
		if ( e.target == this.rollbutton ) {
			this.RollNow();
		}
		else if ( e.target == this.dicebutton ) {
			let s = prompt(`Enter dice in the format [Number][Type] + [Number][Type]`, this.dicestart);
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
		this.dice.start_throw();
	}

	//dice can move pages
	HandleMove(w) {
		let x = this.container.getBoundingClientRect().left;
		//set new location
		x -= w;
		//transition for smooth page move
		$(this.container).css({
			'left': x,
			'transition': "left 0.5s",
		});
		UIObj.prototype.HandleMove.call(this, w);
	}

	SpaceBar() {
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
