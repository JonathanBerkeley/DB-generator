import faker from "faker"
import bcrypt from "bcrypt" // C++ native module, faster than bcryptjs

// Database access handles
class Table {
    static db
    static clans
    static players
    static accounts
    static statics
}

/**
 * @description
 * Contains functionality for generating fake data
 * for MongoDB database. All methods are static.
 * @export
 * @class Generator
 */
export default class Generator {
    /**
     * @description
     * Sets up generator with the data retrieved from the database.
     * @static
     * @param {*} database
     * MongoDB database handle
     * @memberof Generator
     */
    static async InsertDB(database) {
        Table.db = database
        if (!Table.db) throw "DB undefined"

        Table.clans = this.#GetCollection("clan")
        Table.players = this.#GetCollection("player")
        Table.accounts = this.#GetCollection("account")
        Table.statics = this.#GetCollection("static")
    }

    //#region Create

    /**
     * @description
     * Generates clan documents.
     * Generates players (and their required accounts) to occupy the clan as well. 
     * @static
     * @param {*} count
     * Amount of documents to create
     * @memberof Generator
     */
    static async CreateClanData(count) {
        for (let i = count; i > 0; --i) {
            // Create a random amount of players to be apart of this clan
            const playerCount = faker.datatype.number({min: 1, max: 4})

            await Table.clans.insertOne(
                await this.#CreateClan(playerCount)
            )
        }
    }

    /**
     * @description
     * Generates player documents.
     * Generates accounts that are required for players to have as well.
     * @static
     * @param {*} count
     * Amount of documents to create
     * @memberof Generator
     */
    static async CreatePlayerData(count) {
        for (let i = count; i > 0; --i) {
            await Table.players.insertOne(
                await this.#CreatePlayer()
            )
        }
    }

    /**
     * @description
     * Generates account documents.
     * Does NOT generate an associated player.
     * @static
     * @param {*} count
     * Amount of documents to create
     * @memberof Generator
     */
    static async CreateAccountData(count) {
        for (let i = count; i > 0; --i) {
            await Table.accounts.insertOne(
                await this.#CreateAccount()
            )
        }
    }

    /**
     * @description
     * Generates all types of documents.
     * Count of player documents generated may be unequal to count due to the 
     * implementation of the clan generator possibly creating multiple players 
     * @static
     * @param {*} count
     * Amount of documents to create
     * @memberof Generator
     */
    static async CreateAllData(count) {
        this.CreateClanData(count)
        this.CreatePlayerData(count)
        this.CreateAccountData(count)
    }

    //#region Private object generators
    static async #CreateClan(playerCount = 0) {
        let _players = []
        let clan_id = faker.datatype.uuid()

        // Create players to occupy clan
        // Clans require at least 1 player
        for (let i = 0; i < playerCount; ++i) {
            _players[i] = (await Table.players.insertOne(
                await this.#CreatePlayer(undefined, clan_id)
            )).insertedId
        }

        // Create a clan with fake data
        return ({
            "_id" : clan_id,
            "name" : this.#Capitalized() + this.#Capitalized() + this.#Capitalized(),
            "created_date" : faker.date.past(5),
            "xp" : faker.datatype.number({min: 10_000, max: 1_000_000}),
            "players" : _players
        })
    }

    static async #CreatePlayer(account = undefined, clan = undefined) {
        let xp = faker.datatype.number()
        let level = ~~(xp / 1024) // Divide, ignore remainder, faster than Math.floor
        let games = ~~(xp / faker.datatype.number({ min: 400, max: 1000 }))
        let wins = (~~(games / 1.9) + faker.datatype.number({ min: 0, max: 12 }))

        // Generate a new account if one was not passed in (Player requires an account)
        if (!account) {
            account = await Table.accounts.insertOne(
                await this.#CreateAccount()
            )
        }

        // Make player object with fake data and return it
        return ({
            "_id" : faker.datatype.uuid(),
            "username" : faker.internet.userName(),
            "avatar" : faker.image.avatar(),
            "xp" : xp,
            "level" : level,
            "games" : games,
            "wins" : wins,
            "damage_done" : faker.datatype.float({min: 1024.0, max: 1_000_000.0}),
            "account" : account.insertedId,
            "clan" : clan
        })
    }

    static async #CreateAccount() {
        // Create an account with fake data
        return ({
            "_id" : faker.datatype.uuid(),
            "name" : faker.name.findName(),
            "email" : faker.internet.email(),
            "password" : await bcrypt.hash(faker.internet.password(), 4)
        })
    }
    //#endregion

    //#endregion
    
    //#region Recreate
    static async RecreateClanData(count = 1) {
        await this.DeleteClanData()
        await this.CreateClanData(count)
    }

    static async RecreatePlayerData(count = 1) {
        await this.DeletePlayerData()
        await this.CreatePlayerData(count)
    }

    static async RecreateAccountData(count = 1) {
        await this.DeleteAccountData()
        await this.CreateAccountData(count)
    }

    /**
     * @description
     * Deletes then generates all types of data
     * @static
     * @param {*} count
     * Amount of documents to create
     * @memberof Generator
     */
    static async RecreateAllData(count = 1) {
        await this.DeleteAllData()
        await this.CreateAllData(count)
    }
    //#endregion

    //#region Delete
    static async DeleteClanData() {
        await Table.clans.deleteMany({})
    }

    static async DeletePlayerData() {
        await Table.players.deleteMany({})
    }

    static async DeleteAccountData() {
        await Table.accounts.deleteMany({})
    }

    /**
     * @description
     * Deletes all documents of all types
     * @static
     * @memberof Generator
     */
    static async DeleteAllData() {
        await this.DeleteClanData()
        await this.DeletePlayerData()
        await this.DeleteAccountData()
    }
    //#endregion

    //#region Utility
    static #GetCollection(name) {
        return Table.db.collection(name)
    }

    static #Capitalized(word = faker.company.bsBuzz()) {
        return word.charAt(0).toUpperCase() + word.substring(1)
    }
    //#endregion
}