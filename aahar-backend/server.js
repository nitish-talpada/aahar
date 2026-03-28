const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB (Local or Atlas)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aahar_mess';
mongoose.connect(MONGODB_URI);

// --- 1. SCHEMAS ---
const ChefSchema = new mongoose.Schema({
  name: String,
  specialty: String,
  avatar: String,
  totalLikes: { type: Number, default: 0 }
});

const DishSchema = new mongoose.Schema({
  name: String,
  mealType: String, // Breakfast, Lunch, Snacks, Dinner
  dayOfWeek: String, // Monday, Tuesday, ... Sunday
  chefId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chef' },
  likes: { type: Number, default: 0 }
});

const DailyLogSchema = new mongoose.Schema({
  date: String, 
  chefId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chef' },
  dailyLikes: { type: Number, default: 0 }
});

const VoteSchema = new mongoose.Schema({
  deviceId: String,
  mealType: String,
  date: String
});

const Chef = mongoose.model('Chef', ChefSchema);
const Dish = mongoose.model('Dish', DishSchema);
const DailyLog = mongoose.model('DailyLog', DailyLogSchema);
const Vote = mongoose.model('Vote', VoteSchema);

// --- 2. HELPERS ---
const getCurrentMealInfo = () => {
  const now = new Date();
  const options = { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false };
  const timeString = new Intl.DateTimeFormat('en-US', options).format(now);
  const [hour, minute] = timeString.split(':').map(Number);
  const timeNum = hour + minute / 60;

  // Get current day in IST
  const dayOptions = { timeZone: 'Asia/Kolkata', weekday: 'long' };
  const currentDay = new Intl.DateTimeFormat('en-US', dayOptions).format(now);

  let mealType = "Closed";
  if (timeNum >= 7.75 && timeNum < 10.0) mealType = "Breakfast";
  if (timeNum >= 12.25 && timeNum < 14.25) mealType = "Lunch";
  if (timeNum >= 16.5 && timeNum < 17.75) mealType = "Snacks";
  if (timeNum >= 19.5 && timeNum < 21.5) mealType = "Dinner";
  
  return { mealType, currentDay };
};

const getLocalDateString = () => {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); // YYYY-MM-DD
};

