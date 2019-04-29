require("dotenv").config();

const fs = require("fs");
const url = process.env.PROJECT_HOME;
const outurl = url+"node scripts/base_all_best_cases.csv";

let res = "file, performance, flags\n";

//************************* */
//************************* */

let feff;
let fts;

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
        for (let i=0;i<combos.length;i++) {
            res += ", ["+combos[i]+"]";
        }
        res += "\n";    

    }
});

fs.writeFileSync(outurl, res);