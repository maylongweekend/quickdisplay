//simple controller to roll the dice from dice.js
//AllObjects.push(new DiceRollerObj());

class DiceRollerObj extends UIObj {

	constructor() {
		super("Dice roller");

		this.dicestart = "1d6 + 1d20";

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
		this.dicebutton = this.AddElement("button", undefined, "click");
		this.dicebutton.innerHTML = `<span class="material-symbols-outlined ui-span">dashboard_customize</span>`;
		this.dicebutton.classList.add("margin-10");
	}

	//receives the message that a new die has been created
	NewDice(dice) {}

	handleEvent(e) {
		if ( e.target == this.rollbutton ) {
			this.dice.start_throw();
		}
		else if ( e.target == this.dicebutton ) {
			let s = prompt(`Enter dice in the format [Number][Type] + [Number][Type]`, this.dicestart);
			while ( s.includes(" ") ) {
				s = s.replace(" ", "");
			}
			this.dicestart = s;
			this.dice.setDice(this.dicestart);
		}
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
