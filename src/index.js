import { MongoClient } from "mongodb"

import dotenv from 'dotenv'

if (dotenv.config().error) {
    console.error("ENV file invalid, missing or cannot be read")
    process.exit(3)
}

class Config {
    static PORT = process.env.PORT
    static DB_URI = process.env.DB_URI
    static CLIENT = new MongoClient(this.DB_URI)
    static VERSION = process.env.npm_package_version
}

try {
    await Config.CLIENT.connect()
    
    
}
catch(ex) {
    console.error(ex)
    process.exit(2)
}

export default Config