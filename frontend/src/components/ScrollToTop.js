import React, { useEffect } from "react"

const ScrollToTop = () => {
  // Scroll to top of page
  const scrollUp = () => {
    document.body.scrollTop = 0
    document.documentElement.scrollTop = 0
  }

  // Add event listener to fade in scroll button
  useEffect(() => {
    window.addEventListener("scroll", showScrollToTop, { passive: true })
    return () => {
      window.removeEventListener("scroll", showScrollToTop)
    }
  }, [])

  // Fade in scroll button when user scrolls down
  const showScrollToTop = () => {
    const scrollButton = document.getElementById("scrollButton")
    if (
      document.body.scrollTop > 20 ||
      document.documentElement.scrollTop > 20
    ) {
      scrollButton.classList.toggle("hidden", false)
    } else {
      scrollButton.classList.toggle("hidden", true)
    }
  }

  return (
    <>
      <button
        id="scrollButton"
        className="fixed bottom-5 right-10 text-gray-200 bg-gray-500 bg-opacity-40 border border-gray-300 rounded p-2 hidden"
        onClick={scrollUp}
      >
        Scroll to Top
      </button>
    </>
  )
}

export default ScrollToTop
