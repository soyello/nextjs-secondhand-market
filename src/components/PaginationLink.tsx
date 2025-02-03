import { PRODUCTS_PER_PAGE } from '@/constants';
import { useSearchParams } from 'next/navigation';
import React, { PropsWithChildren } from 'react';
import qs from 'query-string';
import Link from 'next/link';

type PaginationLinkProps = {
  page?: number | string;
  active?: boolean;
  disabled?: boolean;
} & PropsWithChildren;

const PaginationLink = ({ page, active, children, disabled }: PaginationLinkProps) => {
  const params = useSearchParams();

  let currentQuery = {};

  if (params) {
    currentQuery = qs.parse(params?.toString());
  }

  const updatedQuery = {
    ...currentQuery,
    page,
  };
  return (
    <Link
      href={{ query: updatedQuery }}
      className={`
      p-2
      text-2xl
      ${active ? 'font-bold text-slate-500' : 'text-gray-500'}
      ${disabled ? 'pointer-events-none text-gray-200' : ''}`}
    >
      {children}
    </Link>
  );
};

export default PaginationLink;
