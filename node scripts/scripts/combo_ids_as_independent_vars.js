require("dotenv").config();

const fs = require("fs");
const url = process.env.PROJECT_HOME;
const outurl = url+"node scripts/ids.csv";
const testurl = url+"node scripts/ids_test.csv";

let csv = fs.readFileSync(url+"node scripts/TEXAS42_MILEPOST_features.csv", "utf8");

let csv_rows = csv.split("\n");

let combo_list = [];
let ignore_cols_idx = [];
let output = [];
let testput = [];

//************************* */
let ignore_cols = ["ft4", "ft7", "ft12", "ft15", "ft18", "ft19", "ft39", "ft33", "ft37", "ft38",
                   "ft40", "ft42", "ft43", "ft44", "ft45", "ft51", "ft53", "ft55", "ft31" ];
let separate_train_test = false;
let test_amt = 9;
//************************* */

fs.readdirSync(url+"TEXAS_42_results_train").forEach(file => {
    if (file!=".DS_Store") {
        let f = fs.readFileSync(url+"TEXAS_42_results_train/"+file, "utf8");
        let json = JSON.parse(f);

        for (let i=0;i<json.results.length;i++) {           
            if (!json.results[i].values) continue;

            if (!combo_list.includes(json.results[i].compilerSequence.join("; ")))
                combo_list.push(json.results[i].compilerSequence.join("; "));

        }
    }
});

console.log("combos: "+combo_list.length);

for (let i=0;i<csv_rows.length;i++) {
    console.log((i+1)+"/"+csv_rows.length)
    let row = csv_rows[i].split(",");
    let res;

    if (i==0) { //header
        res = "function, ";
        for (let z=1; z<row.length; z++) {
            let v = row[z].trim().replace(/\r/g,"");
            if (!ignore_cols.includes(v)) res += row[z]+", ";
            else ignore_cols_idx.push(z);
        }
        res = res.replace(/\r/g,"");
        for (let f=0;f<combo_list.length;f++) {
            res += "id"+f+", ";
            if (f==combo_list.length-1) res += "performance";
        }
        output.push(res);
        if (separate_train_test) testput.push(res);
    } else {
        if (!fs.existsSync(url+"TEXAS_42_results_train/"+row[0]+"._dse_results.json")) {
            continue;
        }

        res = row[0]+", ";
        let fn = row[0];
        let header = res;
        for (let z=1; z<row.length; z++) {
            if (!ignore_cols_idx.includes(z)) header += row[z]+", ";
        }
        header = header.replace(/\r/g,"");

        let f = fs.readFileSync(url+"TEXAS_42_results_train/"+fn+"._dse_results.json", "utf8");
        let json = JSON.parse(f);
        let aux = [];
        for (let y=0;y<json.results.length;y++) { //cada result   
            res = header;
            if (json.results[y].values) {
                let combo = json.results[y].compilerSequence.join("; ");
                let idx = combo_list.indexOf(combo);
                let arr = new Array(combo_list.length).fill(0);
                arr[idx] = 1;
                res += arr.join(", ");
                res += ", "+json.results[y].values[0];
                aux.push(res);
            }         
        }
        
        if (separate_train_test) {
            if (i<=test_amt) testput = testput.concat(aux);
            else output = output.concat(aux);
        } else {
            output = output.concat(aux);
        }
    }
    
}

fs.writeFileSync(outurl, output.join("\n"));
fs.writeFileSync(testurl, testput.join("\n"));