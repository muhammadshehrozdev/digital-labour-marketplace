// Pages most visitors never open are loaded on demand (Batch 4): the first download stays small.
// While one loads, the usual page placeholder is shown.
import { lazy, Suspense } from 'react';
import { PageLoading } from './guards';

export function lazyPage(load) {
  const Page = lazy(load);
  return function LazyPage() {
    return <Suspense fallback={<PageLoading />}><Page /></Suspense>;
  };
}
