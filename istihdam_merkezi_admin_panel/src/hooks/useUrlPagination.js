import { useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const useUrlPagination = (defaultLimit = 10) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialPage = parseInt(searchParams.get('page'), 10) || 1;

  const [pagination, _setPagination] = useState({
    page: initialPage,
    limit: defaultLimit,
    total: 0,
    totalPages: 0,
  });

  const setPagination = useCallback((value) => {
    _setPagination((prev) => {
      const next = typeof value === 'function' ? value(prev) : value;

      if (next.page !== prev.page) {
        const container = document.getElementById('main-scroll-container');
        if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
      }

      setSearchParams((params) => {
        if (next.page > 1) {
          params.set('page', next.page.toString());
        } else {
          params.delete('page');
        }
        return params;
      }, { replace: true });

      return next;
    });
  }, [setSearchParams]);

  return [pagination, setPagination];
};

export default useUrlPagination;
