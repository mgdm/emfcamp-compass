let currentLocation = [-2.3771088, 52.0407325];
let pointMap;

function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in metres
}

function directionInDegrees(lat1, lon1, lat2, lon2) {
    const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
    const φ2 = lat2 * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) -
        Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    const θ = Math.atan2(y, x);
    return (θ * 180 / Math.PI + 360) % 360; // in degrees
}

async function getPoints() {
    const data = await fetch("data.json")
    const features = await data.json();
    const points = features.features.map(f => [f.properties.name, { location: f.geometry.coordinates }]);
    const pointMap = new Map(points);
    return pointMap;
}

function findClosest(location, pointMap) {
    for (const [name, point] of pointMap) {
        const distance = haversine(location[1], location[0], point.location[1], point.location[0]);
        const bearing = directionInDegrees(location[1], location[0], point.location[1], point.location[0]);
        const direction = mapDegreesToHexDirection(bearing);
        point.distance = distance;
        point.bearing = bearing;
        point.direction = direction;
    }

    const closest = Array.from(pointMap).sort((a, b) => a[1].distance - b[1].distance);
    return closest.slice(0, 10);
}

function mapDegreesToHexDirection(bearing) {
    if (bearing > 0 && bearing < 45) {
        return "tr";
    }
    if (bearing >= 45 && bearing < 135) {
        return "mr";
    }
    if (bearing >= 135 && bearing < 180) {
        return "br";
    }
    if (bearing >= 180 && bearing < 225) {
        return "bl";
    }
    if (bearing >= 225 && bearing < 315) {
        return "ml";
    }
    if (bearing >= 315) {
        return "tl";
    }
}

async function init() {
    pointMap = await getPoints();
    refresh();
}

async function refresh() {
    const closestPoints = findClosest(currentLocation, pointMap);
    const closest = closestPoints[0];

    document.getElementById("mc").innerHTML = closest[0];

    const directions = ["tl", "tr", "ml", "mr", "br", "bl"];
    const occupied = new Set();
    for (const point of closestPoints.slice(1)) {
        if (!occupied.has(point[1].direction) && point !== closest) {
            occupied.add(point[1].direction);
            document.getElementById(point[1].direction).innerHTML = point[0];
        }
    }

    for (const direction of directions) {
        if (!occupied.has(direction)) {
            document.getElementById(direction).innerHTML = "";
        }
    }
}

function checkKey(e) {
    if (e.keyCode == '38') {
        // up arrow
        currentLocation[1] += 0.0001;
        refresh();
    }
    else if (e.keyCode == '40') {
        // down arrow
        currentLocation[1] -= 0.0001;
        refresh();
    }
    else if (e.keyCode == '37') {
        // left arrow
        currentLocation[0] -= 0.0001;
        refresh();
    }
    else if (e.keyCode == '39') {
        // right arrow
        currentLocation[0] += 0.0001;
        refresh();
    }
}

document.onkeydown = checkKey;
init();