import axios from 'axios';
import { AdapterUser } from 'next-auth/adapters';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

interface UserFavorites {
  productId: string;
  currentUser: AdapterUser | null;
}

const useFavorite = ({ productId, currentUser }: UserFavorites) => {
  const router = useRouter();
  const [hasFavorite, setHasFavorite] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setHasFavorite(currentUser.favoriteIds.includes(productId) || false);
    }
  }, [currentUser, productId]);

  const toggleFavorite = async (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();

    if (!currentUser) {
      console.log('No current user, redirecting to login.');
      router.push('/auth/login');
      return;
    }

    try {
      if (hasFavorite) {
        await axios.delete(`/api/favorites/${productId}`);
      } else {
        await axios.post(`/api/favorites/${productId}`);
      }
      setHasFavorite(!hasFavorite);
    } catch (error) {
      console.error('Error toggling favorite status:', error);
    }
  };

  return {
    hasFavorite,
    toggleFavorite,
  };
};
export default useFavorite;
