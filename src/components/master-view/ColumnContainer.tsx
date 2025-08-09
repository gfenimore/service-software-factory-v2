import React, { useRef, useEffect, useState, useCallback } from 'react'

interface ColumnContainerProps {
  children: React.ReactNode
  width: 'fixed-300' | 'fixed-400' | 'flexible'
  header?: React.ReactNode
  className?: string
  onScroll?: (scrollTop: number, scrollHeight: number, clientHeight: number) => void
  scrollToTop?: boolean
}

export const ColumnContainer: React.FC<ColumnContainerProps> = ({
  children,
  width,
  header,
  className = '',
  onScroll,
  scrollToTop = false
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isScrolling, setIsScrolling] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)

  const getWidthClass = () => {
    switch (width) {
      case 'fixed-300':
        return 'w-[300px]'
      case 'fixed-400':
        return 'w-[400px]'
      case 'flexible':
        return 'flex-1'
      default:
        return ''
    }
  }

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget
    const { scrollTop, scrollHeight, clientHeight } = target
    
    setIsScrolling(true)
    setShowScrollTop(scrollTop > 100)
    
    onScroll?.(scrollTop, scrollHeight, clientHeight)
    
    const timeoutId = setTimeout(() => setIsScrolling(false), 150)
    return () => clearTimeout(timeoutId)
  }, [onScroll])

  const scrollToTopHandler = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }
  }, [])

  useEffect(() => {
    if (scrollToTop && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }
  }, [scrollToTop])

  return (
    <div className={`column-container flex flex-col h-full p-4 relative ${getWidthClass()} ${className}`}>
      {header && (
        <div className="column-header mb-4 flex-shrink-0">
          {header}
        </div>
      )}
      <div 
        ref={scrollContainerRef}
        className={`column-content flex-1 overflow-y-auto scroll-smooth transition-all duration-200 ${
          isScrolling ? 'scrollbar-thumb-blue-400' : 'scrollbar-thumb-gray-300'
        } scrollbar-thin scrollbar-track-transparent hover:scrollbar-thumb-gray-400`}
        onScroll={handleScroll}
      >
        {children}
      </div>
      
      {showScrollTop && (
        <button
          onClick={scrollToTopHandler}
          className="absolute bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg transition-all duration-200 z-10"
          aria-label="Scroll to top"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 15l7-7 7 7"
            />
          </svg>
        </button>
      )}
    </div>
  )
}

export default ColumnContainer