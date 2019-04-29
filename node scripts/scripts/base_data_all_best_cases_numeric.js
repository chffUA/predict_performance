require("dotenv").config();

const fs = require("fs");
const url = process.env.PROJECT_HOME;
const outurl = url+"node scripts/base_all_best_cases_numeric.csv";

let res = "file, performance, flags_combo_id\n";

//************************* */
//************************* */

let combo_list = [];
let r = {};

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

fs.readdirSync(url+"TEXAS_42_results_train").forEach(file => {
    if (file!=".DS_Store") {
        let f = fs.readFileSync(url+"TEXAS_42_results_train/"+file, "utf8");
        let json = JSON.parse(f);
        let minp = +Infinity;

        for (let i=0;i<json.results.length;i++) {           
            if (!json.results[i].values) continue;

            if (json.results[i].values[0] < minp) {
                minp = json.results[i].values[0];
            }

        }

        let combos = [];

        for (let i=0;i<json.results.length;i++) {           
            if (!json.results[i].values) continue;

            if (json.results[i].values[0] == minp) {
                if (!combos.includes(json.results[i].compilerSequence.join("; ")))
                    combos.push(json.results[i].compilerSequence.join("; "));
            }

        }

        let fun = file.replace("._dse_results.json","");

        console.log(fun);
        res += fun+", "+minp;
        r[fun] = [];
        for (let i=0;i<combos.length;i++) {
            res += ", ["+combo_list.indexOf(combos[i])+"]";
            r[fun].push(combo_list.indexOf(combos[i]));
        }
        res += "\n";    

    }
});

let rk = Object.keys(r);

for (let i=0;i<combo_list.length;i++) {
    let op = [];
    for (let x=0;x<rk.length;x++) {
        for (let y=0;y<r[rk[x]].length;y++) {
            if (r[rk[x]][y]==i) op.push(rk[x]);
        }
    }
    if (op.length>1) {
        console.log("["+i+"]: "+op);
    }
}


fs.writeFileSync(outurl, res);