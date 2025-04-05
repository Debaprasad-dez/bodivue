import { useState } from 'react';
import { useHealth } from '@/contexts/HealthContext';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThumbsUp, ThumbsDown, Clock, Check } from 'lucide-react';
import { Recipe } from '@/utils/localStorage';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import FavoriteRecipes from '@/components/FavoriteRecipes';


const RecipeCard = ({ recipe }: { recipe: Recipe }) => {
  console.log(recipe);
  
  const { updateRecipeLike, markRecipeAsEaten } = useHealth();
  
  const handleLike = () => {
    if (recipe.eaten) {
      toast("Recipe already eaten", {
        description: "You can't change preferences after marking as eaten",
      });
      return;
    }
    updateRecipeLike(recipe.id, !recipe.liked, false);
  };
  
  const handleDislike = () => {
    if (recipe.eaten) {
      toast("Recipe already eaten", {
        description: "You can't change preferences after marking as eaten",
      });
      return;
    }
    updateRecipeLike(recipe.id, false, !recipe.disliked);
  };
  
  const handleMarkAsEaten = () => {
    markRecipeAsEaten(recipe.id);
  };
  
  return (
    <Card className="recipe-card h-full flex flex-col">
      <CardHeader className="pb-2">
        <div 
          className="w-full h-80 bg-muted rounded-lg mb-4 overflow-hidden"
          style={{
            backgroundImage: `url(${recipe.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <CardTitle className="text-lg flex items-center justify-between">
          {recipe.name}
          {recipe.eaten && (
            <HoverCard>
              <HoverCardTrigger>
                <span className="flex items-center text-green-500">
                  <Check className="h-5 w-5 mr-1" />
                </span>
              </HoverCardTrigger>
              <HoverCardContent className="text-sm">
                <div>Eaten on {new Date(recipe.eatenAt || '').toLocaleDateString()}</div>
              </HoverCardContent>
            </HoverCard>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1">
        <div className="flex items-center text-muted-foreground text-sm mb-3">
          <Clock className="h-4 w-4 mr-1" />
          <span>{recipe.prepTime} min</span>
        </div>
        
        <h4 className="font-medium text-sm mb-2">Ingredients:</h4>
        <ul className="text-sm space-y-1 list-disc pl-4 text-muted-foreground">
          {recipe.ingredients.map((ingredient, idx) => (
            <li key={idx}>{ingredient}</li>
          ))}
        </ul>
      </CardContent>
      
      <CardFooter className="pt-2 border-t flex flex-col gap-2">
        {!recipe.eaten ? (
          <>
            <Button 
              variant="outline" 
              className="w-full border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
              onClick={handleMarkAsEaten}
            >
              <Check className="h-4 w-4 mr-2" /> Mark as Eaten
            </Button>
            
            <div className="flex justify-between w-full">
              <button
                className={`flex items-center text-sm ${
                  recipe.liked ? 'text-green-500 font-medium' : 'text-muted-foreground'
                }`}
                onClick={handleLike}
              >
                <ThumbsUp className={`h-4 w-4 mr-1 ${recipe.liked ? 'fill-green-500' : ''}`} />
                {recipe.liked ? 'Liked' : 'Like'}
              </button>
              
              <button
                className={`flex items-center text-sm ${
                  recipe.disliked ? 'text-destructive font-medium' : 'text-muted-foreground'
                }`}
                onClick={handleDislike}
              >
                {recipe.disliked ? 'Disliked' : 'Dislike'}
                <ThumbsDown className={`h-4 w-4 ml-1 ${recipe.disliked ? 'fill-destructive' : ''}`} />
              </button>
            </div>
          </>
        ) : (
          <div className="text-center text-sm text-muted-foreground">
            You've already eaten this meal
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

const DietPlanner = () => {
  const { healthData } = useHealth();
  const { recipes } = healthData;
  
  // Filter recipes by meal type
  const breakfastRecipes = recipes.filter(recipe => recipe.mealType === 'breakfast');
  const lunchRecipes = recipes.filter(recipe => recipe.mealType === 'lunch');
  const dinnerRecipes = recipes.filter(recipe => recipe.mealType === 'dinner');
  const snackRecipes = recipes.filter(recipe => recipe.mealType === 'snack');
  
  // Get favorite recipes (liked ones)
  const favoriteRecipes = recipes.filter(recipe => recipe.liked);
  
  // Get eaten meals for today
  const todayEaten = recipes.filter(recipe => {
    if (!recipe.eaten || !recipe.eatenAt) return false;
    const eatenDate = new Date(recipe.eatenAt);
    const today = new Date();
    return eatenDate.toDateString() === today.toDateString();
  });
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Diet Planner</h1>
        <p className="text-muted-foreground">Discover and save your favorite healthy recipes</p>
      </div>
      
      {/* Today's Meals Section */}
      {todayEaten.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Today's Meals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {todayEaten.map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </div>
      )}
      
      {/* Favorite Recipes Section */}
      {favoriteRecipes.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Your Favorite Recipes</h2>
          <FavoriteRecipes likedRecipes={favoriteRecipes} />
        </div>
      )}
      
      {/* Meal Type Tabs */}
      <Tabs defaultValue="breakfast">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="breakfast">Breakfast</TabsTrigger>
          <TabsTrigger value="lunch">Lunch</TabsTrigger>
          <TabsTrigger value="dinner">Dinner</TabsTrigger>
          <TabsTrigger value="snacks">Snacks</TabsTrigger>
        </TabsList>
        
        <TabsContent value="breakfast" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {breakfastRecipes.map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="lunch" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lunchRecipes.map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="dinner" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dinnerRecipes.map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="snacks" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {snackRecipes.map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
      
      {favoriteRecipes.length === 0 && todayEaten.length === 0 && (
        <Card className="p-8 text-center mt-4">
          <div className="text-3xl mb-4">🍽️</div>
          <h3 className="text-xl font-semibold mb-2">No Favorite or Eaten Recipes Yet</h3>
          <p className="text-muted-foreground">
            Like your favorite recipes or mark meals as eaten to see them appear here for quick access.
          </p>
        </Card>
      )}
    </div>
  );
};

export default DietPlanner;
