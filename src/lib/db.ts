import fs from 'fs/promises';
import path from 'path';
import { products as initialProducts } from './data';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const CATEGORIES_FILE = path.join(DATA_DIR, 'categories.json');

async function ensureDB() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (err) {}

  try {
    await fs.access(DB_FILE);
  } catch (err) {
    // Database file does not exist yet. Seed with default assets.
    await fs.writeFile(DB_FILE, JSON.stringify(initialProducts, null, 2), 'utf-8');
  }

  try {
    await fs.access(ORDERS_FILE);
  } catch (err) {
    // Orders file does not exist yet. Seed with empty array.
    await fs.writeFile(ORDERS_FILE, JSON.stringify([], null, 2), 'utf-8');
  }

  try {
    await fs.access(CATEGORIES_FILE);
  } catch (err) {
    // Categories file does not exist yet. Seed with default categories.
    const defaultCategories = [
      { value: 'outerwear', label: 'OUTERWEAR' },
      { value: 'essentials', label: 'ESSENTIALS' },
    ];
    await fs.writeFile(CATEGORIES_FILE, JSON.stringify(defaultCategories, null, 2), 'utf-8');
  }
}

export async function getProducts() {
  await ensureDB();
  const data = await fs.readFile(DB_FILE, 'utf-8');
  return JSON.parse(data);
}

export async function saveProducts(products: any[]) {
  await ensureDB();
  await fs.writeFile(DB_FILE, JSON.stringify(products, null, 2), 'utf-8');
}

export async function getOrders() {
  await ensureDB();
  const data = await fs.readFile(ORDERS_FILE, 'utf-8');
  return JSON.parse(data);
}

export async function saveOrder(order: any) {
  await ensureDB();
  const orders = await getOrders();
  const newOrder = {
    ...order,
    id: order.id || Math.random().toString(36).substring(2, 11).toUpperCase(),
    timestamp: new Date().toISOString(),
  };
  orders.unshift(newOrder); // Newest orders first
  await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
  return newOrder;
}

export async function getCategories() {
  await ensureDB();
  const data = await fs.readFile(CATEGORIES_FILE, 'utf-8');
  return JSON.parse(data);
}

export async function saveCategories(categories: any[]) {
  await ensureDB();
  await fs.writeFile(CATEGORIES_FILE, JSON.stringify(categories, null, 2), 'utf-8');
}
