import { MongoClient } from "mongodb"
import dotenv from "dotenv"

import Generator from "./generator.js"

if (dotenv.config().error) {
    console.error("ENV file invalid, missing or cannot be read")
    process.exit(3)
}

class Config {
    static DB_URI = process.env.DB_URI
    static DB_NAME = process.env.DB_NAME
    static CLIENT = new MongoClient(this.DB_URI)
    static VERSION = process.env.npm_package_version
    static DB = undefined
    static CLEAR_DB = 1;
}

async function main() {
    await Config.CLIENT.connect()
    console.log("Connected to database")
    
    Config.DB = Config.CLIENT.db(Config.DB_NAME)
    if (!Config.DB) throw "Failure getting database"
    
    // DB insertion
    Generator.InsertDB(Config.DB)
    
    // Clear DB on load
    if (Config.CLEAR_DB) {
        await Generator.DeleteClanData()
        await Generator.DeletePlayerData()
    }

    // Clan generation
    await Generator.CreateClanData(10)

    // Player generation
    await Generator.CreatePlayerData(1)

    return "\nExit code: " + (process.exitCode ?? "0 - Success")
}

main()
    .then(console.log)
    .catch(console.error)
    .finally(() => Config.CLIENT.close())

export default Config