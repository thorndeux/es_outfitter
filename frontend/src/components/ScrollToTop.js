import React from 'react'

const ScrollToTop = () => {
  const scrollUp = () => {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }

  window.onscroll = () => {
    const scrollButton = document.getElementById('scrollButton')
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
      scrollButton.style.display = "block";
    } else {
      scrollButton.style.display = "none";
    }
  }

  return (
    <>
      <button id="scrollButton" className="fixed bottom-5 right-10 text-gray-200 bg-gray-500 bg-opacity-40 border border-gray-300 rounded p-2 hidden" onClick={scrollUp}>Scroll to Top</button>
    </>
  )
}

export default ScrollToTop