// --- 3. SEED MOCK DATA (FULL WEEK MENU) ---
// This includes every single item for every day as provided in the image!
const seedData = async () => {
  await Chef.deleteMany({});
  await Dish.deleteMany({});
  await Vote.deleteMany({});
  
  const chef1 = await Chef.create({ name: "Chef Ramesh", specialty: "North Indian", avatar: "👨‍🍳" });
  const chef2 = await Chef.create({ name: "Chef Suresh", specialty: "Curries & Rice", avatar: "🧑‍🍳" });
  const chef3 = await Chef.create({ name: "Chef Anita", specialty: "Snacks & Refreshments", avatar: "👩‍🍳" });

  const getChef = (idx) => [chef1._id, chef2._id, chef3._id][idx % 3];

  const fullMenu = [
    // === MONDAY ===
    { day: "Monday", meal: "Breakfast", items: ["Thepla", "Curd", "Lahsun Chutney", "Sprouted Beans", "Egg Bhurjee", "Bread Butter Jam", "Milk Tea Coffee", "Cornflakes", "Bournvita Haldi", "Grapes"] },
    { day: "Monday", meal: "Lunch", items: ["Carrot Tomato Onion Salad", "Masoor Dal", "Sev tamatar", "Mix Kathol", "Plain Rice", "Curd", "Chapati", "Mirchi Lemon Mix veg Pickle", "Roasted Papad"] },
    { day: "Monday", meal: "Snacks", items: ["Dabeli Vada pav", "Ketchup green chutney", "Litchi Crush", "Tea Coffee Milk"] },
    { day: "Monday", meal: "Dinner", items: ["Cucumber onion tomato salad", "Dal Tadka", "Methi Matar Malai", "Jeera Rice", "Chapati", "Fried Mirchi Lemon Garlic Pickle", "Rice Kheer", "Chicken Sukka"] },

    // === TUESDAY ===
    { day: "Tuesday", meal: "Breakfast", items: ["Tari Poha", "Onions + Sev", "Lemon", "Boiled Chana", "Omelette", "White Bread+Butter+Jam", "Milk+Ginger Tea+Coffee", "Chocos", "Bournvita+Haldi", "Papaya"] },
    { day: "Tuesday", meal: "Lunch", items: ["Kachumber Salad", "Dal Fry", "Paneer Lababdar", "White Matar Masala", "Jeera Rice", "Masala Buttermilk", "Chapati", "Mirchi Lemon Garlic Pickle", "Fryums"] },
    { day: "Tuesday", meal: "Snacks", items: ["Samosa Chaat", "Lemonade", "Tea + Coffee + Milk"] },
    { day: "Tuesday", meal: "Dinner", items: ["Onion Tomato Salad", "Veg Raita / Rajasthani Dal", "Bhaji+Fried Curd", "Masala Pulao / Jeera Rice", "Pav / Fried Baati", "Lahsun Chutney", "Suji Halwa / Churma", "Fish Curry + Rice"] },

    // === WEDNESDAY ===
    { day: "Wednesday", meal: "Breakfast", items: ["Tomato Onion Coriander Uttapam", "Sambar+Peanut Chutney", "Boiled Eggs + Masala", "Brown Bread+Butter+Jam", "Milk+Tea+Coffee", "Chocos", "Bournvita+Haldi", "Banana"] },
    { day: "Wednesday", meal: "Lunch", items: ["Chick pea salad", "Masoor Dal", "Baigan masala", "Rajma Curry", "Plain Rice", "Curd", "Chapati", "Mirchi Lemon Garlic Pickle", "Fried Papad"] },
    { day: "Wednesday", meal: "Snacks", items: ["Coleslaw sandwich/peri peri sandwich", "Banana Milkshake", "Elaichi Tea"] },
    { day: "Wednesday", meal: "Dinner", items: ["Onion Tomato Cucumber Salad", "Urad Dal", "Aloo tamatar masewala", "Plain Rice", "Chapati", "Mirchi + Lemon + Chilli Pickle", "Hyderabadi Chicken Dum Biryani"] },

    // === THURSDAY ===
    { day: "Thursday", meal: "Breakfast", items: ["Aloo Onion Paratha/Methi/Garlic Paratha", "Curd", "Lahsun Chutney", "Egg Bhurjee", "White Bread+Butter+Jam", "Milk+Tea+Coffee", "Cornflakes", "Bournvita+Haldi", "Grapes"] },
    { day: "Thursday", meal: "Lunch", items: ["Mix Salad", "Arhar Dal", "Lauki Chana", "White Chole Masala", "Jeera Rice", "Masala Buttermilk", "Chapati", "Lemon Chilli Pickle", "Rice Papad"] },
    { day: "Thursday", meal: "Snacks", items: ["Hakka noodles/Red sauce pasta", "Ketchup", "Lemon Ice Tea", "Tea + Coffee + Milk"] },
    { day: "Thursday", meal: "Dinner", items: ["Mix Salad", "Urad dal", "Afghani Paneer", "Jeera Rice", "Chapati", "Mirchi Lemon Mix Veg Pickle", "Almond Carnival Ice cream", "Egg Curry"] },

    // === FRIDAY ===
    { day: "Friday", meal: "Breakfast", items: ["Idli", "Sambar+Peanut Chutney", "Lahsun Chutney", "Boiled Eggs+Masala", "Brown Bread+Butter+Jam", "Milk+Ginger Tea+Coffee", "Chocos", "Bournvita+Haldi", "Watermelon"] },
    { day: "Friday", meal: "Lunch", items: ["Carrot+Tomato+Onion Salad", "Dal Palak", "Punjabi Kadi Pakoda", "Kala Chana", "Plain Rice", "Boondi raita", "Chapati", "Mirchi Lemon Garlic Pickle", "Fryums"] },
    { day: "Friday", meal: "Snacks", items: ["Bombay bhel", "Green & Imli chutney", "Apple crush/mint crush", "Elaichi Tea + Coffee + Milk"] },
    { day: "Friday", meal: "Dinner", items: ["Onion Beetroot Cucumber Salad", "Sambar+Peanut Chutney", "Medu Vada", "Lemon Rice", "Masala Dosa", "Lemon + Chilli Pickle", "Kala Jamun", "Chicken Fried Rice"] },

    // === SATURDAY ===
    { day: "Saturday", meal: "Breakfast", items: ["Vermicelli", "Green chutney", "Pickle", "Moong Sprouts", "Boiled Eggs + Masala", "White Bread+Butter+Jam", "Milk+Ginger Tea+Coffee", "Cornflakes", "Bournvita+Haldi", "Papaya"] },
    { day: "Saturday", meal: "Lunch", items: ["Onion Salad", "Masoor Dal", "Chhole", "Jeera Rice", "Plain Rice", "Dry Fruit Lassi", "Chapati", "Green Chutney Mirchi Lemon Mix Veg Pickle", "Fryums"] },
    { day: "Saturday", meal: "Snacks", items: ["Masala Maggie", "Ketchup", "Cold Coffee/Chocolate Milkshake"] },
    { day: "Saturday", meal: "Dinner", items: ["Beetroot Cucumber Salad", "Dal Makhani", "Paneer Butter Masala", "Rajma Rice", "Chapati", "Lemon Garlic Pickle", "Chocolate Ice cream/Fruit Custard", "Chicken Angara"] },

    // === SUNDAY ===
    { day: "Sunday", meal: "Breakfast", items: ["Samosa+Butter Dosa/Onion Dosa", "Sambar+Peanut Chutney", "Ginger chutney", "Boiled Eggs + Masala", "Brown Bread+Butter+Jam", "Milk+Tea+Coffee", "Chocos", "Bournvita+Haldi", "Banana"] },
    { day: "Sunday", meal: "Lunch", items: ["Carrot+Tomato+Onion Salad", "Mix Dal", "Veg Jaipuri", "Soya Chunks Curry", "Plain Rice", "Masala Buttermilk", "Chapati", "Lemon Chilli Pickle", "Fryums"] },
    { day: "Sunday", meal: "Snacks", items: ["Pani puri", "Onion+Aloo+Sev+Chat Masala", "Shikanji", "Tea+Coffee+Milk"] },
    { day: "Sunday", meal: "Dinner", items: ["Cucumber Carrot Salad", "Arhar Dal", "Gobi masala", "Plain Rice", "Chapati", "Fried Mirchi+Lemon+Mix Veg Pickle", "Manchurian", "Hyderabadi Chicken Dum Biryani"] }
  ];

  let dishDocs = [];
  let chefCounter = 0;
  
  for (const dayMenu of fullMenu) {
    for (const item of dayMenu.items) {
      dishDocs.push({
        name: item,
        mealType: dayMenu.meal,
        dayOfWeek: dayMenu.day,
        chefId: getChef(chefCounter++),
        likes: 0
      });
    }
  }

  await Dish.insertMany(dishDocs);
  console.log(`Database seeded with ${dishDocs.length} items across the entire week!`);
};
// Optional: Seed on startup. Comment this out later to prevent reset on boot.
seedData();

