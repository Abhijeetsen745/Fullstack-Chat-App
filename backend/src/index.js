import express from 'express'
import authRoutes from './routes/auth.route.js'
import messageRoutes from './routes/message.route.js'
import 'dotenv/config'
import { connectDb } from './lib/db.js';
import cookieParser from 'cookie-parser'
import cors from 'cors'
import {io,server,app} from './lib/socket.js'
import path from 'path'

const PORT = process.env.PORT || 5002;
const __dirname = path.resolve()

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())
app.use('/api/auth',authRoutes)
app.use('/api/messages',messageRoutes)

if(process.env.NODE_ENV === 'production'){
    app.use(express.static(path.join(__dirname,'../frontend/dist')))
}
app.get('*',(req,res)=>{
    res.sendFile(path.join(__dirname,"../frontend","dist","index.html"))
})

server.listen(PORT,()=>{
    console.log(`server is listening on ${PORT}`);
    connectDb()
})