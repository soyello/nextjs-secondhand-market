import { GetServerSideProps } from 'next';
import { AdapterUser } from 'next-auth/adapters';
import React from 'react';

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/currentUser`, {
      headers: {
        cookie: context.req.headers.cookie || '',
      },
    });
    if (response.status === 401) {
      return {
        redirect: {
          destination: '/auth/login',
          permanent: false,
        },
      };
    }
    if (!response.ok) {
      throw new Error(`Failed to fetch user:${response.statusText}`);
    }
    const currentUser = await response.json();

    return {
      props: {
        currentUser,
      },
    };
  } catch (error) {
    console.error('Error in getServerSideProps', error);
    return {
      redirect: {
        destination: '/auth/login',
        permanent: false,
      },
    };
  }
};

const UserPage = ({ currentUser }: { currentUser: AdapterUser }) => {
  return (
    <div>
      <h1>Hello, {currentUser.name}</h1>
    </div>
  );
};

export default UserPage;
