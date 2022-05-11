let DEBUG = true

document.addEventListener('DOMContentLoaded', () => {
  // alert("I'm connected")
  let form = document.querySelector('form')

  form.addEventListener('submit', (e) => {
    e.preventDefault()
    let searchTerm = e.target.bookSearch.value
    if (DEBUG) { console.log(e.target.bookSearch.value) }
    fetch(`https://www.googleapis.com/books/v1/volumes?q=${searchTerm}`)
      .then(res => res.json())
      .then(data => {
        handleResponse(data)
      })
    form.reset()
  })

  function handleResponse(data) {
    let bookShelf = document.getElementById("bookShelf")
    let bookList = document.getElementById("booksList")
    bookList.innerHTML = ""
    //TODO: Make a button that expands or collapses all items
    for (var i = 0; i < data.items.length; i++) {
      var item = data.items[i];
      // in production code, item.text should have the HTML entities escaped.
      if (data.items.length === 0) {
        booksList.innerHTML = "Sorry no books"
      }
      console.log(item.volumeInfo.description)
      bookList.innerHTML += `
        <li class="details">
          <details class="bookInfo">
            <summary>
            <span class="popUp">
            <img src="${item.volumeInfo.imageLinks.smallThumbnail}" class="bookImg">
            <strong>${item.volumeInfo.title}</strong> by ${item.volumeInfo.authors}
            </span>
            </summary >
        <ul>
          <li>
            <b>Summary: </b> ${(item.volumeInfo.description.length > 60) ? item.volumeInfo.description.substr(0, 60) + "..." : item.volumeInfo.description}
          </li >
          <li>
            <b>Page Count: </b> ${item.volumeInfo.pageCount}
          </li>
          <li>
          <button class="addToShelf">Read Now</button>
          </li>
        </ul >
          </details >
        </li >
        `
    }
    let addToShelfBtns = document.querySelectorAll(".addToShelf")

    addToShelfBtns.forEach(addToShelfBtn => {
      addToShelfBtn.addEventListener('click', addToBookShelf)
    })

    let popUps = document.querySelectorAll(".popUp")

    popUps.forEach(popUp => {
      // console.log('hi')
      popUp.addEventListener('mouseover', addImageHover)
      popUp.addEventListener('mouseout', hideImageHover)
    })
  }

  function addImageHover(e) {
    console.log('What this is', e)
    // let span = document.querySelector('.popUp').querySelector('')
    let imagePopUp = document.querySelector('.imagePopUp')
    let image = document.querySelector('.imagePopUp img')
    //FIXME: fix this
    image.src = e.target.parentNode.parentNode.querySelector('.bookImg').src
    // image.src = e.target.currentSrc
    imagePopUp.style.left = `${e.clientX - 150}px`
    imagePopUp.style.top = `${e.clientY - 50}px`
    if (DEBUG) { console.log(imagePopUp.style.left) }

    if (e.clientX > 600) {
      if (DEBUG) { console.log("greater than 600") }
      imagePopUp.style.left = `600px`
    }
    imagePopUp.classList.remove('hidden')
    if (DEBUG) { console.log(e.target.parentNode.parentNode.querySelector('.bookImg').src) }
  }

  function hideImageHover(e) {
    let imagePopUp = document.querySelector('.imagePopUp')
    imagePopUp.classList.add('hidden')
  }

  function addToBookShelf(e) {
    let element = e.target.parentNode.parentNode.parentNode
    let confirmAnswer = confirm('Are you sure you want to add/replace this book to your Currently Reading?')
    if (confirmAnswer == true) {
      bookShelf.innerHTML = `
        <li class="books-in-shelf">
         <img src="${element.querySelector('.bookImg').src}">
        </li>`
    }
    console.log(bookShelf.innerText)
    console.log(element.querySelector('.bookImg'))
    // bookShelf.innerHTML = ''

  }

  //target window
  // on mouse down... start move
  // on mouseup.. stop move
  // let divWindows = document.querySelectorAll('.window')
  // let divHeaders = document.querySelectorAll('.window .title-bar')

  // divWindows.forEach(divWindow => {
  //   let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0
  //   console.log(divWindow)
  //   let divHeader = divWindow.querySelector(".title-bar")
  //   // When we click on the div Header, we add a mousemove 
  //   //listener to see where the mouse is
  //   divHeader.onmousedown = dragWindow
  //   // divHeader.addEventListener('mousedown', () => {
  //   //   console.log('mousedown')
  //   //   divWindow.addEventListener('mousemove', moveWindows)
  //   //   divWindow.addEventListener('mouseup', () => {
  //   //     divWindow.removeEventListener('mousemove', moveWindows)
  //   // })
  //   function dragWindow(e) {
  //     e.preventDefault()
  //     pos3 = e.clientX
  //     pos4 = e.clientY

  //     document.onmouseup = closeDragElement
  //     document.onmousemove = elementDrag
  //   }
  //   function elementDrag(e) {
  //     e.preventDefault()
  //     pos1 = pos3 - e.clientX
  //     pos2 = pos4 - e.clientY
  //     pos3 = e.clientX
  //     pos4 = e.clientY

  //     divWindow.offsetLeft
  //     //   let currPosX = divWindow.offsetTop

  //     // elements new position
  //     divWindow.style.left = `${divWindow.offsetLeft - pos2}px`
  //     divWindow.style.top = `${divWindow.offsetTop - pos1}px`
  //   }

  //   function closeDragElement() {
  //     document.onmouseup = null
  //     document.onmousemove = null
  //   }
})


// })

  // NOT WORKING
  // function moveWindows(e) {
  //   // Find out where window is
  //   let currPosY = divWindow.offsetLeft
  //   let currPosX = divWindow.offsetTop
  //   // move window where mouse is
  //   divWindow.style.left = `${currPosY + 1}px`
  //   divWindow.style.top = `${currPosX + 1}px`

  //   console.log("Style Left: ", divWindow.style.left, "Style Top: ", divWindow.style.top, "CurrPosY: ", currPosY, "CurrPosX: ", currPosX)
  // }

  // ALSO DIDN"T WORK
  // let divWindows = document.querySelectorAll('.window')

  // divWindows.forEach(divWindow => {
  //   divWindow.addEventListener('mousedown', () => {
  //     divWindow.addEventListener('mousemove', draggableWindow)
  //   })


  //   function draggableWindow(e) {
  //     console.log('dragging', e)
  //     let windowStyle = window.getComputedStyle(divWindow);
  //     let left = parseInt(windowStyle.left)
  //     let top = parseInt(windowStyle.top)
  //     divWindow.style.left = `${left + e.movementX}px`
  //     divWindow.style.top = `${top + e.movementY}px`
  //     console.log(windowStyle.left)
  //   }

  // })

// })




  // < script >
  // function handleResponse(response) {
  //   for (var i = 0; i < response.items.length; i++) {
  //     var item = response.items[i];
  //     // in production code, item.text should have the HTML entities escaped.
  //     document.getElementById("content").innerHTML += "<br>" + item.volumeInfo.title;
  //   }
  // }
  //   </script >
  // <script src="https://www.googleapis.com/books/v1/volumes?q=harry+potter&callback=handleResponse"></script>