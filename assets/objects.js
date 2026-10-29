//UI
//a ui object
//AllObjects.push(new UIObj());

class UIObj extends MoveableObject {
    constructor() {
        super();

        this.div.classList.add("ui-div");
    }

    handleEvent(e) {}
}


//STICKY NOTES
//a sticky note with editable text
//AllObjects.push(new StickyNoteObj(string));

class StickyNoteObj extends MoveableObject {

    constructor(text = "") {
        super(true, true, true, true, true, true);

        //build sticky note structure
        this.text = text.length > 0 ? text : prompt("Enter your text", "Sticky note contents");
        this.div.classList.add('sticky-div');
        this.stp = document.createElement("p");
        this.stint = document.createElement("div");
        let stdiv = document.createElement("div");
        let randnum = Math.floor(Math.random() * 10) + 2;
        randnum *= Math.random() < 0.5? -1 : 1;
        $(stdiv).css('transform', `rotate(${randnum}deg)`);
        this.div.appendChild(stdiv);
        stdiv.classList.add("sticky-note");
        this.stint.classList.add("sticky-interior");
        this.stint.style.backgroundColor = this.color;
        stdiv.appendChild(this.stint);
        this.stp.textContent = this.text;
        this.stint.appendChild(this.stp);
        let sttop = document.createElement("div");
        sttop.classList.add("sticky-top");
        stdiv.appendChild(sttop);

        //set the font selector to the default font for notes
        for ( let i = 0; i < this.fontselector.options.length; i++ ) {
            if ( window.getComputedStyle(document.body).getPropertyValue('--note-font').includes(this.fontselector.options[i].value) ) {
                this.fontselector.selectedIndex = i;
                this.font = this.fontselector.options[i].value;
            }
        }
    }

    //animate for rainbow effect
    Frame(delta) {
        this.anicolor.h = ( this.anicolor.h + 1.5 )  % 360;
        this.stint.style.backgroundColor = `hsla(${this.anicolor.h}, ${this.anicolor.s}%, ${this.anicolor.l}%, ${this.anicolor.a})`;
    }

    ToggleAnimate() {
        MoveableObject.prototype.ToggleAnimate.call(this);
        if ( !this.isanimating ) {
            this.stint.style.backgroundColor = this.color;
        }
    }

    HandleInitialColor() {
        //get random sticky color
        this.color = window.getComputedStyle(document.body).getPropertyValue(`--sticky-c${Math.floor(Math.random() * 4) + 1}`);
        //animate color
        this.anicolor = {
            h: 283,
            s: 100,
            l: 70,
            a: 0.78
        };
    }

    HandleTextEdit() {
        MoveableObject.prototype.HandleTextEdit.call(this);
        this.stp.textContent = this.text;
    }

    SetColor(s) {
        MoveableObject.prototype.SetColor.call(this, s);
        this.stint.style.backgroundColor = this.color;
        this.stp.style.color = this.colorinput.isLight() ? 'var(--note-text)' : 'var(--note-text-light)';
    }

    SetFont(s) {
        MoveableObject.prototype.SetFont.call(this, s);
        this.stp.style.fontFamily = this.font;
    }
}


//NOTES
//a note with editable title
//AllObjects.push(new NoteObj(title, body));

class NoteObj extends MoveableObject {

    constructor(text = "Note", body = "Note body text") {
        super(true, true, true, true, true);

        //build note structure
        this.div.classList.add('notes');
        this.text = text;
        this.div.style.backgroundColor = this.color;
        this.h = document.createElement("h3");
        this.h.textContent = this.text;
        this.div.appendChild(this.h);
        this.pre = document.createElement("pre");
        this.div.appendChild(this.pre);
        this.body = body;
        this.pre.textContent = this.body;
        $(this.div).css('min-width', this.div.offsetWidth);//force min width

        //set the font selector to the default font for notes
        for ( let i = 0; i < this.fontselector.options.length; i++ ) {
            if ( window.getComputedStyle(document.body).getPropertyValue('--note-font').includes(this.fontselector.options[i].value) ) {
                this.fontselector.selectedIndex = i;
                this.font = this.fontselector.options[i].value;
            }
        }
    }