// --- 4. API ROUTES (VOTING & DISPLAY) ---

// Route 1: Get Current Active Menu (filters by Current Day + Current Meal)
app.get('/api/menu/current', async (req, res) => {
  let { mealType, currentDay } = getCurrentMealInfo();
  
  // URL Demos override e.g. ?demoMeal=Lunch&demoDay=Wednesday
  if (req.query.demoMeal) mealType = req.query.demoMeal;
  if (req.query.demoDay) currentDay = req.query.demoDay;
  
  if (mealType === "Closed") {
    return res.json({ status: "Closed", mealType: "", currentDay, dishes: [] });
  }

  const dishes = await Dish.find({ mealType, dayOfWeek: currentDay }).populate('chefId');
  res.json({ status: "Open", mealType, currentDay, dishes });
});

// Route 1b: Get Entire Day Menu Grouped
app.get('/api/menu/today', async (req, res) => {
  let { mealType: activeMeal, currentDay } = getCurrentMealInfo();
  
  if (req.query.demoMeal) activeMeal = req.query.demoMeal;
  if (req.query.demoDay) currentDay = req.query.demoDay;

  const allDishes = await Dish.find({ dayOfWeek: currentDay }).populate('chefId');
  
  const menus = {
    Breakfast: allDishes.filter(d => d.mealType === 'Breakfast'),
    Lunch: allDishes.filter(d => d.mealType === 'Lunch'),
    Snacks: allDishes.filter(d => d.mealType === 'Snacks'),
    Dinner: allDishes.filter(d => d.mealType === 'Dinner')
  };

  res.json({ currentDay, activeMeal, menus });
});

