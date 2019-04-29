require("dotenv").config();

const fs = require("fs");
const url = process.env.PROJECT_HOME;
const outurl = url+"node scripts/smaller_output.csv";
const testurl = url+"node scripts/output_for_testing.csv";
const notusedurl = url+"node scripts/notused.csv";

// more advanced version of index.js

let csv = fs.readFileSync(url+"node scripts/TEXAS42_MILEPOST_features.csv", "utf8");

let csv_rows = csv.split("\n");

let output = [];
let testput = [];
let notused = "";

//***************************************** */
let ignore_cols = ["ft4", "ft7", "ft12", "ft15", "ft18", "ft19", "ft39", "ft33", "ft37", "ft38",
                   "ft40", "ft42", "ft43", "ft44", "ft45", "ft51", "ft53", "ft55", "ft31" ];
let include_func_names = false;
let include_errors = false;
let error_perf_penalty = 1;
let separate_train_test = false;
let test_amt = 9;
let include_combo_id = true; //set false if include_errors=true
//***************************************** */

let flags = {};
let combos = [];
let ignore_cols_idx = [];
let ignore_flags = ["-floop-interchange", "-floop-strip-mine", "-fno-tree-coalesce-inlined-vars",
                    "-fgraphite-identity", "-floop-unroll-and-jam", "-fgraphite", "-floop-block",
"-fno-no-threadsafe-statics"];

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
                //let fx = json.results[i].compilerSequence[x];
                    if (!ignore_flags.includes(json.results[i].compilerSequence[x])) {
                        flags[json.results[i].compilerSequence[x]] = 0;
                    }
                //}
            }
        }
    }
});

for (let i=0;i<csv_rows.length;i++) {
    console.log((i+1)+"/"+csv_rows.length)
    let row = csv_rows[i].split(",");
    let res = "";

    if (i==0) { //header
        if (include_func_names) res = "function, ";
        else res = "";
        for (let z=1; z<row.length; z++) {
            let v = row[z].trim().replace(/\r/g,"");
            if (!ignore_cols.includes(v)) res += row[z]+",";
            else ignore_cols_idx.push(z);
        }
        res = res.replace(/\r/g,"");
        let k = Object.keys(flags);
        for (let f=0;f<k.length;f++) {
            res += " "+k[f]+", ";
            if (f==k.length-1) res += "performance";
        }
        if (include_combo_id) res += ", id";
        output.push(res);
        if (separate_train_test) testput.push(res);
    } else {
        let fn = row[0];
        let header;
        if (include_func_names) header = row[0]+",";
        else header = "";
        for (let z=1; z<row.length; z++) {
            if (!ignore_cols_idx.includes(z)) header += row[z]+",";
        }
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
                //let fx = json.results[y].compilerSequence[x];
                if (!ignore_flags.includes(json.results[y].compilerSequence[x])) flags[json.results[y].compilerSequence[x]] = 1;
            }
            if (json.results[y].values) {
                if (max<json.results[y].values[0]) max = json.results[y].values[0];
                let keys = Object.keys(flags);
                for (let z=0; z<keys.length; z++) {
                    res += flags[keys[z]]+", ";
                    if (z==keys.length-1) res += json.results[y].values[0];
                }
                
                if (include_combo_id) {
                    let str = json.results[y].compilerSequence.join("; ");
                    if (!combos.includes(str)) combos.push(str);
                    res += ", "+combos.indexOf(str);
                }
                aux.push(res);
            } else {
                if (include_errors) {
                    let keys = Object.keys(flags);
                    for (let z=0; z<keys.length; z++) {
                        res += flags[keys[z]]+", ";
                        if (z==keys.length-1) res += "undefined";
                    }
                    aux.push(res);
                }
            }          
        }
        for (let q=0; q<aux.length; q++) {
            if (aux[q].endsWith("undefined")) {
                aux[q] = aux[q].replace("undefined", max+error_perf_penalty); 
            }
        }

        if (separate_train_test) {
            if (i<=test_amt) testput = testput.concat(aux);
            else output = output.concat(aux);
        } else {
            output = output.concat(aux);
        }
    }
    console.log("combos: "+combos.length);
    
}

/*for (let z=0;z<output.length;z++) {
    console.log("-> "+output[z])
}*/

fs.writeFileSync(outurl, output.join("\n"));
fs.writeFileSync(testurl, testput.join("\n"));
fs.writeFileSync(notusedurl, notused);