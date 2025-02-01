import { AdapterUser } from 'next-auth/adapters';
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai';
import useFavorite from '../helper/useFavorite';

interface HeartButtonProps {
  productId: string;
  currentUser: AdapterUser | null;
}

const HeartButton = ({ productId, currentUser }: HeartButtonProps) => {
  const { hasFavorite, toggleFavorite } = useFavorite({ productId, currentUser });
  return (
    <div onClick={toggleFavorite} className='relative transition cursor-pointer hover:opacity-80'>
      <AiOutlineHeart size={28} className='fill-white absolute -top-[2px] -right-[2px]' />
      <AiFillHeart size={24} className={hasFavorite ? 'fill-rose-500' : 'fill-neutral-500'} />
    </div>
  );
};

export default HeartButton;
