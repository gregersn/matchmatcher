import JSZip from 'jszip'
import DataFrame from 'dataframe-js'
import PapaParse from 'papaparse'

import { initdb, updatedb, getUsers, resetdb } from './initdb'
import { showData } from './showdata'


const dataFiles = [];
const dataPrefixes = []


const floatfields = [
    "Totalt cM som er delt",
    "Prosent felles DNA",
    "Største segment (cM)",
]

const transformer = (v: any, col: string): any => {
    if(floatfields.indexOf(col) > -1) {
        return (v as string).replace(' ', '').replace(',', '.');
    }
    return v;
}

const prepareDatafile = (data: any, type?: string): DataFrame => {
    let dataFields = []
    
    let parseoptions = {
        delimiter: ',',
        quoteChar: '"',
        header: true,
        dynamicTyping: true,
        //preview: 10
    }    

    if(type === "ftdna") {
        console.log("Parsing ftdna file")
        dataFields = [
            "Full Name", "Email", "Shared cM", "Longest Block"
        ]
    } else {
        parseoptions['transform'] = transformer
        dataFields = [
            "Navn", "Land", "Totalt cM som er delt", "Største segment (cM)"
        ]
    }

    const output = PapaParse.parse(data.trim(), parseoptions)
    return new DataFrame(output.data).select(...dataFields)
}


const handleFileUpload = (e: any) => {
    const reader = new FileReader();
    const filename = e.path[0].files[0].name;
    const filetype = e.path[0].files[0].type;

    let username = undefined;
    dataPrefixes.push(username);

    console.log(filetype);

    reader.onload = (ev: any) => {
        if(reader.readyState == FileReader.DONE) {
            if(filetype === "text/csv") {
                username = filename.split("_").splice(0, 1)
                const data = ev.target.result
                const df = prepareDatafile(data, "ftdna")
                updatedb(username, df).then(e => refresh())
            }
            else {
                username = filename.split(" ").splice(0, 1).join(" ");
                const uploaded = new JSZip();
                uploaded.loadAsync(ev.target.result).then(() => {
                    const compressed = uploaded.file(/csv/)[0];
                    compressed.async("text").then(data => {
                        const df = prepareDatafile(data);
                        updatedb(username, df).then(e => refresh());
                    });
                })
            }
        }
    }
    if(filetype === "text/csv") {
        reader.readAsText(e.path[0].files[0]);
    }
    else {
        reader.readAsBinaryString(e.path[0].files[0]);
    }
}

async function refresh() {
    // Show data, again... 
    showData(await getUsers());
}

const init = async () => {
    // Check and initialize db, etc
    initdb();

    // Show data for registered users
    showData(await getUsers())

    // Setup upload handler
    const inputElement = document.getElementById("gedfile");
    inputElement.addEventListener("change", handleFileUpload, false);

    const resetButton = document.getElementById("resetbutton");
    resetButton.addEventListener("click", resetdb, false);
}


init();
