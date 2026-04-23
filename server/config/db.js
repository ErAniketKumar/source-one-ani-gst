const mongoose = require("mongoose")


const connectDataBase = async()=>{

    const dbOption = {
        dbName:"gst-db-source-one"
    }
    try {

        await mongoose.connect(process.env.MONGO_URI);
        console.log("database connected!");
    } catch(err) {
        console.log(err.message);
    }
} 

module.exports = connectDataBase;