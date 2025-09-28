import express from 'express'

import type { Request, Response } from 'express'

import { connect } from './database/data-source'
import { config } from './config/config'

import users from '@/user/routes'
import auth from '@/auth/routes'

const app = express()
const port = 3000

app.use(express.json())

app.use("/user", users)
app.use("/auth", auth)

app.use((req: Request, res: Response) => {
    res.status(404).json({
        error: "Not Found"
    })
})

async function start() {
    try {
        config()
        await connect()

        app.listen(port, () => {
            console.log(`Server running on http://localhost:${port}`)
        })
    } catch (error) {
        console.error("Starting the Server: ", error)
    }
}

start().catch(error => {
    console.error("Starting the Server: ", error)
})
