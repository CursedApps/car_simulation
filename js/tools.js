randomNumber = function (min, max) {
        if (min == max) {
        return (min)
    }
    var random = Math.random()
    return ((random * (max - min)) + min)
};


getHeightAtPoint = function(x, z, show = false) {

    var origin = new BABYLON.Vector3(x, 0, z)
    var forward = new BABYLON.Vector3(0, 1, 0)

    var length = 1000

    var ray = new BABYLON.Ray(origin, forward, length)

    if(show) {
        let rayHelper = new BABYLON.RayHelper(ray);
        rayHelper.show(scene);
    }

    var hit = scene.pickWithRay(ray)

    return hit.distance
}

getPointsAroundCircle = function(n, radius) {
    let points = []

    if( n === 1)
        return [(0, 0, 0)]

    for (let k = 0; k < n; k++) {
        x = radius * Math.cos(k * 2 * Math.PI / n)
        y = 0
        z = radius * Math.sin(k * 2 * Math.PI / n)
        points.push(new BABYLON.Vector3(x, y, z))
    }

    return points
}

getPointsAroundCar = function(n, width, length) {
    let points = []

    if( n === 1)
        return [new BABYLON.Vector3(0, 0, 0)]

    let xLeft = -width
    let xRight = width

    nSideWheels = Math.floor(n / 2)

    lengthSegment = 2 * length / nSideWheels
    halfSegment = lengthSegment / 2

    let y = 0
    for (let k = 0; k < Math.floor(nSideWheels) / 2; k++) {
        let z = k * lengthSegment + lengthSegment / 2
        points.push(new BABYLON.Vector3(xLeft , y,  z))
        points.push(new BABYLON.Vector3(xLeft , y, -z))
        points.push(new BABYLON.Vector3(xRight, y,  z))
        points.push(new BABYLON.Vector3(xRight, y, -z))
    }

    if (n % 2 === 1) {
        points.push(new BABYLON.Vector3(xLeft, y, 0))
    }

    return points

}