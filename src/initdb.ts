import PouchDB from 'pouchdb';

const db_name = "matchmatch"
let db = undefined;

export const initdb = () => {
    db = new PouchDB(db_name, {revs_limit: 1})
}

function userDoc() {
    return db.get("users").catch(err => {
        if(err.name == 'not_found') {
            return {
                _id: "users",
                users: []
            }
        } else {
            throw err;
        }
    })
}

function addUser(username: string) {
    userDoc().then(doc => {
        let users = doc.users.indexOf(username) < 0 ? [...doc.users, username] : doc.users
        return db.put({
            _id: "users",
            users: users,
            _rev: doc._rev
        });
    }).then(res => {

    }).catch(err => {
        throw err
    })
}

export async function getUsers() {
    return await userDoc().then(doc => {
        return doc.users
    })
}

export const updatedb = async (name: string, data: any) => {
    console.log("Update database");

    if(db === undefined) {
        throw "Not connected to database";
    }

    addUser(name);

    let docs = data.toArray().map(e => {
        return {
            _id: "match::" + e[0] + "/" + e[1],
            "name": e[0],
            "country": e[1],
            "type": "match",
            [name]: {
                total: e[2],
                longest: e[3]
            }
        }
    })

    const existing = await db.allDocs({
            include_docs: true,
            keys: docs.map(e => e._id)})
        .then(data => {
            return data
        })

    docs = docs.map((d, i) => {
        if(!existing.rows[i].error) {
            if(existing.rows[i].value.rev)
                d = {...d, ...existing.rows[i].doc}
        }
        return d;
    })


    await db.bulkDocs(docs).then(res => {
        return res;
    }).catch(err => {
        console.log("Err", err);
    })
}

export const getfromdb = async () => {
    if(db === undefined) {
        throw("Not connected to the database")
    }

    const data = await db.allDocs({
        include_docs: true
    })

    return data
}

export function resetdb() {
    if(db === undefined) {
        throw("Not connected to database")
    }

    db.destroy().then(res => {
        console.log(res)
    }).catch( err => {
        throw err;
    })
}