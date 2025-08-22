import React from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

interface CustomPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
}

/**
 * Custom pagination component that supports current page, total pages, and page change events
 */
export const CustomPagination: React.FC<CustomPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
}) => {
  // Generate page numbers array based on current page and total pages
  const getPageNumbers = () => {
    // For very large total pages (like over 1000), we'll limit what we show
    const maxVisibleLastPage = totalPages > 1000 ? 100 : totalPages;
    
    // Always show first page
    const firstPage = 1;
    const lastPage = maxVisibleLastPage;
    
    // Calculate range to show
    const leftSiblingIndex = Math.max(currentPage - siblingCount, firstPage);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, lastPage);
    
    // Initialize array of pages to show
    const pageNumbers: (number | string)[] = [];
    
    // Add first page if not included in the range
    if (leftSiblingIndex > firstPage) {
      pageNumbers.push(firstPage);
      // Add ellipsis if there's a gap
      if (leftSiblingIndex > firstPage + 1) {
        pageNumbers.push('left-ellipsis');
      }
    }
    
    // Add pages in the range
    for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
      pageNumbers.push(i);
    }
    
    // Add last page if not included in the range
    if (rightSiblingIndex < lastPage) {
      // Add ellipsis if there's a gap
      if (rightSiblingIndex < lastPage - 1) {
        pageNumbers.push('right-ellipsis');
      }
      pageNumbers.push(lastPage);
    }
    
    // If we're limiting total pages display, add an indication
    if (maxVisibleLastPage < totalPages) {
      pageNumbers.push('more-pages');
    }
    
    return pageNumbers;
  };
  
  // If there's only one page, don't show pagination
  if (totalPages <= 1) return null;
  
  const pageNumbers = getPageNumbers();
  
  return (
    <Pagination>
      <PaginationContent>
        {/* Previous button */}
        <PaginationItem>
          <PaginationPrevious 
            onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
            className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
            tabIndex={currentPage <= 1 ? -1 : 0}
          />
        </PaginationItem>
        
        {/* Page numbers */}
        {pageNumbers.map((pageNumber, index) => {
          // Handle ellipsis and more-pages indicator
          if (pageNumber === 'left-ellipsis' || pageNumber === 'right-ellipsis') {
            return (
              <PaginationItem key={`${pageNumber}-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            );
          }
          
          if (pageNumber === 'more-pages') {
            return (
              <PaginationItem key="more-pages">
                <span className="text-xs text-gray-500 px-2">
                  (და მეტი...)
                </span>
              </PaginationItem>
            );
          }
          
          // Handle number pages
          const page = pageNumber as number;
          return (
            <PaginationItem key={page}>
              <PaginationLink
                isActive={currentPage === page}
                onClick={() => onPageChange(page)}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          );
        })}
        
        {/* Next button */}
        <PaginationItem>
          <PaginationNext 
            onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
            className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
            tabIndex={currentPage >= totalPages ? -1 : 0}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default CustomPagination;