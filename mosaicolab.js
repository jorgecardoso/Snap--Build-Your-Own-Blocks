(function () {

    SpriteMorph.prototype.categories =
        [
            'motion',
            'control',
            'looks',
            'sensing',
            'sound',
            'operators',
            'pen',
            'mosaic',
            'variables',
            'lists',
            'other'
        ];


    SpriteMorph.prototype.blockColor = {
        motion: new Color(74, 108, 212),
        looks: new Color(143, 86, 227),
        sound: new Color(207, 74, 217),
        pen: new Color(0, 161, 120),
        mosaic: new Color(255, 30, 30),
        control: new Color(230, 168, 34),
        sensing: new Color(4, 148, 220),
        operators: new Color(98, 194, 19),
        variables: new Color(243, 118, 29),
        lists: new Color(217, 77, 17),
        other: new Color(150, 150, 150)
    };

    var currentInitBlocks = SpriteMorph.prototype.initBlocks;
    SpriteMorph.prototype.initBlocks = function () {
        console.log("SpriteMorph.prototype.initBlocks");
        currentInitBlocks.call(this);


        // Mosaics
        SpriteMorph.prototype.blocks.tesselDown = {
            only: SpriteMorph,
            type: 'command',
            category: 'mosaic',
            spec: 'tessel down'
        };
        SpriteMorph.prototype.blocks.tesselUp = {
            only: SpriteMorph,
            type: 'command',
            category: 'mosaic',
            spec: 'tessel up'
        };
        SpriteMorph.prototype.blocks.tesselColor = {
            only: SpriteMorph,
            type: 'command',
            category: 'mosaic',
            spec: 'set tessel color to %clr'
        };
        SpriteMorph.prototype.blocks.getTesselColor = {
            only: SpriteMorph,
            dev: false,
            type: 'reporter',
            category: 'mosaic',
            spec: 'the current tessel color'
        };
        SpriteMorph.prototype.blocks.tesselSize = {
            only: SpriteMorph,
            type: 'command',
            category: 'mosaic',
            spec: 'set tessel size to width: %n and height: %n',
            defaults: [20, 20]
        };
        SpriteMorph.prototype.blocks.tesselFormat = {
            only: SpriteMorph,
            type: 'command',
            category: 'mosaic',
            spec: "set tessel format to %tesselFormat",
        };
    }
    SpriteMorph.prototype.initBlocks();

    var currentBlockTemplates = SpriteMorph.prototype.blockTemplates;
    SpriteMorph.prototype.blockTemplates = function (category) {
        console.log("SpriteMorph.prototype.blockTemplates", category);
        var blocks = currentBlockTemplates.call(this, category);

        function block(selector, isGhosted) {
            if (StageMorph.prototype.hiddenPrimitives[selector]) {
                return null;
            }
            var newBlock = SpriteMorph.prototype.blockForSelector(selector, true);
            newBlock.isTemplate = true;
            if (isGhosted) {
                newBlock.ghost();
            }
            return newBlock;
        }

        if (category === 'mosaic') {
            blocks.push(block('tesselDown'));
            blocks.push(block('tesselUp'));
            blocks.push('-');
            blocks.push(block('tesselColor'));
            blocks.push(block('getTesselColor'));
            blocks.push('-');
            blocks.push(block('tesselSize'));
            blocks.push(block('tesselFormat'));
        }
        return blocks;
    }

    var currentFullCopy = SpriteMorph.prototype.fullCopy;
    SpriteMorph.prototype.fullCopy = function (forClone) {
        var c = currentFullCopy.call(this, forClone);
        c.tessel = JSON.parse(JSON.stringify(this.tessel));
        return c;
    }


    var currentMoveBy = SpriteMorph.prototype.moveBy;
    SpriteMorph.prototype.moveBy = function (delta, justMe) {
        console.log("SpriteMorph.prototype.moveBy", delta, justMe);

        // for mosaic drawing the pen does not have to be down
        var startMosaic = !justMe && this.parent ?
            this.rotationCenter() : null;

        currentMoveBy.call(this, delta, justMe);

        if (this.tessel.isDown && startMosaic) {
            console.log("moveBy tessel is down");
            drawTesselLine.call(this, startMosaic, this.rotationCenter());
        }
    };

    var currentPrepareToBeGrabbed = SpriteMorph.prototype.prepareToBeGrabbed;
    SpriteMorph.prototype.prepareToBeGrabbed = function (hand) {
        console.log("SpriteMorph.prototype.prepareToBeGrabbed");
        currentPrepareToBeGrabbed.call(this, hand);
        this.tessel.lastTessel = null;
    };


    var currentLabelPart = SyntaxElementMorph.prototype.labelPart;
    SyntaxElementMorph.prototype.labelPart = function (spec) {
        console.log("SyntaxElementMorph.prototype.labelPart", spec);
        var currentPart = currentLabelPart.call(this, spec);

        if (currentPart === undefined) {
            var part, tokens;
            if (spec[0] === '%' &&
                spec.length > 1 &&
                (this.selector !== 'reportGetVar' ||
                    (spec === '%turtleOutline' && this.isObjInputFragment()))) {



                // single-arg and specialized multi-arg slots:
                switch (spec) {

                    case '%tesselFormat':
                        part = new InputSlotMorph(
                            null,
                            false,
                            {
                                'square': localize('square'),
                                'triangle' : localize('triangle'),
                                'trapezoid' : localize('trapezoid')

                            },
                            true
                        );
                        part.setContents(localize('square'));
                        break;

                    default:
                        nop();
                }
            }
            return part;
        } else {
            return currentPart;
        }
    };

    SpriteMorph.prototype.tessel = {
        isDown: false,
        color: "#000000",
        width: 20,
        height: 20,
        format: localize('square'),
        lastTessel: null,
        lastStagePos: null,
        lastStageScale: null
    }


    SpriteMorph.prototype.tesselDown = function () {
        console.log('tesselDown');
        this.tessel.isDown = true;

    };
    SpriteMorph.prototype.tesselUp = function () {
        console.log('tesselUp');
        this.tessel.isDown = false;
        this.tessel.lastTessel = null;
    };
    SpriteMorph.prototype.tesselColor = function (color) {
        console.log(this.name + ' tesselColor', color);
        this.tessel.color = color;
    };

    SpriteMorph.prototype.getTesselColor = function () {
        console.log(this.name + ' getTesselColor', this.tessel.color);
        return this.tessel.color;
    };

    SpriteMorph.prototype.tesselSize = function (width, height) {
        console.log('tesselSize', width, height);

        this.tessel.width = Number(width);
        this.tessel.height = Number(height);
    };
    SpriteMorph.prototype.tesselFormat = function (format) {
        console.log('tesselFormat', format);

        switch(format) {
            case localize('square') :
                this.tessel.format = 'square';
                break;
            case localize('triangle') :
                this.tessel.format = 'triangle';
                break;
            case localize('trapezoid') :
                this.tessel.format = 'trapezoid';
                break;
        }

    };

    function drawSquareTessel(ctx) {
        console.log("drawSquareTessel", ctx)
        var rX = Math.random() * this.tessel.width * 0.1;
        var rY = Math.random() * this.tessel.height * 0.1;
        var p1 = new Point(-this.tessel.width / 2 + rX, -this.tessel.height / 2 + rY);
        var p2 = new Point(this.tessel.width / 2 - rX, -this.tessel.height / 2 + rY);
        var p3 = new Point(this.tessel.width / 2 - rX, this.tessel.height / 2 - rY);
        var p4 = new Point(-this.tessel.width / 2 + rY, this.tessel.height / 2 - rY);

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        tesselEdge(ctx, p1.x, p1.y, p2.x, p2.y);
        tesselEdge(ctx, p2.x, p2.y, p3.x, p3.y);
        tesselEdge(ctx, p3.x, p3.y, p4.x, p4.y);
        tesselEdge(ctx, p4.x, p4.y, p1.x, p1.y);
        ctx.closePath(); // draws last line of the triangle
        ctx.fill();
        //ctx.stroke();
    }

    function drawTrapezoidTessel(ctx) {
        console.log("drawTrapezoidTessel", ctx);
        var rX = Math.random() * this.tessel.width * 0.1;
        var rY = Math.random() * this.tessel.height * 0.1;
        var p1 = new Point(-this.tessel.width / 4 + rX, -this.tessel.height / 2 + rY);
        var p2 = new Point(this.tessel.width / 4 - rX, -this.tessel.height / 2 + rY);
        var p3 = new Point(this.tessel.width / 2 - rX, this.tessel.height / 2 - rY);
        var p4 = new Point(-this.tessel.width / 2 + rY, this.tessel.height / 2 - rY);

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        tesselEdge(ctx, p1.x, p1.y, p2.x, p2.y);
        tesselEdge(ctx, p2.x, p2.y, p3.x, p3.y);
        tesselEdge(ctx, p3.x, p3.y, p4.x, p4.y);
        tesselEdge(ctx, p4.x, p4.y, p1.x, p1.y);
        ctx.closePath(); // draws last line of the triangle
        ctx.fill();
        //ctx.stroke();
    }

    function drawTriangleTessel(ctx) {
        console.log("drawTriangleTessel", ctx);
        var rX = Math.random() * this.tessel.width * 0.1;
        var rY = Math.random() * this.tessel.height * 0.1;
        var p1 = new Point( rX, -this.tessel.height / 2 + rY);
        var p2 = new Point(this.tessel.width / 2 - rX, this.tessel.height / 2 - rY);
        var p3 = new Point(-this.tessel.width / 2 + rX, this.tessel.height / 2 - rY);


        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        tesselEdge(ctx, p1.x, p1.y, p2.x, p2.y);
        tesselEdge(ctx, p2.x, p2.y, p3.x, p3.y);
        tesselEdge(ctx, p3.x, p3.y, p1.x, p1.y);

        ctx.closePath(); // draws last line of the triangle
        ctx.fill();
        ctx.stroke();
    }

    var drawTessel = function (at, angle) {
        console.log("DrawTessel", at, angle);
        var ctx = this.parent.penTrails().getContext('2d');
        ctx.save();
        ctx.fillStyle = this.tessel.color;
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.translate(at.x, at.y);
        ctx.rotate(angle);

        switch(this.tessel.format) {
            case 'square' :
                drawSquareTessel.call(this, ctx);
                break;
            case 'triangle' :
                drawTriangleTessel.call(this, ctx);
                break;
            case 'trapezoid' :
                drawTrapezoidTessel.call(this, ctx);
                break;
        }


        //ctx.strokeRect(-this.tessel.width/2, -this.tessel.height/2, this.tessel.width, this.tessel.height);
        ctx.restore();
    };

    var tesselEdge = function (ctx, x1, y1, x2, y2) {
        var n = 2;
        for (var i = 0; i < n; i++) {
            var nX = x1 + i * (x2 - x1) / n + Math.random() * 2 - 1;
            var nY = y1 + i * (y2 - y1) / n + Math.random() * 2 - 1;
            ctx.lineTo(nX, nY);
        }
    };

    var drawTesselLine = function (start, dest) {
        console.log("drawTesselLine", start, dest);

        var stagePos = this.parent.bounds.origin,
            stageScale = this.parent.scale;
        console.log(stagePos, stageScale);

        //this.tessel.lastTessel = null;
        if (this.tessel.lastTessel === null) {
            this.tessel.lastTessel = start;
            this.tessel.lastStagePos = stagePos.copy();
            this.tessel.lastStageScale = stageScale;
            console.log("drawTesselLine reset last tessel", start);
        } else {
            start = this.tessel.lastTessel;
            console.log("last tessel: ", start);
            start = start.subtract(this.tessel.lastStagePos).divideBy(this.tessel.lastStageScale).multiplyBy(stageScale).add(stagePos);
            //start.multiplyBy(stageScale).add(stagePos);
        }


        console.log("drawTesselLine", start, dest);


        var context = this.parent.penTrails().getContext('2d'),
            from = start.subtract(stagePos).divideBy(stageScale),
            to = dest.subtract(stagePos).divideBy(stageScale),
            damagedFrom = from.multiplyBy(stageScale).add(stagePos),
            damagedTo = to.multiplyBy(stageScale).add(stagePos),
            damaged = damagedFrom.rectangle(damagedTo).expandBy(
                Math.max(this.size * stageScale / 2, 1)
            ).intersect(this.parent.visibleBounds()).spread();


        if (this.tessel.isDown && this.tessel.width > 0) {
            var dist = from.distanceTo(to);

            var angle = to.subtract(from).theta();
            console.log(dist);
            console.log(this.tessel.width, this.tessel.height);


            var incX = (to.x - from.x) / dist;
            var incY = (to.y - from.y) / dist;
            for (var i = 0; i <= dist - this.tessel.width; i += this.tessel.width) {
                var x = from.x + (incX * this.tessel.width / 2) + i * incX;
                var y = from.y + (incY * this.tessel.width / 2) + i * incY;
                var at = new Point(x, y);
                this.tessel.lastTessel = at.add(new Point(incX * this.tessel.width, incY * this.tessel.width)).subtract(new Point(incX * this.tessel.width / 2, incY * this.tessel.width / 2)).multiplyBy(stageScale).add(stagePos);
                this.tessel.lastStagePos = stagePos.copy();
                this.tessel.lastStageScale = stageScale;
                console.log("last tessel: ", this.tessel.lastTessel);
                console.log(at);
                drawTessel.call(this, at, angle);
                //break;
            }

            if (this.isWarped === false) {
                if (this.world()) {
                    this.world().broken.push(damaged);
                }
            }
        }
    };
})();
