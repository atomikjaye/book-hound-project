// check https://github.com/bansal/pattern.css 
//https://codeburst.io/10-amazing-and-retro-css-kits-24612169f550

let DEBUG = false

document.addEventListener('DOMContentLoaded', () => {
  // selecting form from index.html and assigning it to form variable
  let form = document.querySelector('form')
  // add form submit evenListener
  form.addEventListener('submit', (e) => {
    // prevents the default page refresh
    e.preventDefault()
    // extracting input value from form and assigning it to searchTerm variable
    let searchTerm = e.target.bookSearch.value
    // For Debugging purposes... unecessary stuff
    if (DEBUG) { console.log(e.target.bookSearch.value) }
    //appending the searchTerm to google API link, and fetching the data
    fetch(`https://www.googleapis.com/books/v1/volumes?q=${searchTerm}`)
      // Getting the response and formatting it into json
      .then(res => res.json())
      //When that is done, we get raw data
      .then(data => {
        // data is now being passed into handleResponse function
        handleResponse(data)
        //Debugging purposes
        if (DEBUG) { console.log("DATA: ", data) }
      })
    //Reset form ready for fresh new search
    form.reset()
  })

  // the function that handles the promise response
  function handleResponse(data) {
    // selecting currently reading bookshelf for future use
    let bookShelf = document.getElementById("bookShelf")
    //selecting search results book list
    let bookList = document.getElementById("searchResultsList")
    // booklist's innerHTML is assigned to empty string immediatly after a search to clear the list
    bookList.innerHTML = ""
    //TODO: Make a button that expands or collapses all items
    // We are running a loop on the data.items array
    // if there is no item in the array, we edit bookList to show no books.
    if (data.items == undefined) {
      searchResultsList.innerHTML = `Sorry we can not find books/subjects for your search`
    } else {
      for (var i = 0; i < data.items.length; i++) {
        // each item in the array is then assigned to item
        var item = data.items[i];
        //TODO: Can I just use a forEach?
        console.log(item.volumeInfo.description)
        console.log(item.volumeInfo.authors)
        let bookDescription = item.volumeInfo.description
        // description code, if there is no description, we replace with n/a
        if (bookDescription == undefined) {
          bookDescription = 'N/A'
        } else {
          // otherwise we include a description under 60 characters.
          bookDescription = (item.volumeInfo.description.length > 60) ? item.volumeInfo.description.substr(0, 60) + "..." : item.volumeInfo.description
        }
        //Now we build our bookList using 'illegal' innerHTML
        bookList.innerHTML += `
        <li class="details">
          <details class="bookInfo">
            <summary>
            <span class="popUp">
            <img src="${item.volumeInfo.imageLinks.smallThumbnail}" class="bookImg">
            <strong class="bookTitle">${item.volumeInfo.title}</strong> by ${item.volumeInfo.authors}
            </span>
            </summary >
        <ul>
          <li>
            <b>Summary: </b> <span class="bookDescription">${bookDescription}</span>
          </li>
          <li>
            <b>Page Count: </b> <span class="bookPageCount">${item.volumeInfo.pageCount}</span>
          </li>
          <li>
          
          <button onclick="window.open('${item.volumeInfo.previewLink}', '_blank');">View Book Page</button>
          <button class="addToShelf">Read Now</button>
          </li>
        </ul >
          </details >
        </li >
        `
      }
    }

    // select "Read Now" Buttons
    let addToShelfBtns = document.querySelectorAll(".addToShelf")

    // add Event Listenders to Read Now Buttons
    addToShelfBtns.forEach(addToShelfBtn => {
      addToShelfBtn.addEventListener('click', addToBookShelf)
    })

    // select image to be viewd in popUp
    let popUps = document.querySelectorAll(".popUp")

    // add event listeners to popup classes (when user hovers over title and image, image popups)
    popUps.forEach(popUp => {
      // console.log('hi')
      popUp.addEventListener('mouseover', addImageHover)
      popUp.addEventListener('mouseout', hideImageHover)
    })
  }

  // add Image Hover to popups
  function addImageHover(e) {
    if (DEBUG) { console.log('What this is', e) }
    // Select image pop up on index.html
    let imagePopUp = document.querySelector('.imagePopUp')
    // select image tag in imagePopUp
    let image = document.querySelector('.imagePopUp img')
    // change img src to image from the parent's parent's node.
    image.src = e.target.parentNode.parentNode.querySelector('.bookImg').src

    // We're offseting image pop up depending on where users's cursor is
    imagePopUp.style.left = `${e.clientX - 150}px`
    imagePopUp.style.top = `${e.clientY - 50}px`
    if (DEBUG) { console.log(imagePopUp.style.left) }

    // adjusting positioning if image is too far from list
    if (e.clientX > 600) {
      if (DEBUG) { console.log("greater than 600") }
      imagePopUp.style.left = `600px`
    }
    // remove hidden style class to see image hover
    imagePopUp.classList.remove('hidden')
    if (DEBUG) { console.log(e.target.parentNode.parentNode.querySelector('.bookImg').src) }
  }

  // on mouseout, we will add hidden style property to hide image popUp
  function hideImageHover(e) {
    let imagePopUp = document.querySelector('.imagePopUp')
    imagePopUp.classList.add('hidden')
  }

  //ReadNow Button Functionality
  function addToBookShelf(e) {
    // resets progress display once book is added
    let totalPagesReadDisplay = document.getElementById('totalPagesRead')
    totalPagesReadDisplay.textContent = 0
    updateProgress(0, 1, new Date(), new Date())
    // Here we are accessing the buttons ancestors to find elements easier
    let element = e.target.parentNode.parentNode.parentNode
    //When button is clicked, we ask if they want to add or replace the current book on shelf if any
    let confirmAnswer = confirm('Are you sure you want to add/replace this book to your Currently Reading?')

    if (confirmAnswer == true) {
      bookShelf.innerHTML = `
        <div class="books-in-shelf">
         <img src="${element.querySelector('.bookImg').src}">
         <div class="bookInfo">
         <strong>Title:</strong> ${element.querySelector('.bookTitle').innerText}<br>
         <strong>Description:</strong> ${element.querySelector('.bookDescription').innerText}<br>
         <strong>Page Count:</strong> <span class="bookPageCount">${element.querySelector('.bookPageCount').innerText}</span><br>
         <strong></strong>
         <button id="bookSchedule">Schedule</button>
         <button id="record">record</button>
         </div>

        </div>`
      // below we are selecting buttons on bookshelf and adding even listeners
      let bookScheduleBtn = document.getElementById('bookSchedule')
      let recordBtn = document.getElementById('record')


      bookScheduleBtn.addEventListener('click', scheduleBook)
      recordBtn.addEventListener('click', recordRead)
    }
  }

  // Here we ask user how many pages they will like to read and schedule a date 
  function scheduleBook(e) {
    if (DEBUG) console.log(e.target.parentNode)
    // here we assign parent to variable
    let parent = e.target.parentNode
    // total pages is taken from innerText of bookInfo in bookShelf
    let totalPages = parseInt(parent.querySelector('.bookPageCount').innerText)
    let pagesPerDay;
    if (DEBUG) console.log(pagesPerDay)
    if (DEBUG) console.log(typeof pagesPerDay)
    if (DEBUG) console.log(typeof parseInt(pagesPerDay))
    do {
      // ask about pages until answer is a number
      pagesPerDay = prompt('How many pages do you want to read each day? (must be a number)')
    }
    while (isNaN(pagesPerDay) || parseInt(pagesPerDay) == 0 || pagesPerDay == null || pagesPerDay == '')
    console.log("Pages per Day", pagesPerDay)
    console.log("total pages", totalPages)
    //totalDays is equal to the amount of pages of book and the amount of pages read per day
    console.log(totalPages / pagesPerDay)
    let totalDays = totalPages / pagesPerDay

    // start date is date button is clicked
    let startDate = new Date()
    // due date is start Date plus totalDays above.
    let dueDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + totalDays)
    console.log(startDate, dueDate)
    // then we update the display
    updateProgress(pagesPerDay, totalPages, startDate, dueDate)

  }
  // update the display
  function updateProgress(pagesPerDay, totalPages, startDate, dueDate) {
    // select items from bookShelf
    let readingProgressDisplay = document.getElementById('readingProgress')
    let daysLeftDisplay = document.getElementById('days-to-go')

    // Here we convert dueDate and startDate to miliseconds to have difference in Time
    let DifferenceInTime = dueDate.getTime() - startDate.getTime() //DEBUG: Showing as 0
    // here we divide total milliseconds by milliseconds in an entire day
    let daysLeft = DifferenceInTime / (1000 * 3600 * 24)
    console.log(`Will read ${pagesPerDay} pages everyday starting ${startDate} and ending on ${dueDate}. I have ${daysLeft} days left. Total pages are ${totalPages}`)
    console.log(dueDate.getTime(), startDate.getTime(), (dueDate.getTime() - startDate.getTime()))
    //update displays below
    daysLeftDisplay.textContent = `${Math.round(daysLeft)}`
    readingProgressDisplay.textContent = `${parseInt(0 / totalPages) * 100}`
  }
  let pagesReadTotal = 0;

  function recordRead(e) {
    let readingProgressDisplay = document.getElementById('readingProgress')
    let totalPagesReadDisplay = document.getElementById('totalPagesRead')
    let parent = e.target.parentNode
    let totalPages = parseInt(parent.querySelector('.bookPageCount').innerText)
    do {
      // Ask how many pages you'll read each day until its a valid number
      pagesReadToday = prompt('How many pages did you read today? (must be a number)')
    } while (isNaN(pagesReadToday) || parseInt(pagesReadToday) == 0 || pagesReadToday == null || pagesReadToday == '')
    pagesReadTotal += parseInt(pagesReadToday)
    console.log(typeof pagesReadToday)
    if (pagesReadTotal >= totalPages) {
      totalPagesReadDisplay.textContent = totalPages
      readingProgressDisplay.textContent = 100
      parent.querySelectorAll('button').forEach(el => el.disabled = true)
      pagesReadTotal = 0
      // TODO: Play animation to show you finished?
    } else {
      totalPagesReadDisplay.textContent = pagesReadTotal
      readingProgressDisplay.textContent = `${parseInt((parseInt(pagesReadTotal) / totalPages) * 100)}`
    }
    console.log(totalPages)

    // disable buttons if they have finished reading book
    console.log(parent)
    console.log(e.target)

  }
})