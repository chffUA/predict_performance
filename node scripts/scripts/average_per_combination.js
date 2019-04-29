require("dotenv").config();

const fs = require("fs");
const url = process.env.PROJECT_HOME;
const outurl = url+"node scripts/combo_average_comparison.csv";

//***************************************** */
//***************************************** */

let fn_results = {}; //{function: {combo: val%, combo: val%}...}
let combos = []; //iterator helper
let output = "flags, %_of_average, viable_in_how_many_functions, functions\n";

fs.readdirSync(url+"TEXAS_42_results_train").forEach(file => {
    if (file!=".DS_Store") {
        let f = fs.readFileSync(url+"TEXAS_42_results_train/"+file, "utf8");
        let json = JSON.parse(f);
        let fn = file.replace("._dse_results.json","");
        let t = 0;
        let s = 0;
        for (let i=0;i<json.results.length;i++) { //just calculating avg perf
            if (json.results[i].values) {
                t += parseFloat(json.results[i].values[0]);
                s++;
            }
        }
        fn_results[fn] = {};
        let avg = t/s;
        for (let i=0;i<json.results.length;i++) {
            if (json.results[i].values) {
                let key = json.results[i].compilerSequence.join("; ");
                fn_results[fn][key] = parseFloat(json.results[i].values[0])/avg;
                if (!combos.includes(key)) combos.push(key);
            }
        }
    }
});

let fns = Object.keys(fn_results);

for (let i=0;i<combos.length;i++) {
    let combo = combos[i];
    let t = 0;
    let fx = [];
    for (let f=0;f<fns.length;f++) { //search for combo in each fn
        let fn = fn_results[fns[f]];
        if (fn[combo]) {
            t += fn[combo];
            fx.push(fns[f]);
        }
    }
    let res = (t/fx.length*100).toFixed(2);
    output += "["+combo+"], "+res+"%, "+fx.length+", ["+fx.join("; ")+"]";
    if (i!=combos.length-1) output+="\n";
}

fs.writeFileSync(outurl, output);