app.get('/api/menu/:mealType', async (req, res) => {
  const { currentDay } = getCurrentMealInfo();
  const targetDay = req.query.day || currentDay;
  const dishes = await Dish.find({ mealType: req.params.mealType, dayOfWeek: targetDay }).populate('chefId');
  res.json(dishes);
});

// Route 2: The "Like" Engine (Strict limit: 1 like per device per mealType per day)
app.post('/api/like/:dishId', async (req, res) => {
  const { deviceId } = req.body;
  if (!deviceId) return res.status(400).json({ error: "No device ID provided." });

  const dish = await Dish.findById(req.params.dishId);
  if (!dish) return res.status(404).json({ error: "Dish not found." });

  const today = getLocalDateString();
  const dishMealType = dish.mealType;
  
  let { mealType: currentActiveMeal } = getCurrentMealInfo();
  if (req.query.demoMeal) currentActiveMeal = req.query.demoMeal;

  // Verify the meal is currently active
  if (currentActiveMeal !== dishMealType) {
    return res.status(403).json({ error: `Voting for ${dishMealType} is currently closed.` });
  }

  // Check if device already voted for this meal today
  const existingVote = await Vote.findOne({ deviceId, mealType: dishMealType, date: today });
  if (existingVote) {
    return res.status(403).json({ error: `You have already voted for a ${dishMealType} item today.` });
  }

  // 1. Record the vote
  await Vote.create({ deviceId, mealType: dishMealType, date: today });

  // 2. Increment Dish Like
  await Dish.findByIdAndUpdate(dish._id, { $inc: { likes: 1 } });
  
  // 3. Increment Chef Total Likes
  if (dish.chefId) {
    await Chef.findByIdAndUpdate(dish.chefId, { $inc: { totalLikes: 1 } });
    
    // 4. Log it to the Chef's Daily Record
    await DailyLog.findOneAndUpdate(
      { date: today, chefId: dish.chefId },
      { $inc: { dailyLikes: 1 } },
      { upsert: true, new: true }
    );
  }
  
  res.json({ success: true, message: "Vote recorded successfully!" });
});

app.get('/api/vote-status/:mealType/:deviceId', async (req, res) => {
    const today = getLocalDateString();
    const { mealType, deviceId } = req.params;
    const existingVote = await Vote.findOne({ deviceId, mealType, date: today });
    res.json({ hasVoted: !!existingVote });
});

// --- 5. ADMIN/LEADERBOARD ROUTES ---

app.get('/api/chefs/leaderboard', async (req, res) => {
  const chefs = await Chef.find().sort({ totalLikes: -1 });
  res.json(chefs);
});

app.get('/api/admin/chefs', async (req, res) => {
  const chefs = await Chef.find();
  res.json(chefs);
});

app.get('/api/admin/dishes', async (req, res) => {
  const dishes = await Dish.find().populate('chefId');
  res.json(dishes);
});

app.put('/api/admin/dishes/:id', async (req, res) => {
  const { name, chefId, mealType, dayOfWeek } = req.body;
  const updatedDish = await Dish.findByIdAndUpdate(req.params.id, { name, chefId, mealType, dayOfWeek }, { new: true });
  res.json(updatedDish);
});

app.post('/api/admin/dishes', async (req, res) => {
  const { name, chefId, mealType, dayOfWeek } = req.body;
  const newDish = await Dish.create({ name, chefId, mealType, dayOfWeek, likes: 0 });
  res.json(newDish);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on Port ${PORT}`));
