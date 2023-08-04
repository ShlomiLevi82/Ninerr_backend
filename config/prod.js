import dotenv from 'dotenv'

dotenv.config()

export default {
  dbURL: process.env.dbURL,
  dbName: process.env.dbName,
}
