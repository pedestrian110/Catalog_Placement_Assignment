const fs = require('fs');

function convertToDecimal(base, value) {
    return BigInt(parseInt(value, base));
}

function modInverse(a, mod) {
    let [m0, x0, x1] = [mod, BigInt(0), BigInt(1)];
    if (mod === BigInt(1)) return BigInt(0);
    let tempA = a % mod;
    if (mod === BigInt(0)) {
        console.error(`Error: Modulus is zero in modInverse function`);
        return null;
    }
    while (tempA > BigInt(1)) {
        if (mod == 0) {
            break;
        }
        const q = tempA / mod;
        [mod, tempA] = [tempA % mod, mod];
        [x0, x1] = [x1 - q * x0, x0];
    }
    if (x1 < BigInt(0)) {
        x1 += m0;
    }
    return x1;
}

function lagrangeInterpolation(points, mod) {
    let constantTerm = BigInt(0);
    for (let i = 0; i < points.length; i++) {
        let term = points[i][1];
        for (let j = 0; j < points.length; j++) {
            if (i !== j) {
                const xi = points[i][0];
                const xj = points[j][0];
                const numerator = (BigInt(0) - xj);
                const denominator = xi - xj;
                if (denominator === BigInt(0)) {
                    console.error(`Error: Division by zero encountered at i = ${i}, j = ${j}`);
                    return null;
                }
                const denominatorInverse = modInverse(denominator, mod);
                if (denominatorInverse === null) {
                    return null;
                }
                term *= numerator * denominatorInverse;
                term %= mod;
            }
        }
        constantTerm += term;
        constantTerm %= mod;
    }
    return constantTerm;
}

fs.readFile('input.json', 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading JSON file:', err);
        return;
    }
    const input = JSON.parse(data);
    const { n, k } = input.keys;
    const points = [];
    for (const key in input) {
        if (key !== 'keys') {
            const x = BigInt(key);
            const base = parseInt(input[key].base);
            const value = input[key].value;
            const y = convertToDecimal(base, value);
            points.push([x, y]);
        }
    }
    console.log('Decoded points:', points);
    if (points.length >= k) {
        const requiredPoints = points.slice(0, k);
        const mod = BigInt(2 ** 256);
        const constant = lagrangeInterpolation(requiredPoints, mod);
        if (constant !== null) {
            console.log(`The constant term (c) is: ${constant}`);
        } else {
            console.log("Failed to compute the constant term due to an error.");
        }
    } else {
        console.log(`Not enough points! You need at least ${k} points but only have ${n}.`);
    }
});