    HandleInitialColor() {
        this.color = window.getComputedStyle(document.body).getPropertyValue('--note-bg');
    }

    AssignMenuAction(li, elem, owner) {
        MoveableObject.prototype.AssignMenuAction.call(this, li, elem, owner);
        //after calling super, change edit text option to edit title
        if ( ( $(li).attr("data-action") ) == "edit" ) {
            li.innerHTML = `<span class="material-symbols-outlined">border_color</span>Edit title`;
        }
    }

    HandleTextEdit() {
        this.text = prompt("Enter a title for this note", this.text);
        this.h.textContent = this.text;
    }

    SetColor(s) {
        MoveableObject.prototype.SetColor.call(this, s);
        this.div.style.backgroundColor = this.color;
        this.pre.style.color = this.colorinput.isLight() ? 'var(--note-text)' : 'var(--note-text-light)';
        this.h.style.color = this.colorinput.isLight() ? 'var(--note-text)' : 'var(--note-text-light)';
    }

    SetFont(s) {
        MoveableObject.prototype.SetFont.call(this, s);
        this.h.style.fontFamily = this.font;
        this.pre.style.fontFamily = this.font;
    }
}

//EMOJIS
//a simple emoji
//AllObjects.push(new EmojiObj(text));
//TODO: right click changing emoji can't open emojipicker?

class EmojiObj extends MoveableObject {

    constructor(emoji = `🐱`) {
        super(true, true, false, false, false, false, true);
        this.emoji = emoji;
        this.div.classList.add('emoji-div');
        this.h = document.createElement("h");
        this.h.textContent = emoji;
        this.div.appendChild(this.h);
        this.NewSetScalable(true);
    }

    SetScalable(b) {}

    //fix emoji scaling in firefox
    //scale font size instead of div css scale
    NewSetScalable(b) {
        let h = this.h;
        if ( b ) {
            this.div.addEventListener('wheel',function ObjScale(event) {
                event.preventDefault();
                let dir = event.deltaY < 0 ? 1 : -1;
                let scale = Number($(h).css('font-size').replace("px", ""));
                scale += dir * 12;
                scale = Math.max(12, Math.min(255, scale));
                $(h).css('font-size', scale + "px");
            });
        } else {
            this.div.removeEventListener('wheel', ObjScale);
        }
        this.bscale = b;
    }
}


//TITLE TEXT
//a large fancy text item
//AllObjects.push(new TextObj(text));

class TextObj extends MoveableObject {

    constructor(text = "") {
        super(true, true, true, true, true, true);
        this.text = text.length > 0 ? text : prompt("Enter your text", "Welcome");
        this.div.classList.add('text-div');
        this.h = document.createElement("h");
        this.h.innerHTML = this.UpdateTextForAnimation(this.text);
        this.div.appendChild(this.h);
        this.NewSetScalable(true);

        this.aniIter = 0;
        this.aniLen = this.text.length;
        this.aniPhase = 360 / this.aniLen;
        this.aniSpans = this.h.children;

        //set the font selector to the default font for text
        for ( let i = 0; i < this.fontselector.options.length; i++ ) {
            if ( this.fontselector.options[i].value.includes("Archivo Black") ) {
                this.fontselector.selectedIndex = i;
                this.font = this.fontselector.options[i].value;
            }
        }
    }

    //animate for rainbow effect
    Frame(delta) {
        for ( let i = 0; i < this.aniLen; i++ ) {
            //contains code adapted from Rainbow Text by Riley Shaw
            //https://codepen.io/rileyjshaw/pen/vExWpe
            this.aniSpans[i].style.color = 'hsl(' + (this.aniIter + Math.floor(-i * this.aniPhase)) + ', 70%, 70%)';
        }
        this.aniIter++;
    }

    UpdateTextForAnimation(string) {
        let s = string.split('').map(function(char) {
            return `<span>${char}</span>`;
        }).join('');
        return s;
    }

