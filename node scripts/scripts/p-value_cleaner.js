require("dotenv").config();

const fs = require("fs");
const url = process.env.PROJECT_HOME;

//***************************************** */
let plimit = 0.05;
let pvalue_idx = 5;
let file = "feature+combo lm";
//***************************************** */

const furl = url+"intermediaries/"+file+".csv";
let out;
let total = 0;

let lines = fs.readFileSync(furl, "utf8").split("\n");
for (let i=0;i<lines.length;i++) {

    if (i==0) { out = lines[i]+"\n" }
    else {
        let line = lines[i].split(",");
        if (parseFloat(line[pvalue_idx])<=plimit) { out += line+"\n" }
        else {
            console.log("Removed "+line[0]);
            total++;
        }
    }
}

fs.writeFileSync(furl, out);
console.log("Removed "+total+" items total.");