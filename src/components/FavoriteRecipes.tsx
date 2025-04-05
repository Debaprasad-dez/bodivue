
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Recipe } from '@/utils/localStorage';
import { ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface FavoriteRecipesProps {
  likedRecipes: Recipe[];
}

const RecipeTag = ({ type }: { type: string }) => {
  const getTagColor = () => {
    switch (type.toLowerCase()) {
      case 'breakfast':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      case 'lunch':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'dinner':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100';
      case 'snack':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
    }
  };

  return (
    <span className={`text-xs px-2 py-1 rounded-full ${getTagColor()}`}>
      {type}
    </span>
  );
};

const FavoriteRecipes = ({ likedRecipes }: FavoriteRecipesProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleRecipe = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (likedRecipes.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No favorite recipes yet. Like some recipes to see them here!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {likedRecipes.map((recipe) => (
        <Collapsible
          key={recipe.id}
          open={expandedId === recipe.id}
          onOpenChange={() => toggleRecipe(recipe.id)}
          className="transition-all duration-200"
        >
          <Card className={`${expandedId === recipe.id ? 'ring-2 ring-primary' : 'hover:shadow-md'} transition-all duration-200`}>
            <CollapsibleTrigger asChild>
              <CardContent className="p-3 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <div className="font-medium truncate">{recipe.name}</div>
                    <RecipeTag type={recipe.mealType} />
                  </div>
                  {expandedId === recipe.id ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </CardContent>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0 px-3 pb-3">
                <div className="text-sm space-y-2">
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="mr-1 h-3 w-3" />
                    <span>{recipe.prepTime} minutes</span>
                  </div>
                  
                  <div className="mt-2">
                    <p className="font-medium text-xs text-muted-foreground mb-1">Ingredients:</p>
                    <ul className="text-xs list-disc pl-4 space-y-1">
                      {recipe.ingredients.map((ingredient, index) => (
                        <li key={index}>{ingredient}</li>
                      ))}
                    </ul>
                  </div>
                  
                  {recipe.eaten && (
                    <p className="text-xs text-green-600 dark:text-green-400 flex items-center mt-2">
                      ✅ Last eaten: {new Date(recipe.eatenAt || '').toLocaleDateString()}
                    </p>
                  )}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      ))}
    </div>
  );
};

export default FavoriteRecipes;
