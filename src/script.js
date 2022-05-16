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
    let searchResultsListDisplay = document.getElementById("searchResultsList")
    // searchResultsListDisplay's innerHTML is assigned to empty string 
    //immediatly after a search to clear the list
    searchResultsListDisplay.innerHTML = ""
    //TODO: Make a button that expands or collapses all items
    // We are running a loop on the data.items array
    // if there is no item in the array, we edit searchResultsListDisplay to show no books.
    if (data.items == undefined) {
      searchResultsListDisplay.innerHTML = `Sorry we can not find books/subjects for your search`
    } else {
      for (var i = 0; i < data.items.length; i++) {
        // each item in the array is then assigned to item
        var item = data.items[i];
        //TODO: Can I just use a forEach?
        if (DEBUG) { console.log(item.volumeInfo.description) }
        if (DEBUG) { console.log(item.volumeInfo.authors) }
        // Grab book description from item object (each individual book) and 
        // assign it to bookDescription
        let bookDescription = item.volumeInfo.description
        // If there is no description, we replace with n/a
        if (bookDescription == undefined) {
          bookDescription = 'N/A'
        } else {
          // otherwise we include a description under 60 characters.
          bookDescription = (item.volumeInfo.description.length > 60) ? item.volumeInfo.description.substr(0, 60) + "..." : item.volumeInfo.description
        }
        //Now we build our searchResultsListDisplay using 'illegal' innerHTML
        searchResultsListDisplay.innerHTML += `
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
          
          <button onclick="window.open('${item.volumeInfo.previewLink}', '_blank');">Preview Book</button>
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

    // add Event Listenders to Read Now Buttons and call addToBookShelf Function
    addToShelfBtns.forEach(addToShelfBtn => {
      addToShelfBtn.addEventListener('click', addToBookShelf)
    })

    // IMAGE HOVER CODE //
    // select image to be viewed in .popUp window
    let popUps = document.querySelectorAll(".popUp")

    // add event listeners to popup classes (when user hovers over title and/or image, image popups)
    popUps.forEach(popUp => {
      popUp.addEventListener('mouseover', addImageHover)
      popUp.addEventListener('mouseout', hideImageHover)
    })
  }

  // add Image Hover to popups
  function addImageHover(e) {
    if (DEBUG) { console.log('What this is in addImageHover', e) }
    // Select image pop up on index.html
    let imagePopUp = document.querySelector('.imagePopUp')
    // select image tag in imagePopUp
    let image = document.querySelector('.imagePopUp img')
    // change img src to image from the parent's parent's node. 
    //(the buttom clicked's grand parents)
    image.src = e.target.parentNode.parentNode.querySelector('.bookImg').src

    // We're offseting image pop up depending on where user's cursor is
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

  //ReadNow Buttons addToBookShelf Button Functionality
  function addToBookShelf(e) {
    // resets progress display once book is added
    let totalPagesReadDisplay = document.getElementById('totalPagesRead')
    totalPagesReadDisplay.textContent = 0
    updateProgress(0, 1, new Date(), new Date())
    // Here we are accessing the buttons' ancestors to find elements easier
    let element = e.target.parentNode.parentNode.parentNode
    //When button is clicked, we ask if they want to add or replace the 
    //current book on shelf
    let confirmAnswer = confirm('Are you sure you want to add/replace this book to your Currently Reading?')

    // If user clicks ok, innerHTML on book shelf will be built
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

      // below we are adding eventListeners to schedule a book and to record your pages read
      bookScheduleBtn.addEventListener('click', scheduleBook)
      recordBtn.addEventListener('click', recordRead)
    }
  }

  // Here we ask user how many pages they will like to read and schedule a due date/counter 
  function scheduleBook(e) {
    if (DEBUG) console.log(e.target.parentNode)
    // here we assign parent of button to variable
    let parent = e.target.parentNode
    // total pages is taken from innerText of bookInfo in bookShelf
    let totalPages = parseInt(parent.querySelector('.bookPageCount').innerText)
    //creating a variable for pagesPerDay Prompt
    let pagesPerDay;
    // Ask user how many pages they want to read today
    // for as long until you recieve a valid number
    do {
      // ask about pages until answer is a number
      pagesPerDay = prompt('How many pages do you want to read each day? (must be a number)')
      console.log("PagesPerDay", pagesPerDay)
    }
    while (isNaN(pagesPerDay) || parseInt(pagesPerDay) == 0 || pagesPerDay == null || pagesPerDay == '')
    if (DEBUG) console.log("Pages per Day", pagesPerDay)
    if (DEBUG) console.log("total pages", totalPages)
    //totalDays is equal to the amount of pages of book and the amount of pages read per day
    if (DEBUG) console.log(totalPages / pagesPerDay)
    let totalDays = totalPages / pagesPerDay

    // start date is date button is clicked
    let startDate = new Date()
    // due date is start Date plus totalDays above.
    let dueDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + totalDays)
    if (DEBUG) console.log(startDate, dueDate)
    // then we update the display
    updateProgress(pagesPerDay, totalPages, startDate, dueDate)
  }
  // update the display
  function updateProgress(pagesPerDay, totalPages, startDate, dueDate) {
    // select progress display items from BookShelf
    let readingProgressDisplay = document.getElementById('readingProgress')
    let daysLeftDisplay = document.getElementById('days-to-go')

    // Here we convert dueDate and startDate to miliseconds to subtract 
    // and calculate time between the two dates
    let DifferenceInTime = dueDate.getTime() - startDate.getTime()
    // here we divide total milliseconds by milliseconds in an entire day
    // to get the total days left to fiish reading the book
    let daysLeft = DifferenceInTime / (1000 * 3600 * 24)
    console.log(`I Will read ${pagesPerDay} pages everyday starting ${startDate} and ending on ${dueDate}. I have ${daysLeft} days left. Total pages are ${totalPages}`)
    if (DEBUG) console.log(dueDate.getTime(), startDate.getTime(), (dueDate.getTime() - startDate.getTime()))
    //update progress displays below
    // Here we are rounding the days up
    daysLeftDisplay.textContent = `${Math.round(daysLeft)}`
    // Here we are setting the totalPages Read percentage to 0
    readingProgressDisplay.textContent = `0`
  }

  // Assigning variable for pagesReadTotal
  let pagesReadTotal = 0;

  function recordRead(e) {
    // Here we are selecting progress display HTML
    let readingProgressDisplay = document.getElementById('readingProgress')
    let totalPagesReadDisplay = document.getElementById('totalPagesRead')
    // Setting the parent variable to the buttons parent
    let parent = e.target.parentNode
    // Setting totalPages equal to .bookPageCount
    let totalPages = parseInt(parent.querySelector('.bookPageCount').innerText)
    do {
      // Ask how many pages user read each day until its a valid number
      pagesReadToday = prompt('How many pages did you read today? (must be a number)')
    } while (isNaN(pagesReadToday) || parseInt(pagesReadToday) == 0 || pagesReadToday == null || pagesReadToday == '')
    console.log("PagesPerDay", parseInt(pagesReadToday))

    // add pages read today to current total
    pagesReadTotal += parseInt(pagesReadToday)
    // If the user puts too many pages we set progress to done/completed
    if (pagesReadTotal >= totalPages) {
      totalPagesReadDisplay.textContent = totalPages
      readingProgressDisplay.textContent = 100
      // Here we disable the buttons so they can not schedule anything any further
      parent.querySelectorAll('button').forEach(el => el.disabled = true)
      // Here we reset pages Total to 0 to get ready for next book.
      pagesReadTotal = 0
      // TODO: Play animation to show you finished?
    } else {
      // Otherwise we set total pages to the pages read thus far
      totalPagesReadDisplay.textContent = pagesReadTotal
      // We also update the progress percentage
      readingProgressDisplay.textContent = `${parseInt((parseInt(pagesReadTotal) / totalPages) * 100)}`
    }
  }
})