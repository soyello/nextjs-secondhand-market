import { signIn, signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import React from 'react';

type navItemsProps =
  | { href: string; label: string; type: 'link' }
  | { label: string; type: 'button'; onClick: () => void };

const NavItem = ({ mobile }: { mobile?: boolean }) => {
  const { data: session, status } = useSession();
  console.log({ session }, status);

  const navItems: navItemsProps[] = [
    { href: '/admin', label: 'Admin', type: 'link' },
    { href: '/user', label: 'User', type: 'link' },
    session?.user
      ? { label: 'SignOut', type: 'button', onClick: () => signOut() }
      : { label: 'SignIn', type: 'button', onClick: () => signIn() },
  ];
  return (
    <ul className={`flex items-center justify-center gap-4 tex-md w-full ${mobile && 'flex-col h-full'}`}>
      {navItems.map((item, index) => (
        <div key={index} className='py-2 border-b-2 border-selected cursor-pointer text-center'>
          {item.type === 'link' ? (
            <Link href={item.href}>{item.label}</Link>
          ) : (
            <button onClick={item.onClick}>{item.label}</button>
          )}
        </div>
      ))}
    </ul>
  );
};

export default NavItem;
