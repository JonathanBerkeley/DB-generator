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
            const playerCount = faker.datatype.number({min: 1, max: 4})

            await clans.insertOne(
                await this.#CreateClan(playerCount)
            )
        }
    }

    static async CreatePlayerData(count) {
        for (let i = count; i > 0; --i) {
            await players.insertOne(this.#CreatePlayer())
        }
    }

    //#region Private object generators
    static async #CreateClan(playerCount = 0) {
        let _players = []
        let clan_id = faker.datatype.uuid()

        for (let i = 0; i < playerCount; ++i) {
            _players[i] = (await players.insertOne(
                this.#CreatePlayer(undefined, clan_id)
            )).insertedId
        }

        return ({
            "_id": clan_id,
            "name" : this.#Capitalized() + this.#Capitalized() + this.#Capitalized(),
            "created_date" : faker.date.past(5),
            "xp" : faker.datatype.number({min: 10_000, max: 1_000_000}),
            "players" : _players
        })
    }

    static #CreatePlayer(account = undefined, clan = undefined) {
        let xp = faker.datatype.number()
        let level = ~~(xp / 1024) // Divide, ignore remainder, faster than Math.floor
        let games = ~~(xp / faker.datatype.number({ min: 400, max: 1000 }))
        let wins = (~~(games / 1.9) + faker.datatype.number({ min: 0, max: 12 }))

        return ({
            "_id" : faker.datatype.uuid(),
            "username" : faker.internet.userName(),
            "avatar" : faker.image.avatar(),
            "xp" : xp,
            "level" : level,
            "games" : games,
            "wins" : wins,
            "damage_done" : faker.datatype.float({min: 1024.0, max: 1_000_000.0}),
            "account" : account,
            "clan" : clan
        })
    }
    //#endregion

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

    static async DeleteAllData() {
        await this.DeleteClanData()
        await this.DeletePlayerData()
    }
    //#endregion

    //#region Utility
    static #GetCollection(name) {
        return db.collection(name)
    }

    static #Capitalized(word = faker.company.bsBuzz()) {
        return word.charAt(0).toUpperCase() + word.substring(1)
    }
    //#endregion
}