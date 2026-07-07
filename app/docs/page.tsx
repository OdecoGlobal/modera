'use client';

import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import { QUERY_STALE_TIME } from '@/constant/query';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import ErrorState from '@/components/custom/states/error-state';
const getDocs = async () => {
  const res = await fetch('/api/docs', { credentials: 'include' });
  //   console.log(res);

  const data = await res.json();
  console.log(data);

  return data;
};

const ApiDocsPage = () => {
  const { isPending, error, isError, data } = useQuery({
    queryFn: getDocs,
    queryKey: ['api-docs'],
    staleTime: QUERY_STALE_TIME,
    placeholderData: keepPreviousData,
  });

  if (isPending) {
    return <>Loading...</>;
  }
  if (isError) {
    return <ErrorState error={error} />;
  }
  return (
    <div className="swagger-wrapper">
      <SwaggerUI spec={data} />
    </div>
  );
};

export default ApiDocsPage;
