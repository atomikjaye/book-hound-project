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
    let bookList = document.getElementById("booksList")
    bookList.innerHTML = ""
    //TODO: Make a button that expands or collapses all items
    for (var i = 0; i < data.items.length; i++) {
      var item = data.items[i];
      // in production code, item.text should have the HTML entities escaped.
      bookList.innerHTML += `
        <li>
          <details class="bookInfo">
            <summary>
            <img src="${item.volumeInfo.imageLinks.smallThumbnail}" class="bookImg">
            ${item.volumeInfo.title} by ${item.volumeInfo.authors}
            </summary >
        <ul>
          <li>
            <b>Summary: </b> ${(item.volumeInfo.description.length > 60) ? item.volumeInfo.description.substr(0, 60) + "..." : item.volumeInfo.description}
          </li >
          <li>
            <b>Page Count: </b> ${item.volumeInfo.pageCount}
          </li>
        </ul >
          </details >
        </li >
        `
    }
  }


})




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