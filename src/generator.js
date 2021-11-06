import faker from "faker"

var db, clans, players, statics

export default class Generator {

    static async InsertDB(database) {
        db = database
        if (!db) throw "DB undefined"

        clans = this.#GetCollection("clan")
        players = this.#GetCollection("player")
        statics = this.#GetCollection("static")
    }

    //#region Create
    static async CreateClanData(count) {
        for (let i = count; i > 0; --i) {

            await clans.insertOne({
                "clan_id": faker.datatype.uuid(),
                "name" : this.#Capitalized() + this.#Capitalized() + this.#Capitalized(),
                "created_date" : faker.date.past(5),
                "xp" : faker.datatype.number({min: 10_000, max: 1_000_000}),
                "players" : ""
            })
        }
    }

    static async CreatePlayerData(count) {
        for (let i = count; i > 0; --i) {

            let xp = faker.datatype.number()
            let level = ~~(xp / 1024) // Divide, ignore remainder, faster than Math.floor
            let games = ~~(xp / faker.datatype.number({min: 400, max: 1000}))
            let wins = (~~(games / 1.8) + faker.datatype.number({min: 0, max: 12}))

            await players.insertOne({
                "uuid" : faker.datatype.uuid(),
                "username" : faker.internet.userName(),
                "avatar" : faker.image.avatar(),
                "xp" : xp,
                "level" : level,
                "games" : games,
                "wins" : wins,
                "damage_done" : faker.datatype.float({min: 1024.0, max: 1_000_000.0}),
                "account" : "",
                "clan" : ""
            })
        }
    }
    //#endregion
    
    //#region Recreate
    static async RecreateClanData() {
        this.DeleteClanData()
        this.CreateClanData()
    }

    static async RecreatePlayerData() {
        this.DeletePlayerData()
        this.CreatePlayerData()
    }
    //#endregion

    //#region Delete
    static async DeleteClanData() {
        await clans.deleteMany({})
    }

    static async DeletePlayerData() {
        await players.deleteMany({})
    }
    //#endregion

    // Local
    static #GetCollection(name) {
        return db.collection(name)
    }

    static #Capitalized(word = faker.company.bsBuzz()) {
        return word.charAt(0).toUpperCase() + word.substring(1)
    }
}