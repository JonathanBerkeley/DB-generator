import faker from "faker"
console.log(faker.image.avatar())
var db

export default class Generator {

    static async InsertDB(database) {
        db = database
        if (!db) throw "DB undefined"
    }

    // Create
    static async CreateClanData() {
        let name = "clan"
        let collection = db.collection(name)

        let result = await collection.insertOne({"abcd" : "efgh"})
        console.log(result)
    }

    static async CreatePlayerData() {
        let name = "players"
        let collection = db.collection(name)

        let result = await collection.insertOne({"abcd" : "efgh"})
        console.log(result)
    }

    // Recreate
    static async RemakeClanData() {

    }

    static async RemakePlayerData() {

    }

    // Delete
    static async DeleteClanData() {

    }

    static async DeletePlayerData() {

    }
}