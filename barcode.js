const bcpatlist = [0b11011001100,0b11001101100,0b11001100110,0b10010011000,0b10010001100,0b10001001100,0b10011001000,0b10011000100,0b10001100100,0b11001001000,0b11001000100,0b11000100100,0b10110011100,0b10011011100,0b10011001110,0b10111001100,0b10011101100,0b10011100110,0b11001110010,0b11001011100,0b11001001110,0b11011100100,0b11001110100,0b11101101110,0b11101001100,0b11100101100,0b11100100110,0b11101100100,0b11100110100,0b11100110010,0b11011011000,0b11011000110,0b11000110110,0b10100011000,0b10001011000,0b10001000110,0b10110001000,0b10001101000,0b10001100010,0b11010001000,0b11000101000,0b11000100010,0b10110111000,0b10110001110,0b10001101110,0b10111011000,0b10111000110,0b10001110110,0b11101110110,0b11010001110,0b11000101110,0b11011101000,0b11011100010,0b11011101110,0b11101011000,0b11101000110,0b11100010110,0b11101101000,0b11101100010,0b11100011010,0b11101111010,0b11001000010,0b11110001010,0b10100110000,0b10100001100,0b10010110000,0b10010000110,0b10000101100,0b10000100110,0b10110010000,0b10110000100,0b10011010000,0b10011000010,0b10000110100,0b10000110010,0b11000010010,0b11001010000,0b11110111010,0b11000010100,0b10001111010,0b10100111100,0b10010111100,0b10010011110,0b10111100100,0b10011110100,0b10011110010,0b11110100100,0b11110010100,0b11110010010,0b11011011110,0b11011110110,0b11110110110,0b10101111000,0b10100011110,0b10001011110,0b10111101000,0b10111100010,0b11110101000,0b11110100010,0b10111011110,0b10111101110,0b11101011110,0b11110101110,0b11010000100,0b11010010000,0b11010011100,0b11000111010,0b11010111000,0b1100011101011];
const padding = Array(11).fill(false);

function updateTextArea() {
    const textarea = document.getElementById("rawinput");
    const cleanlist = cleanInput(textarea.value);
    textarea.value = "";
    let bcimages = [];
    for (let i = 0; i < cleanlist.length; i++) {
        textarea.value = `${textarea.value}${cleanlist[i]}\n`;
        bcimages.push(barcodeGenerate(cleanlist[i]));
    }
    updateBarcodes(bcimages);
}

function updateBarcodes(bcimages) {
    let content = document.getElementById("barcodes");
    content.getElementsByTagName("span")[0].remove();
    let span = document.createElement("span");
    span.classList.add("barcodes");
    content.appendChild(span);

    for (let i = 0; i < bcimages.length; i++) {
        let image = document.createElement("img");
        let brln = document.createElement("br");

        image.setAttribute('src', bcimages[i]);

        content.getElementsByTagName("span")[0].appendChild(image)
        content.getElementsByTagName("span")[0].appendChild(brln)
    }

}

function cleanInput(str) {
    let a_values = str.replace(/\r/g, "").split(/\n/);
    for (let i = 0; i < a_values.length; i++) {
        a_values[i] = a_values[i].replace(/[^a-z0-9-!@#$%^&*() \n]/gim,"").trim()
        if (a_values[i] == '') { a_values.splice(i, 1); i-- }
    }
    return a_values;
}

function barcodeBuildPattern(str) {
    let indexlist = []; // Code B
    indexlist.push(104);
    indexlist.push(...stringToIndexList(str));
    indexlist.push(checkSum(indexlist));
    indexlist.push(108); // Stop pattern
    let pattern = [];
    pattern.push(...padding);
    pattern.push(...patternFromIndexList(indexlist));
    pattern.push(...padding);
    return pattern; // Is there a cleaner way to add the padding?
}

function barcodeGenerate(str, mult = 1, barh = 50, txth = 15, txtp = 2) {
    const patlist = barcodeBuildPattern(str);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = patlist.length*mult;
    canvas.height = barh+txth+(txtp*2);

    ctx.fillStyle = "white";
    ctx.fillRect(0,0,patlist.length*mult,barh+txth+(txtp*2));
    ctx.fillStyle = "black";

    for (let i = 0; i < patlist.length; i++) {
        if (patlist[i]) {
            ctx.fillRect(i*mult,0,1*mult,barh);
        }
    }

    ctx.font = `${txth}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText(str,(patlist.length*mult)/2,barh+txth-txtp,patlist.length*mult);

    const imagedata = canvas.toDataURL();
    canvas.remove();

    return imagedata;
}

function stringToIndexList(str) {
    let indexlist = [];
    for (let i = 0; i < str.length; i++) {
        indexlist.push(trimCharCode(str[i].charCodeAt()) - 32);
    }
    return indexlist;
}

function trimCharCode(code) {
    return code < 32 ? 32 : code > 126 ? 32 : code
}

function patternFromIndexList(indexlist) {
    let pattern = [];
    for (let i = 0; i < indexlist.length; i++) {
        pattern.push(...patternDecode(indexlist[i]));
    }
    return pattern;
}

// Hacky solution to getting the binary data from the pattern list into the correct order...
function patternDecode(index) {
    let pattmp = bcpatlist[index];
    let patlist = [];
    let bit = 0b1;
    while(pattmp) {
        patlist.unshift(pattmp & bit ? true : false); // Boolean check if the appropriate bit is flipped, place bit into list accordingly.
        pattmp = pattmp & ~bit; // Diminish pattmp into nothing per iteration
        bit = bit << 0b1; // Shift bit to check next bit
    }
    return patlist; // My brain hurts.
}

function checkSum(indexlist) {
    let check = indexlist[0] % 103;
    for (let i = 1; i < indexlist.length; i++) {
        check = ( check + ( indexlist[i] * i ) ) % 103;
    }
    return check;
}

