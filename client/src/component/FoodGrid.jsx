import React, { useEffect, useState } from 'react';
import { Heart, ChefHat } from 'lucide-react';
import axios from "axios";
import { Link } from "react-router-dom"; // Fixed import
import { AspectRatio, Card, Skeleton, Typography } from '@mui/joy';

const FoodGrid = () => {
    const [foods, setFoods] = useState([]);
    const [likedItems, setLikedItems] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const data = localStorage.getItem("likes") || "[]";
        const likedArray = JSON.parse(data);
        const likedMap = likedArray.reduce((acc, id) => {
            acc[id] = true;
            return acc;
        }, {});
        setLikedItems(likedMap);
    }, []);

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

    // Fetch recipes from API
    const fetchRecipes = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get('https://api.spoonacular.com/recipes/random?apiKey=9e3e4e5fb1ef404495506cfc8ae5b32a&number=12');
            setFoods(response.data.recipes);
        } catch (error) {
            console.error('Error fetching recipes:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRecipes();
    }, []);

    return (
        <div className="min-h-screen bg-green-50 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-green-800 mb-8 text-center">Delicious Recipes</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isLoading ? (
                        <>
                            {[...Array(3)].map((_, i) => (
                                <Card key={i} variant="outlined" sx={{ width: 343, height: 300, display: 'flex', gap: 2 }}>
                                    <AspectRatio ratio="21/9">
                                        <Skeleton variant="overlay">
                                            <img alt="" src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" />
                                        </Skeleton>
                                    </AspectRatio>
                                    <Typography>
                                        <Skeleton>
                                            Placeholder text commonly used in the graphic, print, and publishing industries.
                                        </Skeleton>
                                    </Typography>
                                </Card>
                            ))}
                        </>
                    ) : (
                        foods.map((food) => (
                            <div
                                key={food.id}
                                className="bg-white rounded-lg shadow-md overflow-hidden border-2 border-green-200 transform transition-transform duration-300 hover:scale-105 cursor-pointer "
                            >
                                <div>
                                    <img src={food.image} alt={food.title} />
                                </div>
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-3">
                                        <h2 className="text-xl font-semibold text-green-700">{food.title}</h2>
                                        <button
                                            onClick={() => toggleLike(food.id)}
                                            className="focus:outline-none"
                                            aria-label="Like recipe"
                                        >
                                            <Heart
                                                className={`h-6 w-6 transition-colors duration-300 ${likedItems[food.id] ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                                            />
                                        </button>
                                    </div>
                                    <div className="container text-gray-600 mb-4" dangerouslySetInnerHTML={{ __html: food.summary }}></div>
                                    <Link
                                        to={`/r/${food.id}`}
                                        className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300 flex items-center space-x-2"
                                    >
                                        <ChefHat className="h-5 w-5" />
                                        <span>View Recipe</span>
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default FoodGrid;
