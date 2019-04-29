require("dotenv").config();

const fs = require("fs");
const url = process.env.PROJECT_HOME;
const lmurl = url+"intermediaries/feature+combo lm.csv";
const idurl = url+"node scripts/ids.csv";

let csv = fs.readFileSync(url+"node scripts/TEXAS42_MILEPOST_features.csv", "utf8");
let csv_rows = csv.split("\n");

let lm_csv = fs.readFileSync(lmurl, "utf8");
let lm_rows = lm_csv.split("\n");

let id_csv = fs.readFileSync(idurl, "utf8");
let id_rows = id_csv.split("\n");

let fts = {};
let ftlist = [];
let ignore_cols_idx = [];
let best_ids_for_fts = {};
let allowed_fns = [];
let combo_list = [];

//************************* */
let ignore_cols = ["ft4", "ft7", "ft12", "ft15", "ft18", "ft19", "ft39", "ft33", "ft37", "ft38",
                   "ft40", "ft42", "ft43", "ft44", "ft45", "ft51", "ft53", "ft55", "ft31" ];
let combo_works_in_how_many_fns_minimum = 30;
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

console.log("built id list");

for (let i=0;i<csv_rows.length;i++) { //build ft map and fn list
    let row = csv_rows[i].split(","); 

    if (i==0) { //header
        for (let z=1; z<row.length; z++) {
            let v = row[z].trim().replace(/\r/g,"");
            if (ignore_cols.includes(v)) ignore_cols_idx.push(z);
            else ftlist.push(v);
        }
    } else {
        if (!fs.existsSync(url+"TEXAS_42_results_train/"+row[0]+"._dse_results.json")) {
            continue;
        }

        fts[row[0]] = [];

        for (let z=1; z<row.length; z++) {
            let v = row[z].trim().replace(/\r/g,"");
            if (!ignore_cols_idx.includes(z)) fts[row[0]].push(v);
        }
    }
    
}

let fns = Object.keys(fts);
/*let ids_header = id_rows[0].split(", ");
let rowarrays = [];
for (let x=0;x<id_rows.length;x++) {
    rowarrays.push(id_rows[x].split(", "));
}

for (let c=0;c<ids_header.length;c++) { // each column
    if (!ids_header[c].startsWith("id")) continue;
    
    let ct = 0;

    for (let l=1;l<id_rows.length;l++) { // each row
        ct += parseInt(rowarrays[l][c]);
    }

    if (ct>=combo_works_in_how_many_fns_minimum) allowed_fns.push(ids_header[c]);
}*/

let aux = {};
for (let x=0;x<combo_list.length;x++) aux[combo_list[x]] = 0;

fs.readdirSync(url+"TEXAS_42_results_train").forEach(file => {
    if (file!=".DS_Store") {
        let f = fs.readFileSync(url+"TEXAS_42_results_train/"+file, "utf8");
        let json = JSON.parse(f);

        let compseqs = [];
        for (let i=0;i<json.results.length;i++) {  
            if (!json.results[i].values) continue;
            compseqs.push(json.results[i].compilerSequence.join("; "));
        }

        for (let i=0;i<combo_list.length;i++) {
            if (compseqs.indexOf(combo_list[i])!=-1) 
                aux[combo_list[i]]++;
        }
    }
});

let k = Object.keys(aux);
for (let i=0;i<k.length;i++) {
    if (aux[k[i]]>=combo_works_in_how_many_fns_minimum) allowed_fns.push("id"+i);
}

console.log("read allowed fns");

for (let f=0;f<ftlist.length;f++) { //each ft
    let min = +Infinity;
    let id;
    let ft_coef;
    let icpt;
    for (let i=0;i<lm_rows.length;i++) { //each lm row
        let row = lm_rows[i].split(", ");

        if (!allowed_fns.includes(row[1])) continue;

        let val = parseFloat(row[4]);
        if (row[0]==ftlist[f] && val<min) {
            min = val;
            id = row[1];
            ft_coef = parseFloat(row[3]);
            icpt = parseFloat(row[2]);
        }
    }
    best_ids_for_fts[ftlist[f]] = {id: id, id_coef: min, ft_coef: ft_coef, icpt: icpt};
}

console.log("made best fit list");

for (let i=0;i<fns.length;i++) { //each function
    let fn = fns[i];
    let min = +Infinity;
    let id;
    for (let f=0;f<ftlist.length;f++) { //each ft
        let ft = ftlist[f];
        let ftvals = best_ids_for_fts[ft];
        let p = fts[fn][f] * ftvals.ft_coef + ftvals.id_coef + ftvals.icpt;
        //console.log(fts[fn][f]+" of "+ft+": "+fn+": "+p);
        if (p<min) {
            min = p;
            id = ftvals.id;
        }
    }

    let f = fs.readFileSync(url+"TEXAS_42_results_train/"+fn+"._dse_results.json", "utf8");
    let json = JSON.parse(f);
    let perf = -1;
    let idstr = combo_list[parseInt(id.replace("id",""))];
    let t = 0;
    let s = 0;
    let actualmin = +Infinity;

    for (let k=0;k<json.results.length;k++) {           
        if (!json.results[k].values) continue;

        if (json.results[k].compilerSequence.join("; ") == idstr) {
            perf = json.results[k].values[0];
        }

        if (json.results[k].values[0]<actualmin) actualmin = json.results[k].values[0];
        t += json.results[k].values[0];
        s++;

    }

    if (perf==-1) console.log(fn+" -> "+id+" (DOES NOT EXIST)");
    else console.log(fn+" -> "+id+" ("+perf+"; avg: "+(t/s).toFixed(0)+"; min: "+actualmin.toFixed(0)+")");
    
}