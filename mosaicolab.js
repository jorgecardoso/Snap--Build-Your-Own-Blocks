SpriteMorph.prototype.tessel = {
    isDown: false,
    color: "#ff00ff",
    width: 20,
    height: 10,
    lastTessel: null,
    lastStagePos: null,
    lastStageScale: null
}



SpriteMorph.prototype.tesselDown = function () {
    console.log('tesselDown');
    this.tessel.isDown = true;
    this.tessel.lastTessel = null;
};
SpriteMorph.prototype.tesselUp = function () {
    console.log('tesselUp');
    this.tessel.isDown = false;
    this.tessel.lastTessel = null;
};
SpriteMorph.prototype.tesselColor = function (color) {
    console.log('tesselColor', color);
    this.tessel.color = color;
};

SpriteMorph.prototype.tesselSize = function (width, height) {
    console.log('tesselSize', width, height);

    this.tessel.width = Number(width);
    this.tessel.height = Number(height);
};

SpriteMorph.prototype.drawTessel = function(at, angle) {
    console.log("DrawTessel", at, angle);
    var ctx = this.parent.penTrails().getContext('2d');
    ctx.save();
    ctx.fillStyle = this.tessel.color;
    ctx.strokeStyle= 'black';
    ctx.lineWidth = 0.1;


    var rX = Math.random()*this.tessel.width*0.2;
    var rY = Math.random()*this.tessel.height*0.2;
    var p1 = new Point(-this.tessel.width/2+rX, -this.tessel.height/2+rY);
    var p2 = new Point(this.tessel.width/2-rX, -this.tessel.height/2+rY);
    var p3 = new Point(this.tessel.width/2-rX, this.tessel.height/2-rY);
    var p4 = new Point( -this.tessel.width/2+rY, this.tessel.height/2-rY);

    ctx.translate(at.x, at.y);
    ctx.rotate(angle);

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    this.tesselLine(ctx, p1.x, p1.y, p2.x, p2.y);
    this.tesselLine(ctx, p2.x, p2.y, p3.x, p3.y);
    this.tesselLine(ctx, p3.x, p3.y, p4.x, p4.y);
    this.tesselLine(ctx, p4.x, p4.y, p1.x, p1.y);
    ctx.closePath(); // draws last line of the triangle
    ctx.fill();
    ctx.stroke();

   // ctx.strokeRect(-this.tessel.width/2, -this.tessel.height/2, this.tessel.width, this.tessel.height);
    ctx.restore();
};

SpriteMorph.prototype.tesselLine = function(ctx, x1, y1, x2, y2) {
var n = 2;
    for ( var i = 0; i < n; i++ ) {
        var nX = x1+i*(x2-x1)/n+Math.random()*2-1;
        var nY = y1+i*(y2-y1)/n+Math.random()*2-1;
        ctx.lineTo(nX, nY);
    }
};

SpriteMorph.prototype.drawTesselLine = function (start, dest) {
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


    var   context = this.parent.penTrails().getContext('2d'),
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


        var incX = (to.x-from.x)/dist;
        var incY = (to.y-from.y)/dist;
        for (var i = 0; i <= dist-this.tessel.width; i+=this.tessel.width ) {
            var x = from.x+(incX*this.tessel.width/2)+i*incX;
            var y = from.y+(incY*this.tessel.width/2)+i*incY;
            var at = new Point(x, y);
            this.tessel.lastTessel = at.add(new Point(incX*this.tessel.width, incY*this.tessel.width)).subtract(new Point(incX*this.tessel.width/2, incY*this.tessel.width/2)).multiplyBy(stageScale).add(stagePos);
            this.tessel.lastStagePos = stagePos.copy();
            this.tessel.lastStageScale = stageScale;
            console.log("last tessel: ", this.tessel.lastTessel);
            console.log(at);
            this.drawTessel(at, angle);
            //break;
        }

        if (this.isWarped === false) {
            this.world().broken.push(damaged);
        }
    }
};


SpriteMorph.prototype.mosaicPrepareToBeGrabbed = function (hand) {
    console.log("SpriteMorph.prototype.mosaicPrepareToBeGrabbed");
  this.tessel.lastTessel = null;
};

SpriteMorph.prototype.mosaicDrawNew = function () {
   // this.tessel.lastTessel = null;
}