    ToggleAnimate() {
        MoveableObject.prototype.ToggleAnimate.call(this);
        if ( !this.isanimating ) {
            for ( let i = 0; i < this.aniLen; i++ ) {
                this.aniSpans[i].style.color = this.color;
            }
        }
    }

    SetScalable(b) {}

    //fix emoji scaling in firefox
    //scale font size instead of div css scale
    NewSetScalable(b) {
        let h = this.h;
        if ( b ) {
            this.div.addEventListener('wheel',function ObjScale(event) {
                event.preventDefault();
                let dir = event.deltaY < 0 ? 1 : -1;
                let scale = Number($(h).css('font-size').replace("px", ""));
                scale += dir * 12;
                scale = Math.max(12, Math.min(255, scale));
                $(h).css('font-size', scale + "px");
            });
        } else {
            this.div.removeEventListener('wheel', ObjScale);
        }
        this.bscale = b;
    }

    HandleInitialColor() {
        this.color = window.getComputedStyle(document.body).getPropertyValue('--note-text-light');
    }

        HandleTextEdit() {
        MoveableObject.prototype.HandleTextEdit.call(this);
        this.h.innerHTML = this.UpdateTextForAnimation(this.text);
        this.aniIter = 0;
        this.aniLen = this.text.length;
        this.aniPhase = 360 / this.aniLen;
        this.aniSpans = this.h.children;
    }

    SetColor(s) {
        MoveableObject.prototype.SetColor.call(this, s);
        this.h.style.color = this.color;
        for ( let i = 0; i < this.aniLen; i++ ) {
            this.aniSpans[i].style.color = this.color;
        }
    }

    SetFont(s) {
        MoveableObject.prototype.SetFont.call(this, s);
        this.h.style.fontFamily = this.font;
    }
}


//WINDOW SHARE
//a mirror of another window
//AllObjects.push(new WindowObj());

class WindowObj extends MoveableObject {

    constructor() {
        super();
        this.video = document.createElement("video");
        this.video.style.objectFit = "cover";
        this.video.style.zIndex = 1;
        this.video.autoplay = true;
        this.video.muted = true;
        this.div.appendChild(this.video);
        this.SetMenuItem();
        this.SetWindow();
    }

    SetMenuItem() {
        this.li = AddContextItem(this.menu, "neww", `<span class="material-symbols-outlined">video_frame_copy</span>Select window to share`, true);
        this.li.owner = this.self;
        this.li.addEventListener('click', function() {
            $(".context").hide(100);
            this.owner.SetWindow();
        });
    }

    SetWindow() {
        navigator.mediaDevices.getDisplayMedia(vidconstraints).then((value) => {this.handleSuccess(value);}).catch((value) => {this.handleError(value);});
    }

    handleSuccess(stream) {
        window.stream = stream;
        this.video.srcObject = stream;
    }

    handleError(error) {
        alert('Video stream error: \n'+ error);
    }
}


//CAMERA
//a window for the computer's attached camera
//AllObjects.push(new CameraObj());

class CameraObj extends WindowObj {

    SetMenuItem() {}

    SetWindow() {
        navigator.mediaDevices.getUserMedia(vidconstraints).then((value) => {this.handleSuccess(value);}).catch((value) => {this.handleError(value);});
    }
}


//IMAGE */
//a box that holds an image
//AllObjects.push(new ImageObj(src));

class ImageObj extends MoveableObject {

    constructor(src) {
        super(true, true, false, false, false, false, true);
        this.src = src;
        this.CreateVisual(src);
    }

    CreateVisual(src) {
        this.img = document.createElement("img");
        this.img.src = src;
        this.img.style.objectFit = "cover";
        this.img.style.zIndex = 1;
        this.div.appendChild(this.img);
    }
}


//VIDEO
//a box that holds a video
//AllObjects.push(new VideoObj(filesrc));

class VideoObj extends ImageObj {

    CreateVisual(src) {
        this.video = document.createElement("video");
        this.video.src = src;
        this.video.style.objectFit = "cover";
        this.video.style.zIndex = 1;
        this.video.autoplay = true;
        this.video.loop = true;
        this.video.muted = true;
        this.div.appendChild(this.video);
    }
}
