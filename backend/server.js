require("dotenv").config()

const express = require("express")
const cors = require("cors")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { createClient } = require("@supabase/supabase-js")

const app = express()
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://leo-bank-tau.vercel.app"
  ],
  credentials: true
}))
app.use(express.json({ limit: "6mb" }))

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

const SECRET = "mysecretkey"
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]

const isValidImageDataUrl = (profileImage) => {
  if (!profileImage || typeof profileImage !== "string") return false

  const match = profileImage.match(/^data:(image\/(?:jpeg|jpg|png|webp));base64,([A-Za-z0-9+/=]+)$/)
  if (!match || !ALLOWED_IMAGE_TYPES.includes(match[1])) return false

  try {
    return Buffer.from(match[2], "base64").length > 0
  } catch {
    return false
  }
}

// ================== AUTH MIDDLEWARE ==================
const authenticate = (req,res,next)=>{
  const authHeader = req.headers.authorization

  if(!authHeader){
    return res.status(401).json({ message:"No token" })
  }

  const token = authHeader.split(" ")[1]

  try{
    const decoded = jwt.verify(token, SECRET)
    req.user = decoded
    next()
  }catch(err){
    return res.status(401).json({ message:"Invalid token" })
  }
}

// ================== TEST ==================
app.get("/", (req,res)=>{
  res.send("Leo Bank API running...")
})

// ================== REGISTER ==================
app.post("/register", async (req,res)=>{

  const { name, email, phone, country, password, referral, profile_image } = req.body
  const referralCode = (referral || "").trim().toUpperCase()
  const profileImage = profile_image

  if(!name || !email || !phone || !password){
    return res.json({ success:false, message:"Fill all required fields" })
  }

  if(!profileImage){
    return res.json({ success:false, message:"Profile picture is required" })
  }

  if(!isValidImageDataUrl(profileImage)){
    return res.json({ success:false, message:"Profile picture must be jpg, jpeg, png, or webp" })
  }

  if(!/^\d{11}$/.test(phone)){
    return res.json({ success:false, message:"Phone must be 11 digits" })
  }

  const { data: emailUser } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)

  if(emailUser.length > 0){
    return res.json({ success:false, message:"Email already exists" })
  }

  const { data: phoneUser } = await supabase
    .from("users")
    .select("*")
    .eq("phone", phone)

  if(phoneUser.length > 0){
    return res.json({ success:false, message:"Phone already exists" })
  }

  const hashedPassword = await bcrypt.hash(password,10)

  const wallet_id = "WAL" + Math.floor(100000000 + Math.random() * 900000000)

  if(referralCode){
    if(referralCode === wallet_id){
      return res.json({ success:false, message:"You cannot refer yourself" })
    }

    const { data: referrer, error: referralError } = await supabase
      .from("users")
      .select("wallet_id")
      .eq("wallet_id", referralCode)

    if(referralError){
      return res.json({ success:false, message:"Unable to verify referral code" })
    }

    if(!referrer || referrer.length === 0){
      return res.json({ success:false, message:"Invalid referral code" })
    }
  }

  const { data, error } = await supabase.from("users").insert([
    {
      name,
      email,
      phone,
      country,
      password: hashedPassword,
      referral: referralCode,
      profile_image: profileImage,
      wallet_id,
      balance: 0
    }
  ])

  if(error){
    return res.json({ success:false, message:error.message })
  }

  res.json({
    success:true,
    message:"Account created successfully",
    user: data
  })
})

// ================== LOGIN ==================
app.post("/login", async (req,res)=>{

  const { email, password } = req.body

  const { data: users } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)

  if(!users || users.length === 0){
    return res.json({ success:false, message:"User not found" })
  }

  const user = users[0]

  const validPassword = await bcrypt.compare(password, user.password)

  if(!validPassword){
    return res.json({ success:false, message:"Invalid password" })
  }

  const token = jwt.sign(
    {  id: user.id,
       email: user.email, 
       wallet_id: user.wallet_id 
      },
    SECRET,
    { expiresIn: "7d" }
  )

  res.json({
    success:true,
    message:"Login successful",
    user,
    token
  })
})

// ================== BALANCE ==================
app.get("/balance/:wallet", authenticate, async (req,res)=>{

  const wallet = req.params.wallet

  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("wallet_id", wallet)

  if(!data || data.length === 0){
    return res.json({ message:"User not found" })
  }

  res.json(data[0])
})

