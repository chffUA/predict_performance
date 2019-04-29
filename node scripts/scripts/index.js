require("dotenv").config();

const fs = require("fs");
const url = process.env.PROJECT_HOME;
const outurl = url+"node scripts/output.csv";
const notusedurl = url+"node scripts/notused.csv";

// this file creates the function+features+flags+performance table

let csv = fs.readFileSync(url+"node scripts/TEXAS42_MILEPOST_features.csv", "utf8");

let csv_rows = csv.split("\n");

let output = [];
let notused = "";

let flags = {};

function clear() {
    let keys = Object.keys(flags);
    for (let i=0; i<keys.length; i++) {
        flags[keys[i]] = 0;
    }
}

fs.readdirSync(url+"TEXAS_42_results_train").forEach(file => {
    if (file!=".DS_Store") {
        let f = fs.readFileSync(url+"TEXAS_42_results_train/"+file, "utf8");
        let json = JSON.parse(f);
        for (let i=0;i<json.results.length;i++) {
            for (let x=0;x<json.results[i].compilerSequence.length;x++) {
                if (!flags[json.results[i].compilerSequence[x]])
                    flags[json.results[i].compilerSequence[x]] = 0;
            }
        }
    }
});

for (let i=0;i<csv_rows.length;i++) {
    console.log((i+1)+"/"+csv_rows.length)
    let row = csv_rows[i].split(",");
    let res = "";

    if (i==0) { //header
        res = "function,";
        res += row.slice(1,row.length)+",";
        res = res.replace(/\r/g,"");
        let k = Object.keys(flags);
        for (let f=0;f<k.length;f++) {
            res += " "+k[f]+", ";
            if (f==k.length-1) res += "performance";
        }
        output.push(res);
    } else {
        let fn = row[0];
        let header = row[0]+",";
        header += row.slice(1,row.length)+",";
        header = header.replace(/\r/g,"");

        if (!fs.existsSync(url+"TEXAS_42_results_train/"+fn+"._dse_results.json")) {
            notused += fn+"\n";
            continue;
        }

        let f = fs.readFileSync(url+"TEXAS_42_results_train/"+fn+"._dse_results.json", "utf8");
        let json = JSON.parse(f);
        let aux = [];
        let max = 0;
        for (let y=0;y<json.results.length;y++) { //cada result   
            clear();
            res = header;
            for (let x=0;x<json.results[y].compilerSequence.length;x++) {
                flags[json.results[y].compilerSequence[x]] = 1;
            }
            if (json.results[y].values) {
                if (max<json.results[y].values[0]) max = json.results[y].values[0];
                let keys = Object.keys(flags);
                for (let z=0; z<keys.length; z++) {
                    res += flags[keys[z]]+", ";
                    if (z==keys.length-1) res += json.results[y].values[0];
                }
                aux.push(res);
            } else {
                let keys = Object.keys(flags);
                for (let z=0; z<keys.length; z++) {
                    res += flags[keys[z]]+", ";
                    if (z==keys.length-1) res += "undefined";
                }
                aux.push(res);
            }          
        }
        for (let q=0; q<aux.length; q++) {
            if (aux[q].endsWith("undefined")) {
                aux[q] = aux[q].replace("undefined", max+1); 
            }
        }

        output = output.concat(aux);
    }
    
}

/*for (let z=0;z<output.length;z++) {
    console.log("-> "+output[z])
}*/

fs.writeFileSync(outurl, output.join("\n"));
fs.writeFileSync(notusedurl, notused);