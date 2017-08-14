SpriteMorph.prototype.tessel = {
    isDown: false,
    color: "ff00ff",
    size: 10,
    width: 20,
    height: 10
}



SpriteMorph.prototype.tesselDown = function () {
    console.log('tesselDown');
    this.tessel.isDown = true;
};

SpriteMorph.prototype.tesselSize = function (width, height) {
    console.log('tesselSize', width, height);

    this.tessel.width = Number(width);
    this.tessel.height = Number(height);
};

SpriteMorph.prototype.drawTessel = function(at, angle) {
    console.log("DrawTessel", at, angle);
    context = this.parent.penTrails().getContext('2d');
    context.fillStyle = 'blue';
    context.strokeStyle= 'red';
    context.save();

    context.translate(at.x, at.y);
    context.rotate(angle);
    // context.fillRect(0, 0, 10, 10);
    context.strokeRect(-this.tessel.width/2, -this.tessel.height/2, this.tessel.width, this.tessel.height);
    context.restore();
};

SpriteMorph.prototype.drawTesselLine = function (start, dest) {
    console.log("drawTesselLine", start, dest);
    var stagePos = this.parent.bounds.origin,
        stageScale = this.parent.scale,
        context = this.parent.penTrails().getContext('2d'),
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
            console.log(at);
            this.drawTessel(at, angle);
            //break;
        }

        if (this.isWarped === false) {
            this.world().broken.push(damaged);
        }
    }
};