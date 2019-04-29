require("dotenv").config();

const fs = require("fs");
const url = process.env.PROJECT_HOME;
const outurl = url+"node scripts/safe_combo_compare.csv";

let res = "file, best, average, actual\n";

//generally the best solution for any of these functions
let combo = "-fhoist-adjacent-loads; -funsafe-loop-optimizations; -fno-shrink-wrap; -fno-finite-math-only; -foptimize-sibling-calls; -fno-lifetime-dse; -fno-prefetch-loop-arrays; -fno-partial-inlining; -fno-finite-math-only; -fstrict-volatile-bitfields; -fcrossjumping; -fno-ira-share-save-slots; -fno-graphite; -fno-tree-ch; -fno-tree-coalesce-vars; -funroll-all-loops";

//************************* */
//************************* */

fs.readdirSync(url+"TEXAS_42_results_train").forEach(file => {
    if (file!=".DS_Store") {
        let f = fs.readFileSync(url+"TEXAS_42_results_train/"+file, "utf8");
        let json = JSON.parse(f);
        let minp = +Infinity;
        let t = 0;
        let s = 0;

        for (let i=0;i<json.results.length;i++) {           
            if (!json.results[i].values) continue;

            t += json.results[i].values[0];
            s++;

            if (json.results[i].values[0] < minp) {
                minp = json.results[i].values[0];
            }

        }

        let actual;

        for (let i=0;i<json.results.length;i++) {           
            if (!json.results[i].values) continue;

            if (json.results[i].compilerSequence.join("; ") == combo) {
                actual = json.results[i].values[0];
                break;
            }

        }

        let fun = file.replace("._dse_results.json","");
        let avg = (t/s).toFixed(2);

        console.log(fun);
        res += fun+", "+minp+", "+avg+", "+actual;
        if (minp==actual) res += ", <----- !!!";
        res += "\n"; 

    }
});

fs.writeFileSync(outurl, res);