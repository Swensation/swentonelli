"use client";

import {
  Apple,
  Cookie,
  Flame,
  Pizza,
  Salad,
  Sandwich,
  Soup,
  Sparkles,
  Utensils,
  UtensilsCrossed,
} from "lucide-react";

interface LunchFoodIconProps {
  dishName: string;
  className?: string;
}

export function LunchFoodIcon({ dishName, className = "w-7 h-7" }: LunchFoodIconProps) {
  const name = dishName.toLowerCase();

  if (name.includes("pizza")) {
    return <Pizza className={`${className} text-amber-500`} />;
  }
  if (name.includes("burger") || name.includes("hamburger") || name.includes("cheeseburger")) {
    return <Flame className={`${className} text-rose-500`} />;
  }
  if (name.includes("sub") || name.includes("sandwich") || name.includes("grilled cheese")) {
    return <Sandwich className={`${className} text-orange-400`} />;
  }
  if (name.includes("nacho") || name.includes("taco") || name.includes("korean") || name.includes("rice bowl")) {
    return <Sparkles className={`${className} text-yellow-400`} />;
  }
  if (name.includes("mac & cheese") || name.includes("pasta") || name.includes("parmesan")) {
    return <UtensilsCrossed className={`${className} text-amber-400`} />;
  }
  if (name.includes("french toast") || name.includes("croissant") || name.includes("egg") || name.includes("pancake")) {
    return <Cookie className={`${className} text-amber-300`} />;
  }
  if (name.includes("salad")) {
    return <Salad className={`${className} text-emerald-400`} />;
  }
  if (name.includes("chicken") || name.includes("tender")) {
    return <Utensils className={`${className} text-orange-500`} />;
  }
  if (name.includes("soup")) {
    return <Soup className={`${className} text-cyan-400`} />;
  }

  return <Apple className={`${className} text-red-400`} />;
}

