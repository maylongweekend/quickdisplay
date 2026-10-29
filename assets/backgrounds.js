/* THE BASE BACKGROUND CLASS */
//a full-screen div
//subclasses handle specific implementation of various features

class BackgroundLayer {
    
    constructor(isanimating = false, hasui = false) {
        this.isanimating = isanimating;
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
        //create the div
        this.div = document.createElement("div");
        this.div.classList.add("background-overlay");
        document.body.appendChild(this.div);
        this.div.owner = this.self;
    }

    //called by child class to build the ui elements
    //use AddElement("type", to) to build
    initUI() {}

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

    //handles passing event listeners to child classes
    //use switch ( e.type ) to detect eg "click" and call function on this
    //you can pass the background to the ui to make ui clicks come back here
    handleEvent(e) {}

    remove() {
        this.div.remove();
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


/* CANVASLAYER */
//a background that holds a canvas object
//AllBackgrounds.push(new CanvasLayer());

class CanvasLayer extends BackgroundLayer {
    
    CreateHTMLStructure() {
        //create the canvas
        this.canvas = document.createElement("canvas");
        document.body.appendChild(this.canvas);
        this.canvas.owner = this.self;
    }

    remove() {
        this.canvas.remove();
        AllBackgrounds.splice(this.index, 1);
    }
}


class ColorGradientLayer extends CanvasLayer {

}