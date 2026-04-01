import { useState, useMemo } from "react"

interface UsePaginationOptions {
  totalItems: number
  itemsPerPage?: number
  initialPage?: number
}

interface UsePaginationReturn {
  currentPage: number
  totalPages: number
  itemsPerPage: number
  offset: number
  setPage: (page: number) => void
  nextPage: () => void
  prevPage: () => void
  setItemsPerPage: (size: number) => void
  canNext: boolean
  canPrev: boolean
  /** Slice an array to the current page */
  paginate: <T>(items: T[]) => T[]
}

/**
 * Hook phân trang đơn giản
 */
export function usePagination({
  totalItems,
  itemsPerPage: initialSize = 10,
  initialPage = 1,
}: UsePaginationOptions): UsePaginationReturn {
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [itemsPerPage, setItemsPerPageState] = useState(initialSize)

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalItems / itemsPerPage)),
    [totalItems, itemsPerPage]
  )

  const offset = (currentPage - 1) * itemsPerPage

  const setPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page)
  }

  const nextPage = () => setPage(currentPage + 1)
  const prevPage = () => setPage(currentPage - 1)

  const setItemsPerPage = (size: number) => {
    setItemsPerPageState(size)
    setCurrentPage(1)
  }

  const paginate = <T>(items: T[]): T[] =>
    items.slice(offset, offset + itemsPerPage)

  return {
    currentPage,
    totalPages,
    itemsPerPage,
    offset,
    setPage,
    nextPage,
    prevPage,
    setItemsPerPage,
    canNext: currentPage < totalPages,
    canPrev: currentPage > 1,
    paginate,
  }
}
