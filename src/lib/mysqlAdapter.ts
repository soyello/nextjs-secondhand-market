import { AdapterSession, AdapterUser } from 'next-auth/adapters';
import pool from './db';
import { ProductRow, SessionRow, UserRow } from '@/helper/row';
import { mapToAdapterSession, mapToAdapterUser, mapToProducts } from '@/helper/mapper';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { Product } from '@/helper/type';
import { buildWhereClause } from '@/helper/buildWhereClause';

type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

interface TotalItemRow extends RowDataPacket {
  totalItems: number;
}

const mySQLAdapter = {
  async getProducts(
    query: Record<string, any> = {},
    page: number,
    itemsPerPage: number
  ): Promise<{ data: Product[]; totalItems: number }> {
    const { where, values } = buildWhereClause(query, ['category', 'latitude', 'longitude']);

    const countSQL = `SELECT COUNT(*) as totalItems FROM products ${where}`;
    let totalItems = 0;

    try {
      const [countResult] = await pool.query<TotalItemRow[]>(countSQL, values);
      totalItems = (countResult && countResult[0]?.totalItems) || 0;
    } catch (error) {
      console.error('Error fetching total items:', error);
      throw new Error('Error fetching total item count from the database.');
    }
    const offset = (page - 1) * itemsPerPage;

    const sql = `
        SELECT
          id,
          title,
          description,
          image_src,
          category,
          latitude,
          longitude,
          price,
          user_id,
          created_at,
          updated_at
        FROM products
        ${where}
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
        `;
    const paginationValues = [...values, itemsPerPage, offset];
    try {
      const [rows] = await pool.query<ProductRow[]>(sql, paginationValues);
      return { data: mapToProducts(rows), totalItems };
    } catch (error) {
      console.error('Database query error:', { query, sql, values, error });
      throw new Error('Error fetching products form the database');
    }
  },
  async createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const { title, description, imageSrc, category, latitude, longitude, price, userId } = product;
    if (!title || !description || !imageSrc || !category || !latitude || !longitude || !price || !userId) {
      throw new Error('All product fields are required.');
    }
    try {
      const [result] = await pool.query<ResultSetHeader>(
        'INSERT INTO products (title, description, image_src, category, latitude, longitude, price, user_id) VALUES (?,?,?,?,?,?,?,?)',
        [title, description, imageSrc, category, latitude, longitude, price, userId]
      );
      return {
        id: result.insertId.toString(),
        title,
        description,
        imageSrc,
        category,
        latitude,
        longitude,
        price,
        userId,
        createdAt: new Date(),
        updatedAt: null,
      };
    } catch (error) {
      console.error('Error creating product:', error);
      throw new Error('An error occured while creating the product.');
    }
  },
  async getUser(email: string): Promise<AdapterUser | null> {
    if (!email) {
      throw new Error('Email must be provided.');
    }
    try {
      const [rows] = await pool.query<UserRow[]>(
        'SELECT id, name, email, user_type, favorite_ids, created_at, updated_at, hashed_password FROM users WHERE email=?',
        [email]
      );
      return rows[0] ? mapToAdapterUser(rows[0]) : null;
    } catch (error) {
      console.error('Error fetching user by Email:', error);
      throw new Error('Failed fetch user.');
    }
  },
  async createUser(
    user: Omit<AdapterUser, 'id' | 'emailVerified' | 'role' | 'createdAt' | 'updatedAt' | 'favoriteIds'>
  ): Promise<Omit<AdapterUser, 'hashedPassword'>> {
    const { name, email, hashedPassword } = user;
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO users (name, email, hashed_password) VALUES (?,?,?)',
      [name, email, hashedPassword]
    );
    return {
      id: result.insertId.toString(),
      name,
      email,
      role: 'User',
      createdAt: new Date(),
      updatedAt: null,
      image: null,
      emailVerified: null,
      favoriteIds: [],
    };
  },
  async updateUser(user: Partial<Nullable<AdapterUser>> & { email: string }): Promise<AdapterUser> {
    const { email, name, image, role, favoriteIds } = user;
    if (!email) {
      throw new Error('User Email is required for updating');
    }

    const updates: Record<string, any> = {
      name,
      image,
      user_type: role,
      favorite_ids: favoriteIds ? JSON.stringify(favoriteIds) : null,
    };
    const keys = Object.keys(updates).filter((key) => updates[key as keyof typeof updates] !== undefined);

    if (keys.length === 0) {
      throw new Error('No fields to update. Provide at least one field.');
    }

    const fields = keys.map((key) => `${key}=?`).join(', ');
    const values = keys.map((key) => updates[key as keyof typeof updates]);
    try {
      await pool.query(`UPDATE users SET ${fields} WHERE email=?`, [...values, email]);

      const [rows] = await pool.query<UserRow[]>(
        'SELECT email, name, image, user_type, favorite_ids, created_at, updated_at FROM users WHERE email=?',
        [email]
      );
      if (!rows.length) {
        throw new Error(`User with Email: ${email} not found after update.`);
      }
      return mapToAdapterUser(rows[0]);
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Failed to update user.');
    }
  },
  async deleteUser(email: string): Promise<void> {
    await pool.query('DELETE FROM users WHERE email=?', [email]);
  },
  async getSessionAndUser(sessionToken: string): Promise<{ session: AdapterSession; user: AdapterUser } | null> {
    if (!sessionToken) {
      throw new Error('sessionToken must be required.');
    }
    try {
      const [results] = await pool.query<(SessionRow & UserRow)[]>(
        `SELECT
          s.session_token AS session_token,
          s.user_id AS user_id,
          s.expires AS expires,
          u.id AS id,
          u.name AS name,
          u.user_type AS user_type,
          u.image AS image,
          u.created_at AS created_at,
          u.updated_at AS updated_at,
          u.email_verified AS email_verified
        FROM sessions AS s
        LEFT JOIN users AS u ON s.user_id=u.id
        WHERE s.session_token=?`,
        [sessionToken]
      );
      const result = results[0];
      if (!result) return null;
      const session = mapToAdapterSession(result);
      const user = mapToAdapterUser(result);
      return { session, user };
    } catch (error) {
      console.error('Error fetching session and user:', error);
      throw new Error('Failed to fetching session and user.');
    }
  },
  async createSession(session: AdapterSession): Promise<AdapterSession> {
    const { sessionToken, userId, expires } = session;
    if (!sessionToken || !userId || !expires) {
      throw new Error('All fields (sessionToken, userId, expires) are required to create a session.');
    }
    try {
      await pool.query('INSERT INTO sessions (session_token, user_id, expires) VALUES(?,?,?)', [
        sessionToken,
        userId,
        expires,
      ]);
      const [rows] = await pool.query<SessionRow[]>(
        'SELECT session_token, user_id, expires FROM sessions WHERE session_token = ?',
        [sessionToken]
      );
      const result = rows[0];
      if (!result) {
        throw new Error('Failed to retrieve the created session from the database.');
      }
      return mapToAdapterSession(result);
    } catch (error) {
      console.error('Error creating session:', error);
      throw new Error('Failed to create session.');
    }
  },
  async updateSession(session: Nullable<AdapterSession> & { sessionToken: string }): Promise<AdapterSession | null> {
    const { sessionToken, userId, expires } = session;
    if (!sessionToken) {
      throw new Error('Session token is required to update a session.');
    }
    try {
      const updates = { user_id: userId, expires };
      const keys = Object.keys(updates).filter((key) => updates[key as keyof typeof updates] !== undefined);

      if (keys.length === 0) {
        throw new Error('No fields to update. Provide at least on fields.');
      }
      const fields = keys.map((key) => `${key}=?`).join(', ');
      const values = keys.map((key) => updates[key as keyof typeof updates]);

      const query = `UPDATE sessions SET ${fields} WHERE session_token=?`;
      await pool.query(query, [...values, sessionToken]);

      const [rows] = await pool.query<SessionRow[]>(
        'SELECT session_token, user_id, expires FROM sessions WHERE session_token=?',
        [sessionToken]
      );
      if (!rows.length) {
        return null;
      }
      return mapToAdapterSession(rows[0]);
    } catch (error) {
      console.error(`Error updating session for token ${sessionToken}:`, error);
      throw new Error('Failed to update session.');
    }
  },
  async deleteSession(sessionToken: string): Promise<void> {
    if (!sessionToken) {
      throw new Error('Session token is required to delete a session.');
    }
    try {
      await pool.query('DELETE FROM sessions WHERE session_token=?', [sessionToken]);
    } catch (error) {
      console.error('Error deleting session:', error);
      throw new Error('Failed to delete session.');
    }
  },
};

export default mySQLAdapter;
