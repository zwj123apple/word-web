import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPages = 10; // Max number of pages to show
    const ellipsis = '...';

    if (totalPages <= maxPages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      let startPage, endPage;
      if (currentPage <= Math.ceil(maxPages / 2)) {
        startPage = 1;
        endPage = maxPages - 1;
        pageNumbers.push(...Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i));
        pageNumbers.push(ellipsis);
        pageNumbers.push(totalPages);
      } else if (currentPage + Math.floor(maxPages / 2) >= totalPages) {
        startPage = totalPages - maxPages + 2;
        endPage = totalPages;
        pageNumbers.push(1);
        pageNumbers.push(ellipsis);
        pageNumbers.push(...Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i));
      } else {
        startPage = currentPage - Math.floor((maxPages - 2) / 2);
        endPage = currentPage + Math.floor((maxPages - 2) / 2);
        pageNumbers.push(1);
        pageNumbers.push(ellipsis);
        pageNumbers.push(...Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i));
        pageNumbers.push(ellipsis);
        pageNumbers.push(totalPages);
      }
    }
    return pageNumbers;
  };

  const pageNumbers = renderPageNumbers();

  return (
    <nav className="flex justify-center my-4">
      <ul className="flex items-center -space-x-px h-10 text-base">
        {pageNumbers.map((number, index) => (
          <li key={index}>
            {number === '...' ? (
              <span className="flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300">...</span>
            ) : (
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(number);
                }}
                className={`flex items-center justify-center px-4 h-10 leading-tight ${number === currentPage ? 'text-blue-600 border border-blue-300 bg-blue-50 hover:bg-blue-100 hover:text-blue-700' : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700'}`}>
                {number}
              </a>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Pagination;
