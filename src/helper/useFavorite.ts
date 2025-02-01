import axios from 'axios';
import { AdapterUser } from 'next-auth/adapters';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

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
      toast.warn('먼저 로그인 하세용.');
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
      toast.success('성공했습니다.');
    } catch (error) {
      console.error('Error toggling favorite status:', error);
      toast.error('실패했습니다.');
    }
  };

  return {
    hasFavorite,
    toggleFavorite,
  };
};
export default useFavorite;
