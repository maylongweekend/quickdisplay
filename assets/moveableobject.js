//THE BASE OBJECT CLASS
//a moveable scalable div with various right click options
//subclasses handle specific implementation of various features

class MoveableObject {

    constructor(bdrag = true, bscale = true, btext = false, bcolor = false, bfont = false, banimate = false, blink = false) {

        this.self = this;
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

        //create the div and handle basic drag/scale settings
        this.div = document.createElement("div");
        this.div.classList.add("object-div");
        document.body.appendChild(this.div);
        $(this.div).draggable();
        this.SetDraggable(bdrag);
        this.SetScalable(bscale);
        $(this.div).css({
            top: rcloc.y,
            left: rcloc.x,
        });
        this.div.owner = this.self;

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
            let bgc = window.getComputedStyle(document.body).getPropertyValue('--ui-bg');
            let bdc = window.getComputedStyle(document.body).getPropertyValue('--ui-border-c');
            let ccli = AddContextItem(this.menu, "color", `<span class="material-symbols-outlined">colors</span>Change color`, true);
            this.colorinput = new JSColor(ccli, {
                previewElement: '',
                format: 'rgba',
                preset:'large',
                backgroundColor: bgc,
                borderColor: bdc,
                borderRadius: 5,
                padding: 15,
                onInput: `ColorUpdate(this, ${this.index})`
            });
            jscolor.install();
            this.HandleInitialColor();
            this.colorinput.fromString(this.color);
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
                case "lock":
                    if ( $(elem).draggable("option", "disabled") ) {
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
                case "hide":
                    $(elem).css('visibility','hidden');
                    break;
                case "reset":
                    $(elem).css('transform','scale(1)');
                    break;
                case "delete":
                    elem.remove();
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
        if ( this.isanimating ) {
            this.Frame(delta);
        }
    }

    //call on a child to handle animation
    Frame(delta) {}

    SetDraggable(b) {
        let s = b ? "enable" : "disable";
        $(this.div).draggable(s);
        this.bdrag = b;
    }

    SetScalable(b) {
        $(this.div).css('transform', 'scale(1)');
        if ( b ) {
            this.div.addEventListener('wheel',function ObjScale(event) {
                event.preventDefault();
                let dir = event.deltaY < 0 ? 1 : -1;
                let scale = this.getBoundingClientRect().width / this.offsetWidth;
                scale += dir * 0.1;
                scale = Math.max(0.1, Math.min(5, scale));
                $(this).css('transform', `scale(${scale})`);
            });
        } else {
            this.div.removeEventListener('wheel', ObjScale);
        }
        this.bscale = b;
    }

    remove() {
        this.div.remove();
        this.menu.remove();
        AllObjects.splice(this.index, 1);
    }
}
