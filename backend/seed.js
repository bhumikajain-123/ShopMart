require("dotenv").config();

const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const User = require("./model/User");
const Product = require("./model/Product");
const Order = require("./model/Order");

const products = [
  { name: "Wireless Headphones", description: "Over-ear Bluetooth headphones with 30-hour battery life.", price: "2499", category: "Electronics", stock: 24, imageUrl: "https://placehold.co/600x600?text=Headphones", rating: 4.5, numreview: 18 },
  { name: "Mechanical Keyboard", description: "Compact keyboard with tactile switches and backlighting.", price: "3499", category: "Electronics", stock: 15, imageUrl: "https://placehold.co/600x600?text=Keyboard", rating: 4.6, numreview: 9 },
  { name: "Smart Watch", description: "Fitness smartwatch with heart-rate monitoring.", price: "4999", category: "Electronics", stock: 18, imageUrl: "https://placehold.co/600x600?text=Smart+Watch", rating: 4.4, numreview: 22 },
  { name: "Classic Cotton T-Shirt", description: "Soft everyday cotton t-shirt with a regular fit.", price: "699", category: "Fashion", stock: 50, imageUrl: "https://placehold.co/600x600?text=T-Shirt", rating: 4.2, numreview: 12 },
  { name: "Denim Jacket", description: "Classic blue denim jacket for casual outfits.", price: "2199", category: "Fashion", stock: 22, imageUrl: "https://placehold.co/600x600?text=Denim+Jacket", rating: 4.3, numreview: 16 },
  { name: "Running Shoes", description: "Lightweight running shoes with cushioned soles.", price: "2799", category: "Fashion", stock: 30, imageUrl: "https://placehold.co/600x600?text=Running+Shoes", rating: 4.7, numreview: 31 },
  { name: "Water Bottle", description: "Insulated 750 ml bottle for hot and cold drinks.", price: "899", category: "Home & Kitchen", stock: 35, imageUrl: "https://placehold.co/600x600?text=Water+Bottle", rating: 4.7, numreview: 27 },
  { name: "Coffee Mug", description: "350 ml ceramic mug for hot and cold drinks.", price: "349", category: "Home & Kitchen", stock: 60, imageUrl: "https://placehold.co/600x600?text=Coffee+Mug", rating: 4.1, numreview: 8 },
  { name: "Everyday Backpack", description: "Water-resistant backpack with laptop compartment.", price: "1599", category: "Accessories", stock: 20, imageUrl: "https://placehold.co/600x600?text=Backpack", rating: 4.3, numreview: 15 },
  { name: "Sunglasses", description: "UV-protection sunglasses with a lightweight frame.", price: "999", category: "Accessories", stock: 40, imageUrl: "https://placehold.co/600x600?text=Sunglasses", rating: 4.0, numreview: 11 },
];

const addresses = {
  rahul: { fullName: "Rahul Sharma", street: "42 Market Street", city: "Mumbai", postalCode: "400001", country: "India" },
  priya: { fullName: "Priya Patel", street: "18 Lake Road", city: "Ahmedabad", postalCode: "380001", country: "India" },
};

async function seedDatabase() {
  if (!process.env.MONGO_URL) {
    throw new Error("MONGO_URL is missing. Add it to backend/.env before seeding.");
  }

  await mongoose.connect(process.env.MONGO_URL);
  console.log("MongoDB connected");

  // Reset all application collections for repeatable test data.
  await Promise.all([Order.deleteMany({}), Product.deleteMany({}), User.deleteMany({})]);

  const password = await bcrypt.hash("Test@123", 10);
  const [admin, rahul, priya] = await User.insertMany([
    { name: "ShopMart Admin", email: "admin@shopmart.test", password, role: "admin", verified: true },
    { name: "Rahul Sharma", email: "rahul@shopmart.test", password, role: "user", verified: true },
    { name: "Priya Patel", email: "priya@shopmart.test", password, role: "user", verified: true },
  ]);

  const savedProducts = await Product.insertMany(products);
  const price = (index) => Number(savedProducts[index].price);

  await Order.insertMany([
    {
      user: rahul._id,
      items: [
        { productId: savedProducts[0]._id, quantity: 1, price: price(0) },
        { productId: savedProducts[6]._id, quantity: 2, price: price(6) },
      ],
      totalAmount: price(0) + price(6) * 2,
      address: addresses.rahul,
      paymentId: "test_payment_001",
      status: "deleivered",
    },
    {
      user: rahul._id,
      items: [{ productId: savedProducts[3]._id, quantity: 2, price: price(3) }],
      totalAmount: price(3) * 2,
      address: addresses.rahul,
      paymentId: "test_payment_002",
      status: "shipped",
    },
    {
      user: priya._id,
      items: [
        { productId: savedProducts[2]._id, quantity: 1, price: price(2) },
        { productId: savedProducts[8]._id, quantity: 1, price: price(8) },
      ],
      totalAmount: price(2) + price(8),
      address: addresses.priya,
      paymentId: "test_payment_003",
      status: "pending",
    },
  ]);

  console.log("Seed complete: 3 users, 10 products, 3 orders");
  console.log("Admin: admin@shopmart.test / Test@123");
  console.log("Users: rahul@shopmart.test and priya@shopmart.test / Test@123");
  void admin;
}

seedDatabase()
  .catch((error) => {
    console.error("Seed failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
