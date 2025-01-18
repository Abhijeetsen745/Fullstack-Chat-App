import mongoose from 'mongoose'
import 'dotenv/config'

export const connectDb = async () => {
    
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI)
          console.log( `MongoDB Connected: ${conn.connection.host}` );

          
    } catch (error) {
        console.log('mongodb connection error :'+ error);
        
    }
}