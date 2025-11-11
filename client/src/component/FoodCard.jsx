import axios from 'axios';
import { ChefHat, Heart } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';

const FoodCard = ({id}) => {


    const [foods, setFoods] = useState([]);
    const [likedItems, setLikedItems] = useState({});
    const [isLoading, setIsLoading] = useState(false);



// Fetch recipes from API
const fetchRecipes = async () => {
    try {
        console.log(id)
      setIsLoading(true)
      const response = await axios.get(
        `https://api.spoonacular.com/recipes/${id}/information?apiKey=9e3e4e5fb1ef404495506cfc8ae5b32a`
      )
      setFoods(response.data)
      console.log(response.data)
    } catch (error) {
      console.error('Error fetching recipes:', error)
    } finally {
      setIsLoading(false)
    }
  }
   useEffect(() => {
          const data = localStorage.getItem("likes") || "[]";
          const likedArray = JSON.parse(data);
          const likedMap = likedArray.reduce((acc, id) => {
              acc[id] = true;
              return acc;
          }, {});
          setLikedItems(likedMap);
      }, []);
  
      // Toggle like function
      const toggleLike = (id) => {
          setLikedItems((prev) => {
              const newLikedItems = { ...prev };
              if (newLikedItems[id]) {
                  delete newLikedItems[id]; // Unlike
              } else {
                  newLikedItems[id] = true; // Like
              }
              localStorage.setItem("likes", JSON.stringify(Object.keys(newLikedItems)));
              return newLikedItems;
          });
      };

useEffect(() => {
    console.log(id)
    fetchRecipes();
}, []);

    return (
        <div
            className="bg-white rounded-lg shadow-md overflow-hidden border-2 border-green-200 transform transition-transform duration-300 hover:scale-105"
        >
            <div>
                <img src={foods.image} alt={foods.title} />
            </div>
            <div className="p-6">
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-xl font-semibold text-green-700">{foods.title}</h2>
                    <button
                        onClick={() => toggleLike(foods.id)}
                        className="focus:outline-none"
                        aria-label="Like recipe"
                    >
                        <Heart
                            className={`h-6 w-6 transition-colors duration-300 ${likedItems[foods.id] ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                        />
                    </button>
                </div>
                <div className="container text-gray-600 mb-4" dangerouslySetInnerHTML={{ __html: foods.summary }}></div>
                <Link
                    to={`/r/${foods.id}`}
                    className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300 flex items-center space-x-2"
                >
                    <ChefHat className="h-5 w-5" />
                    <span>View Recipe</span>
                </Link>
            </div>
        </div>
    )
}

export default FoodCard