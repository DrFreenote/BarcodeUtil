const bcpatlist = [0b11011001100,0b11001101100,0b11001100110,0b10010011000,0b10010001100,0b10001001100,0b10011001000,0b10011000100,0b10001100100,0b11001001000,0b11001000100,0b11000100100,0b10110011100,0b10011011100,0b10011001110,0b10111001100,0b10011101100,0b10011100110,0b11001110010,0b11001011100,0b11001001110,0b11011100100,0b11001110100,0b11101101110,0b11101001100,0b11100101100,0b11100100110,0b11101100100,0b11100110100,0b11100110010,0b11011011000,0b11011000110,0b11000110110,0b10100011000,0b10001011000,0b10001000110,0b10110001000,0b10001101000,0b10001100010,0b11010001000,0b11000101000,0b11000100010,0b10110111000,0b10110001110,0b10001101110,0b10111011000,0b10111000110,0b10001110110,0b11101110110,0b11010001110,0b11000101110,0b11011101000,0b11011100010,0b11011101110,0b11101011000,0b11101000110,0b11100010110,0b11101101000,0b11101100010,0b11100011010,0b11101111010,0b11001000010,0b11110001010,0b10100110000,0b10100001100,0b10010110000,0b10010000110,0b10000101100,0b10000100110,0b10110010000,0b10110000100,0b10011010000,0b10011000010,0b10000110100,0b10000110010,0b11000010010,0b11001010000,0b11110111010,0b11000010100,0b10001111010,0b10100111100,0b10010111100,0b10010011110,0b10111100100,0b10011110100,0b10011110010,0b11110100100,0b11110010100,0b11110010010,0b11011011110,0b11011110110,0b11110110110,0b10101111000,0b10100011110,0b10001011110,0b10111101000,0b10111100010,0b11110101000,0b11110100010,0b10111011110,0b10111101110,0b11101011110,0b11110101110,0b11010000100,0b11010010000,0b11010011100,0b11000111010,0b11010111000,0b1100011101011];
const padding = Array(11).fill(false);

function printHandler() {
    document.getElementById("printable").contentWindow.print();
}

function textAreaUpdate() {
    const textarea = document.getElementById("textarea");
    let oldiframe = document.getElementById("printable");
    oldiframe.remove();

    const iframe = document.createElement("iframe");
    iframe.id = "printable";
    document.getElementById("content").appendChild(iframe);

    const style = document.createElement("style");
    style.textContent = `body {
text-align: center;
}`
    iframe.contentDocument.head.appendChild(style);

    const images = barcodeHandler(textarea.value);

    for (let i = 0; i < images.length; i++) {
        let image = document.createElement("img");
        let brln = document.createElement("br");

        image.setAttribute('src', images[i]);

        iframe.contentDocument.getElementsByTagName("body")[0].appendChild(image)
        iframe.contentDocument.getElementsByTagName("body")[0].appendChild(brln)
    }

    
}

function barcodeHandler(rawinput) {
    const cleaninput = cleanRawInput(rawinput);
    const splitinput = splitCleanInput(cleaninput);
    let imagelist = [];
    
    for (let i = 0; i < splitinput.length; i++) {
        if (splitinput[i] === "") { continue; } // Skip if line is empty
        const patternlist = buildBarcode(splitinput[i]);
        imagelist.push(drawBarcode(patternlist,splitinput[i]));
    }
    return imagelist;
}

function cleanRawInput(rawinput) {
    return rawinput.replace(/[^a-z0-9-!@#$%^&*()\n]/gim,"");
}

function splitCleanInput(cleaninput) {
    return cleaninput.toUpperCase().split("\n");
}

function buildBarcode(bcstring) {
    let patternlist = [];
    
    patternlist.push(...padding);
    patternlist.push(...patDecode(104));

    for (let i = 0; i < bcstring.length; i++) {
        patternlist.push(...patDecode(parseChar(bcstring[i])));
    }

    patternlist.push(...patDecode(checkSum(bcstring)));

    patternlist.push(...patDecode(108));
    patternlist.push(...padding);
    return patternlist;
}

function drawBarcode(patternlist,str) {
    const mult = 1;
    const barh = 50;
    const txth = 15;
    const txtp = 2;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = patternlist.length*mult;
    canvas.height = barh+txth+(txtp*2);

    ctx.fillStyle = "white";
    ctx.fillRect(0,0,patternlist.length*mult,barh+txth+(txtp*2));
    ctx.fillStyle = "black";

    for (let i = 0; i < patternlist.length; i++) {
        if (patternlist[i]) {
            ctx.fillRect(i*mult,0,1*mult,barh);
        }
    }

    ctx.font = `${txth}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText(str,(patternlist.length*mult)/2,barh+txth-txtp,patternlist.length*mult);

    const imagedata = canvas.toDataURL();
    canvas.remove();

    return imagedata;
}

function parseChar(char) {
    return trimCharCode(char.charCodeAt()) - 32;
}

function trimCharCode(code) {
    return code < 32 ? 31 : code > 126 ? 31 : code
}

function patDecode(index) {
    let pattmp = bcpatlist[index];
    let patlist = [];
    let bit = 0b1;
    while(pattmp) {
        patlist.unshift(pattmp & bit ? true : false); // Boolean check if the appropriate bit is flipped, place bit into list accordingly.
        pattmp = pattmp & ~bit; // Diminish pattmp into nothing per iteration
        bit = bit << 0b1; // Shift bit to check next bit
    }
    return patlist;
}

function checkSum(str) {
    let acc = 104;
    for (let i = 0; i < str.length; i++) {
        acc = ((acc + (parseChar(str[i])) * ( i + 1 )) % 103);
    }
    return acc;
}

document.addEventListener('DOMContentLoaded', (event) => {
    console.log("Loaded");
    textAreaUpdate();
})