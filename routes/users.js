var express = require('express');
var router = express.Router();
const {dbName,dbUrl,mongodb,MongoClient} = require('../dbConfig');
const {hashPassword,hashCompare,createToken,decodeToken,validity} = require('../bin/auth');
const {UserDetails} = require('../dbSchema');
const client = new MongoClient(dbUrl);

//access this only if token exists
router.get('/all',validity,async(req, res)=> {
  await client.connect();
  try {
    let token = req.headers.authorization.split(' ')[1];
    let data = await decodeToken(token)
    const db = await client.db(dbName);
    let user = await db.collection('users').findOne({email:data.email}); 
    if(user)
    {
        let users = await db.collection('users').find().toArray()
        res.send({
          statusCode: 200,
          users
        })
    }
    else
    {
      res.send({
        statusCode: 401,
        message:'Unauthorized'
      })
    }
  } catch (error) {
    console.log(error)
    res.send({ 
      statusCode:500,
      message:"Internal Server Error",
      error
    })
  }
  finally{
    client.close()
  }
});


router.get('/:id',validity, async(req, res)=> {
  await client.connect();
  try {
    const db = await client.db(dbName);
    let users = await db.collection('users').findOne({_id: mongodb.ObjectId(req.params.id)});
    res.send({
      statusCode: 200,
      users
    })
  } catch (error) {
    console.log(error)
    res.send({ 
      statusCode:500,
      message:"Internal Server Error",
      error
    })
  }
  finally{
    client.close()
  }
});

//sign-up
router.post('/register', async(req, res)=> {
  await client.connect();
  try {
    const db = await client.db(dbName);
    let user = await db.collection('users').find({email:req.body.email}).toArray()
    if(user.length===0)
    {
        req.body.password = await hashPassword(req.body.password);
        let users = await db.collection('users').insertOne(req.body);

        res.send({
          statusCode: 200,
          message:"User Added Successfully"
        })
    }
    else
    {
      res.send({
        statusCode: 400,
        message:"User Already Exists, Kindly Login!"
      })
    }
  } catch (error) {
    console.log(error)
    res.send({ 
      statusCode:500,
      message:"Internal Server Error",
      error
    })
  }
  finally{
    client.close()
  }
});

//login
router.post('/login', async(req, res)=> {
  await client.connect();
  try {
    const db = await client.db(dbName);
    //check if user exists
    let user = await db.collection('users').findOne({email:req.body.email});

    if(user)
    {
    //check if the password matches
    let hashResult = await hashCompare(req.body.password,user.password)
      if(hashResult)
      {
        let token = await createToken({
          email:user.email,
          mobile:user.mobile,
          role:user.role
        })
        res.send({
          statusCode: 200,
          message:"User Logged in Successfully",
          token,
          role:user.role
        })
      }
      else
      {
        res.send({
          statusCode: 401,
          message:"Invalid Credentials",
        })
      }
    }
    else
    {
      res.send({
        statusCode: 401,
        message:"User Does Not Exist",
      })
    }
  } catch (error) {
    console.log(error)
    res.send({ 
      statusCode:500,
      message:"Internal Server Error",
      error
    })
  }
  finally{
    client.close()
  }
});

router.post('/add-user',async(req,res)=>{
  try {
    let users = await UserDetails.create(req.body);
    res.send({statusCode:200,message:"User added successfully"})
  } catch (error) {
    console.log(error)
    res.send({statusCode:500,message:"Internal Server Error",error})
  }
})
router.put('/edit-user/:id',validity, async(req, res)=> {
  await client.connect();
  try {
    // const db = await client.db(dbName);
    let users = await UserDetails.updateOne({_id:mongodb.ObjectId(req.params.id)},{$set:req.body})
    res.send({
      statusCode: 200,
      message:"User Edited Successfully",
      users
    })
  } catch (error) {
    console.log(error)
    res.send({ 
      statusCode:500,
      message:"Internal Server Error",
      error
    })
  }
  finally{
    client.close()
  }
});


router.delete('/delete-user/:id',validity, async(req, res)=> {
  await client.connect();
  try {
    const db = await client.db(dbName);
    await UserDetails.deleteOne({$and:[{_id:mongodb.ObjectId(req.params.id)},{role:'student'}]})
    let users = await db.collection('users').find().toArray();
    res.send({
      statusCode: 200,
      message:"User Deleted Successfully",
      users
    })
  } catch (error) {
    console.log(error)
    res.send({ 
      statusCode:500,
      message:"Internal Server Error",
      error
    })
  }
  finally{
    client.close()
  }
});

module.exports = router;
