import '../node_modules/simple-datatables/src/style.css';
import {DataTable} from 'simple-datatables' 
import { getfromdb } from './initdb'
let dataTable = undefined;

export const showData = (columns: string[]) => {
    console.log("Show data");

    getfromdb().then(data => {
        renderDataFile(data.rows.filter(d => d.doc.type === "match").map(
            doc => {
                let out = [
                    doc.doc.name,
                    doc.doc.country,
                    ...columns.map(col => {
                        return doc.doc[col] ? doc.doc[col]['total'] : 0
                    })
                ]
                return out
            }    
        ), ['Navn', '  ', ...columns])
    });
}


function renderDataFile(data: any, columns: string[]) {
    const container = document.getElementById("tblContainer")
    container.innerHTML = "";
    const tbl = document.createElement("table")
    tbl.className = "table"
    tbl.id = "myTable"

    container.appendChild(tbl);

    dataTable = new DataTable("#myTable",
    {
        perPage: 50,
        perPageSelect: [10, 25, 50, 100],
        data: {
            headings: columns,
            data: data
        }
    })
}

