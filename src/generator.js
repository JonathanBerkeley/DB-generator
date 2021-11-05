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
    static async CreateClanData() {
        let result = await clans.insertOne({"abcd" : "efgh"})
        console.log(result)
    }

    static async CreatePlayerData(count) {
        for (let i = count; i > 0; --i) {

            let xp = faker.datatype.number()
            let level = ~~(xp / 1024) // Divide, ignore remainder, faster than Math.floor
            let games = ~~(xp / faker.datatype.number({min: 400, max: 1000}))
            let wins = (~~(games / 1.8) + faker.datatype.number({min: 0, max: 12}))

            await players.insertOne({
                "id" : faker.datatype.uuid(),
                "username" : faker.internet.userName(),
                "avatar" : faker.image.avatar(),
                "xp" : xp,
                "level" : level,
                "games" : games,
                "wins" : wins,
                "damage_done" : faker.datatype.float({min: 1024.0, max: 1_000_000.0})
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
}