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
    //use AddElement, eg AddElement("button", , "click", this.self) to build
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
        let bgc = window.getComputedStyle(document.body).getPropertyValue('--ui-bg');
        let bdc = window.getComputedStyle(document.body).getPropertyValue('--ui-border-c');
        let p = new JSColor(b, {
            format: 'rgba',
            preset:'large',
            backgroundColor: bgc,
            borderColor: bdc,
            borderRadius: 5,
            padding: 15
        });
        this.pickers.push(p);
        jscolor.install();
        let color = {};
        color.r = Math.floor(Math.random() * 256);
        color.g = Math.floor(Math.random() * 256);
        color.b = Math.floor(Math.random() * 256);
        color.a = 1.0;
        color.rgba = `rgba(${color.r},${color.g},${color.b},${color.a})`;//friendly string
        RGBToHSL(color);//get HSL values
        p.fromString(color.rgba);
        this.colors.push(color);
        p.owner = this.self;
        p.index = this.pickers.length;
        p.option('onInput', function() {
            this.owner.SetColor(this);
        });
    }

    SetColor(picker) {
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
