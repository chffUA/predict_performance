require("dotenv").config();

const fs = require("fs");
const url = process.env.PROJECT_HOME;
const outurl = url+"node scripts/base_best_cases.csv";
const feffurl = url+"intermediaries/feature+flag lm no error.csv";
const ftsurl = url+"node scripts/TEXAS42_MILEPOST_features.csv";

let res = "file, performance, flags";

//************************* */
let add_average_effect_per_flag = true;
//************************* */

let feff;
let fts;

if (add_average_effect_per_flag) {
    feff = fs.readFileSync(feffurl, "utf8").split("\n");
    fts = fs.readFileSync(ftsurl, "utf8").split("\n");
    res +=", total_flag_effect\n";
} else {
    res += "\n";
}

fs.readdirSync(url+"TEXAS_42_results_train").forEach(file => {
    if (file!=".DS_Store") {
        let f = fs.readFileSync(url+"TEXAS_42_results_train/"+file, "utf8");
        let json = JSON.parse(f);
        let minp = +Infinity;
        let minf;

        for (let i=0;i<json.results.length;i++) {           
            if (!json.results[i].values) continue;

            if (json.results[i].values[0] < minp) {
                minp = json.results[i].values[0];
                minf = json.results[i].compilerSequence;
            }

        }

        let fun = file.replace("._dse_results.json","");
        let fvals = [];

        if (add_average_effect_per_flag) {
            for (let flag=0; flag<minf.length; flag++) {
                let s = 0;
                let a = 0;
                for (let line=1;line<feff.length;line++) {
                    let vals = feff[line].replace(/ /g,"").split(",");
                    if (hasFeature(fun, vals[0]) && vals[1]==minf[flag].replace(/-/,"X.").replace(/-/g,".")) {
                        //console.log(fun+": "+vals[0]+": "+minf[flag]+": "+vals[4]);
                        s += parseFloat(vals[4]);
                        a++;
                    }
                }
                fvals.push(s/a);
                
            }

            console.log(fun);
            let sum = 0;
            res += fun+", "+minp+", [";
            for (let i=0;i<minf.length;i++) {
                res += minf[i]+" ("+fvals[i]+")";
                sum += fvals[i];
                if (i!=minf.length-1) res += "; ";
            }
            res += "], "+sum+"\n";
        } else {
            console.log(fun);
            res += fun+", "+minp+", ["+minf.join("; ")+"]\n";
        }

        

    }
});

function hasFeature(fun, ft) {
    let headers = fts[0].replace(/ /g, "").split(",");
    for (let i=0;i<fts.length;i++) {
        if (fts[i].startsWith(fun)) {
            return fts[i].split(",")[headers.indexOf(ft)] != 0;
        } 
    }
    return false;
}

fs.writeFileSync(outurl, res);