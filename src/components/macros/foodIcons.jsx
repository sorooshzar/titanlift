// Map keywords in food names to emoji icons
const FOOD_ICON_MAP = [
  { keywords: ["chicken", "poultry"], icon: "🍗" },
  { keywords: ["beef", "steak", "burger", "ground beef", "bison"], icon: "🥩" },
  { keywords: ["fish", "salmon", "tuna", "tilapia", "cod", "shrimp", "seafood", "prawn"], icon: "🐟" },
  { keywords: ["egg", "eggs", "omelette", "scrambled"], icon: "🥚" },
  { keywords: ["milk", "dairy", "cheese", "yogurt", "whey", "cottage"], icon: "🥛" },
  { keywords: ["banana"], icon: "🍌" },
  { keywords: ["apple", "applesauce"], icon: "🍎" },
  { keywords: ["orange", "citrus", "mandarin"], icon: "🍊" },
  { keywords: ["grape", "raisin"], icon: "🍇" },
  { keywords: ["strawberry", "blueberry", "berry", "raspberry"], icon: "🍓" },
  { keywords: ["avocado"], icon: "🥑" },
  { keywords: ["broccoli"], icon: "🥦" },
  { keywords: ["carrot"], icon: "🥕" },
  { keywords: ["rice", "brown rice", "white rice"], icon: "🍚" },
  { keywords: ["pasta", "noodle", "spaghetti", "penne", "macaroni"], icon: "🍝" },
  { keywords: ["bread", "toast", "sandwich", "sub", "wrap", "bagel", "bun"], icon: "🍞" },
  { keywords: ["oat", "oatmeal", "porridge", "granola", "cereal"], icon: "🥣" },
  { keywords: ["potato", "sweet potato", "fries", "mash"], icon: "🥔" },
  { keywords: ["salad", "spinach", "lettuce", "kale"], icon: "🥗" },
  { keywords: ["pizza"], icon: "🍕" },
  { keywords: ["cookie", "cake", "brownie", "dessert", "donut", "muffin"], icon: "🍪" },
  { keywords: ["chocolate", "cocoa"], icon: "🍫" },
  { keywords: ["coffee", "espresso"], icon: "☕" },
  { keywords: ["juice", "smoothie"], icon: "🧃" },
  { keywords: ["protein", "shake", "powder", "supplement"], icon: "💪" },
  { keywords: ["peanut butter", "almond butter", "nut butter", "peanut"], icon: "🥜" },
  { keywords: ["almond", "walnut", "cashew", "pistachio", "nut"], icon: "🌰" },
  { keywords: ["olive oil", "oil", "butter", "ghee"], icon: "🫙" },
  { keywords: ["tofu", "soy", "tempeh"], icon: "🫘" },
  { keywords: ["bean", "lentil", "chickpea", "hummus"], icon: "🫘" },
  { keywords: ["corn", "popcorn"], icon: "🌽" },
  { keywords: ["mushroom"], icon: "🍄" },
  { keywords: ["tomato", "ketchup"], icon: "🍅" },
  { keywords: ["honey"], icon: "🍯" },
  { keywords: ["water", "sparkling"], icon: "💧" },
];

export function getFoodIcon(name = "") {
  const lower = name.toLowerCase();
  for (const entry of FOOD_ICON_MAP) {
    if (entry.keywords.some(k => lower.includes(k))) {
      return entry.icon;
    }
  }
  return "🍽️"; // default
}