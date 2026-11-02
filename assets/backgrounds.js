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
        this.rotate.innerHTML = `<span class="material-symbols-outlined ui-span">rotate_right</span>`;
        this.rotate.classList.add("margin-10");
        this.hue = this.ui.AddElement("button", undefined, "click", this.self);
        this.hue.innerHTML = `<span class="material-symbols-outlined ui-span">palette</span>`;
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
        p.fromString(`rgba(${Math.floor(Math.random() * 256)},${Math.floor(Math.random() * 256)},${Math.floor(Math.random() * 256)},1.0)`);
        this.colors.push(p.toRGBAString());
        p.owner = this.self;
        p.index = this.pickers.length;
        p.option('onInput', function() {
            this.owner.SetColor(this.index, this.toRGBAString());
        });
    }

    SetColor(picker, string) {
        this.colors[picker - 1] = string;
    }

    //use switch ( e.type ) to detect eg "click" and call function on this
    //you can pass the background to the ui to make ui clicks come back here
    handleEvent(e) {
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
        }
    }

    Frame(delta) {

    }
}
