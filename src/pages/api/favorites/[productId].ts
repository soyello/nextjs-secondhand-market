import getCurrentUser from '@/lib/getCurrentUser';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import mySQLAdapter from '@/lib/mysqlAdapter';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const currentUser = await getCurrentUser(session.user.email);
  if (!currentUser) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const { productId } = req.query;
  if (!productId || typeof productId !== 'string') {
    return res.status(400).json({ error: 'Invalid ProductId' });
  }
  try {
    if (req.method === 'POST') {
      const favorite_ids = Array.from(new Set([...(currentUser.favoriteIds || []), productId]));
      const updatedUser = await mySQLAdapter.updateUser({ email: currentUser.email, favoriteIds: favorite_ids });
      return res.status(200).json(updatedUser);
    } else if (req.method === 'DELETE') {
      const favorite_ids = (currentUser.favoriteIds || []).filter((id) => id !== productId);
      const updatedUser = await mySQLAdapter.updateUser({
        email: currentUser.email,
        favoriteIds: favorite_ids,
      });
      return res.status(200).json(updatedUser);
    } else {
      res.setHeader('Allow', ['POST', 'DELETE']);
      return res.status(405).end(`Method ${req.method} NOT Allowed`);
    }
  } catch (error) {
    console.error('Failed to update user:', error);
    return res.status(500).json({ error: 'Internal Server Error.' });
  }
}
