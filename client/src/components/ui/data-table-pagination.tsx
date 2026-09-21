import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

/**
 * Số trang "lân cận" hiển thị quanh trang hiện tại.
 * Ví dụ SIBLINGS = 1  →  hiển thị  [currentPage - 1, currentPage, currentPage + 1]
 */
const SIBLINGS = 1

interface DataTablePaginationProps {
  /** Trang hiện tại (0-indexed) */
  pageIndex: number
  /** Tổng số trang */
  pageCount: number
  /** Có thể lùi không? */
  canPreviousPage: boolean
  /** Có thể tiến không? */
  canNextPage: boolean
  /** Callback khi chuyển trang */
  onPageChange: (pageIndex: number) => void
  onPreviousPage: () => void
  onNextPage: () => void
}

/**
 * Tính danh sách page numbers cần render, bao gồm cả ellipsis.
 * Trả về mảng chứa số (page 0-indexed) hoặc string 'ellipsis-start' / 'ellipsis-end'.
 *
 * Luôn hiển thị: trang đầu, trang cuối, trang hiện tại ± SIBLINGS.
 * Khi khoảng cách giữa các vùng > 1 → chèn ellipsis.
 */
function getPageRange(
  pageIndex: number,
  pageCount: number
): (number | 'ellipsis-start' | 'ellipsis-end')[] {
  if (pageCount <= 1) return []

  // Tính vùng lân cận
  const leftSibling = Math.max(pageIndex - SIBLINGS, 0)
  const rightSibling = Math.min(pageIndex + SIBLINGS, pageCount - 1)

  // Có cần ellipsis bên trái? (khi vùng lân cận cách trang đầu > 1 ô)
  const showLeftEllipsis = leftSibling > 1
  // Có cần ellipsis bên phải?
  const showRightEllipsis = rightSibling < pageCount - 2

  const pages: (number | 'ellipsis-start' | 'ellipsis-end')[] = []

  // Luôn hiển thị trang đầu
  pages.push(0)

  if (showLeftEllipsis) {
    pages.push('ellipsis-start')
  } else {
    // Hiển thị tất cả trang từ 1 đến leftSibling - 1
    for (let i = 1; i < leftSibling; i++) {
      pages.push(i)
    }
  }

  // Hiển thị vùng lân cận (bỏ qua trang đầu và cuối vì đã thêm riêng)
  for (let i = leftSibling; i <= rightSibling; i++) {
    if (i !== 0 && i !== pageCount - 1) {
      pages.push(i)
    }
  }

  if (showRightEllipsis) {
    pages.push('ellipsis-end')
  } else {
    // Hiển thị tất cả trang từ rightSibling + 1 đến pageCount - 2
    for (let i = rightSibling + 1; i < pageCount - 1; i++) {
      pages.push(i)
    }
  }

  // Luôn hiển thị trang cuối (nếu > 1 trang)
  if (pageCount > 1) {
    pages.push(pageCount - 1)
  }

  return pages
}

export function DataTablePagination({
  pageIndex,
  pageCount,
  canPreviousPage,
  canNextPage,
  onPageChange,
  onPreviousPage,
  onNextPage,
}: DataTablePaginationProps) {
  const pages = getPageRange(pageIndex, pageCount)

  if (pageCount <= 1) return null

  return (
    <Pagination className='mx-0 w-auto'>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            text='Trước'
            onClick={canPreviousPage ? onPreviousPage : undefined}
            className={!canPreviousPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
          />
        </PaginationItem>

        {pages.map(page =>
          typeof page === 'string' ? (
            <PaginationItem key={page}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={page}>
              <PaginationLink
                isActive={page === pageIndex}
                onClick={() => onPageChange(page)}
                className='cursor-pointer'
              >
                {page + 1}
              </PaginationLink>
            </PaginationItem>
          )
        )}

        <PaginationItem>
          <PaginationNext
            text='Sau'
            onClick={canNextPage ? onNextPage : undefined}
            className={!canNextPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
