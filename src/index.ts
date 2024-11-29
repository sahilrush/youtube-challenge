
import express from  "express";
import router from "./routes";

const app = express(); 

app.use(express.json());

app.get('/', (req,res) => {
    res.send('Dev Test')
});


app.use('/api/', router);
app.listen(process.env.PORT || 3000,()=>{
    console.log('Server is listening')
})
export default app; 
