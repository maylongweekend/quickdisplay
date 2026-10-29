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
        
        this.CreateHTMLStructure();
        if ( hasui )
        {
            this.ui = new UIObj();
            AllObjects.push(this.ui);
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
    initUI() {}

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

    Frame(delta) {

    }
}