// ================== TRANSACTIONS ==================
app.get("/transactions", authenticate, async (req, res) => {
  try {
    const wallet_id = req.user.wallet_id

    const { data, error } = await supabase
      .from("transcations")
      .select("*")
      .or(`sender_wallet.eq.${wallet_id},receiver_wallet.eq.${wallet_id}`)
      .order("created_at", { ascending: false })

    if (error) {
      console.log(error)
      return res.json({ success: false, message: "Failed to fetch transactions" })
    }

   // get all users
const { data: users } = await supabase
  .from("users")
  .select("*")

// map names into transactions
const updatedTransactions = data.map(tx => {
  const senderUser = users.find(u => u.wallet_id === tx.sender_wallet)
  const receiverUser = users.find(u => u.wallet_id === tx.receiver_wallet)

  return {
    ...tx,
    sender_name: senderUser?.name || "Unknown",
    receiver_name: receiverUser?.name || "Unknown"
  }
})

// send updated result
return res.json({
  success: true,
  transactions: updatedTransactions
})

  } catch (err) {
    console.log(err)
    return res.json({ success: false, message: "Server error" })
  }
})

// ================== SEND MONEY ==================
app.post("/send-money", authenticate, async (req,res)=>{

  const sender_wallet = req.user.wallet_id
  const { receiver_wallet, amount } = req.body

  const amt = parseFloat(amount)

  if(!sender_wallet || !receiver_wallet || !amt){
    return res.json({ message:"Fill all fields" })
  }

 if (sender_wallet === receiver_wallet) {
  return res.json({ success: false, message: "Cannot send to yourself" })
 }
 
  const { data: senderData } = await supabase
    .from("users")
    .select("*")
    .eq("wallet_id", sender_wallet)

  if(!senderData || senderData.length === 0){
    return res.json({ message:"Sender not found" })
  }

  const sender = senderData[0]

  const { data: receiverData } = await supabase
    .from("users")
    .select("*")
    .eq("wallet_id", receiver_wallet)

  if(!receiverData || receiverData.length === 0){
    return res.json({ message:"Receiver not found" })
  }

  const receiver = receiverData[0]

  if(sender.balance < amt){
    return res.json({ message:"Insufficient balance" })
  }

  await supabase
    .from("users")
    .update({ balance: sender.balance - amt })
    .eq("wallet_id", sender_wallet)

  await supabase
    .from("users")
    .update({ balance: receiver.balance + amt })
    .eq("wallet_id", receiver_wallet)

  const { error: txError } = await supabase
  .from("transcations")
  .insert([
    {
      sender_wallet,
      receiver_wallet,
      amount: amt,
      status: "success",
      type: "transfer",
      created_at: new Date()
    }
  ])

  if (txError) {
  console.log(txError)
  return res.json({
    success: false,
    message: "Transaction failed"
  })
}

  res.json({ 
    success: true,
    message:"Transfer successful" })
})

// ================== DEPOSIT ==================
app.post("/deposit", authenticate, async (req, res) => {
  try {
    const wallet_id = req.user.wallet_id
    const { amount } = req.body
    const amt = Number(amount)

    if (!amt || amt <= 0) {
      return res.json({ success: false, message: "Invalid amount" })
    }

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("wallet_id", wallet_id)
      .single()

    if (userError || !user) {
      return res.json({ success: false, message: "User not found" })
    }

    const newBalance = user.balance + amt

    // update balance
    const { error: updateError } = await supabase
      .from("users")
      .update({ balance: newBalance })
      .eq("wallet_id", wallet_id)

    if (updateError) {
      return res.json({ success: false, message: "Deposit failed" })
    }

    // insert transaction
    const { error: txError } = await supabase
      .from("transcations")
      .insert([
        {
          sender_wallet: wallet_id,
          receiver_wallet: wallet_id,
          amount: amt,
          status: "success",
          type: "deposit",
          created_at: new Date()
        }
      ])

    if (txError) {
      console.log("TX ERROR:", txError)

      // rollback balance
      await supabase
        .from("users")
        .update({ balance: user.balance })
        .eq("wallet_id", wallet_id)

      return res.json({ success: false, message: "Transaction failed" })
    }

    return res.json({
      success: true,
      message: "Deposit successful"
    })

  } catch (err) {
    console.log("SERVER ERROR:", err)
    return res.json({
      success: false,
      message: "Server error"
    })
  }
})
// ================== WITHDRAW ==================
app.post("/withdraw", authenticate, async (req,res)=>{

  const wallet_id = req.user.wallet_id
  const { amount } = req.body

  const amt = parseFloat(amount)

  if(!wallet_id || !amt){
    return res.json({ message:"Enter amount" })
  }

  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("wallet_id", wallet_id)

  if(!data || data.length === 0){
    return res.json({ message:"User not found" })
  }

  const user = data[0]

  if(user.balance < amt){
    return res.json({ message:"Insufficient balance" })
  }

  // update balance
  await supabase
    .from("users")
    .update({ balance: user.balance - amt })
    .eq("wallet_id", wallet_id)

  // save transaction
  await supabase.from("transcations").insert([
    {
      sender_wallet: wallet_id,
      receiver_wallet: wallet_id,
      amount: amt,
      status: "success",
      type: "withdraw",
      created_at: new Date()
    }
  ])

  res.json({ 
    success: true,
    message:"Withdrawal successful" })

})

// ================== START SERVER ==================
app.listen(5000, ()=>{
  console.log("Server running on port 5000")
})
