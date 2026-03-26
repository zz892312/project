const fetch = global.fetch || require('node-fetch');
require('dotenv').config();

const USDA_API_KEY = process.env.USDA_API_KEY || '';

async function getFoodNutrition(foodName) {
  if (!USDA_API_KEY) {
    throw new Error('USDA_API_KEY is not configured in .env');
  }

  const url = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${USDA_API_KEY}&query=${encodeURIComponent(foodName)}&pageSize=1`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`FoodData API request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const food = data.foods && data.foods[0];

  if (!food) {
    return { message: 'No nutrition data found for food item' };
  }

  return {
    description: food.description,
    calories: (food.foodNutrients || []).find(n => n.nutrientName === 'Energy')?.value || null,
    protein: (food.foodNutrients || []).find(n => n.nutrientName === 'Protein')?.value || null,
    fat: (food.foodNutrients || []).find(n => n.nutrientName === 'Total lipid (fat)')?.value || null,
    carbs: (food.foodNutrients || []).find(n => n.nutrientName === 'Carbohydrate, by difference')?.value || null
  };
}

module.exports = {
  getFoodNutrition
};