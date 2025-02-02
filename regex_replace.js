class StringReplace {
    constructor() {
        let params = new URLSearchParams(window.location.search);
        if (params.has("rexp")) {
            document.getElementById("regex").value = params.get("rexp");
        }
        if (params.has("repw")) {
            document.getElementById("rwith").value = params.get("repw");
        }
        // if (params.has("text")) {
        //     document.getElementById("text").value = params.get("text");
        // }
    }
    
    onChangeTextInput() {



        let rexp = new RegExp(document.getElementById("regex").value,'gim');
        let repw = document.getElementById("rwith").value;
        let text = document.getElementById("input").value;
        
        console.log(rexp);
        console.log(repw);
        console.log(text);

        

        let array = [...text.matchAll(rexp)];
        let populate = "";

        for (var e in array) {
            console.log(array[e]);
            populate = populate + array[e][1] + "\n" + repw + "\n";
        }

        console.log(array);
        document.getElementById("output").value = populate;
    }
}

const regex_replace = new StringReplace();