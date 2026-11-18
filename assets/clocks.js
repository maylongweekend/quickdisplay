//digital stopwatch
//AllObjects.push(new StopWatchObj());

class StopWatchObj extends MoveableObject {

	constructor() {
		super(true, true, false, true, true);//give font and color selection

		this.div.style.color = this.color;

		this.div.classList.add("digiclock-outer");
		this.laststart;
		this.count = 0;
		this.iscounting = false;

		this.div.innerHTML = `<span>0</span>:<span>000</span>`;

		this.isanimating = true;
		this.outerdiv.addEventListener('click', function(e) {this.owner.startstop();});
		this.outerdiv.addEventListener('dblclick', function(e) {this.owner.reset();});

		//set the font selector to the default font for text
		for ( let i = 0; i < this.fontselector.options.length; i++ ) {
			if ( this.fontselector.options[i].value.includes("Verdana") ) {
				this.fontselector.selectedIndex = i;
				this.font = this.fontselector.options[i].value;
			}
		}

		let li = AddContextItem(this.menu, "resettime", `<span class="material-symbols-outlined">timer_off</span>Reset timer`, true);
		li.owner = this.self;
		li.addEventListener('click', function() {
			$(".context").hide(100);
			this.owner.reset();
		});
	}

	SetFont(s) {
		MoveableObject.prototype.SetFont.call(this, s);
		this.div.style.fontFamily = this.font;
	}

	HandleInitialColor() {
		this.color = "#" + (Math.floor(Math.random() * 80) + 175).toString(16) + (Math.floor(Math.random() * 80) + 175).toString(16) + (Math.floor(Math.random() * 80) + 175).toString(16);
	}

	SetColor(s) {
		MoveableObject.prototype.SetColor.call(this, s);
		this.div.style.color = this.color;
	}

	startstop() {
		this.iscounting = !this.iscounting;
		if ( this.iscounting ) {
			this.laststart = Date.now();
		}
	}

	reset() {
		this.iscounting = false;
		this.count = 0;
		this.div.innerHTML = `<span>0</span>:<span>000</span>`;
	}

	Frame(delta) {
		if ( this.iscounting ) {
			let now = Date.now();
			this.count += now - this.laststart;
			this.laststart = now;

			let ms = this.count % 1000;
			let s = ( this.count - ms ) / 1000;
			let sr = s % 60;
			let m = ( s - sr ) / 60;

			let min = "" + m;
			let sec = "" + sr;
			let milli = "" + ms;

			while ( milli.length < 3 ) {
				milli = "0" + milli;
			}

			if ( m >= 1 ) {
				while ( sec.length < 2 ) {
					sec = "0" + sec;
				}
				this.div.innerHTML = `<span>${min}</span>:<span>${sec}</span>`;
			} else {
				this.div.innerHTML = `<span>${sec}</span>:<span>${milli}</span>`;
			}
		}
	}
}

class TimerObj extends StopWatchObj {

	constructor() {
		super();
		this.startcount = this.GetSeconds(prompt(`Enter your start time in seconds, or enter minutes followed by the letter "m".`, "10"));
		this.count = this.startcount * 1000;

		this.div.innerHTML = `<span>${this.startcount}s</span>`;

		let li = AddContextItem(this.menu, "resettime", `<span class="material-symbols-outlined">timer_arrow_down</span>Set new start time`, true);
		li.owner = this.self;
		li.addEventListener('click', function() {
			$(".context").hide(100);
			this.owner.startcount = this.owner.GetSeconds(prompt(`Enter your start time in seconds, or enter minutes followed by the letter "m".`, "10"));
			this.owner.reset();
		});
	}

	startstop() {
		this.iscounting = !this.iscounting;
	}

	reset() {
		this.iscounting = false;
		this.count = this.startcount * 1000;
		this.div.innerHTML = `<span>${this.startcount}s</span>`;
	}

	GetSeconds(s)
	{
		let c;
		while ( s.includes(" ") ) {
			s = s.replace(" ", "");
		}
		if ( s.includes("m") ) {
			s = s.replace("m", "");
			c = Number(s);
			c *= 60;
		} else {
			c = Number(s);
		}
		if ( c ) {
			return c;
		}
		return 10;
	}

	Frame(delta) {
		if ( this.iscounting ) {
			this.count -= delta;

			if ( this.count <= 0 ) {
				this.count = 0;
				this.iscounting = false;
				this.Done();
			}

			let ms = this.count % 1000;
			let s = ( this.count - ms ) / 1000;
			let sr = s % 60;
			let m = ( s - sr ) / 60;

			let min = "" + m;
			let sec = "" + sr;
			let milli = "" + ms;

			while ( milli.length < 3 ) {
				milli = "0" + milli;
			}

			let inner;

			//if we've reached a minute, include minute counter and tens digit in seconds
			if ( m >= 1 ) {
				while ( sec.length < 2 ) {
					sec = "0" + sec;
				}
				inner = `<span>${min}</span>:<span>${sec}</span>`;
			} else {
				inner = `<span>${sec}</span>:<span>${milli}</span>`;
			}

			this.div.innerHTML = inner;
		}
	}

	//TODO: add effect here?
	Done() {}
}


//digital clock
//AllObjects.push(new DigiClockObj());

class DigiClockObj extends MoveableObject {

	constructor() {
		super(true, true, false, true, true);//give font and color selection

		this.div.classList.add("digiclock-outer");
		this.div.innerHTML = `<span>00</span>:<span>00</span>`;
		this.div.style.color = this.color;

		//set the font selector to the default font for text
		for ( let i = 0; i < this.fontselector.options.length; i++ ) {
			if ( this.fontselector.options[i].value.includes("Verdana") ) {
				this.fontselector.selectedIndex = i;
				this.font = this.fontselector.options[i].value;
			}
		}

		this.Timer();
	}

	SetFont(s) {
		MoveableObject.prototype.SetFont.call(this, s);
		this.div.style.fontFamily = this.font;
	}

	HandleInitialColor() {
		this.color = "#" + (Math.floor(Math.random() * 80) + 175).toString(16) + (Math.floor(Math.random() * 80) + 175).toString(16) + (Math.floor(Math.random() * 80) + 175).toString(16);
	}

	SetColor(s) {
		MoveableObject.prototype.SetColor.call(this, s);
		this.div.style.color = this.color;
	}

	Timer() {
		let t = new Date();
		let h = t.getHours();
		let m = t.getMinutes();
		let p = "PM";
		let s = this.self;
		if ( h > 12 ) {
			h -= 12;
		} else if ( h < 12 ) {
			p = "AM";
		}
		if ( h == 0 ) {
			h = 12;
		}
		m = ( m < 10 ) ? "0" + m : m;

		this.div.innerHTML = `<span>${h}</span>:<span>${m} ${p}</span>`;
		setTimeout(function() {s.Timer();}, 1000);
	}
}
