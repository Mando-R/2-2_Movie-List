// 先建立API url的常數
const BASE_URL = "https://movie-list.alphacamp.io"
const INDEX_URL = BASE_URL + "/api/v1/movies/"
const POSTER_URL = BASE_URL + "/posters/"

// DOM連結：<div id="data-panel">
const dataPanel = document.querySelector("#data-panel")

// 轉變成HTML架構，再放入HTML。
function renderMovieList(arrayData) {    //注意!!!："arrayData"之後套入 陣列[ ]資料"movies"。
  let rawHTML = ` `
  // movies.length 改成參數。
  // 隨著[i]變動，把id也抓進來，建立<button>裡面 "data set"的id：data-id="${arrayData[i].id}"
  for (let i = 0; i < arrayData.length; i++)
    rawHTML += `
      <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src="${POSTER_URL + arrayData[i].image}"
              class="card-img-top" alt="Movie Poster">

            <div class="card-body">
              <h5 class="card-title">${arrayData[i].title}</h5>
            </div>

            <!--Footer-->
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-toggle="modal"
                data-target="#movie-modal" data-id="${arrayData[i].id}">More</button>
              <button class="btn btn-danger btn-remove-favorite" data-id="${arrayData[i].id}"> X </button>
            </div>
          </div>
        </div>
      </div>
`
  dataPanel.innerHTML = rawHTML
}

// 修改為從 "localStorage" 抓取資料，並放入資料變數 "movies"。
const movies = JSON.parse(localStorage.getItem("favoriteMovies"))

// 建立modal的插入函數，by "id"。  
function showMovieModal(id) {
  const modalTitle = document.querySelector("#movie-modal-title")
  const modalImage = document.querySelector("#movie-modal-image")
  const modalDate = document.querySelector("#movie-modal-date")
  const modalDescription = document.querySelector("#movie-modal-description")

  axios.get(INDEX_URL + id)
    .then(function (response) {
      // 注意!!!記得Ajax選取用法，為dot notation。
      const dataResults = response.data.results
      modalTitle.innerText = dataResults.title

      modalDate.innerText = `Release date: ` + dataResults.release_date

      modalDescription.innerText = dataResults.description

      modalImage.innerHTML = `
        <img src="${POSTER_URL + dataResults.image}  " alt="movie-poster"
                class="img-fluid">
      `
    })

}

// 增加移除按鈕 "X"
function removeFromFavorite(id) {
  // const list = JSON.parse(localStorage.getItem("favoriteMovies")) || []  //上面已有此const

  // 比對函數
  function isMovieIdMatched(movie) {
    // 左邊 movie.id：此內層函數的"movie"，只是先設為參數名稱，須對應下面"const movie"，把"陣列[]movies"內的"個別物件{}movie"，放入find()內的函數式。
    // 右邊 id：指外層函數 addToFavorite(id)，點擊"click"到的 "id"。。
    return movie.id === id    // 若左右相同，表示"TRUE"，則回傳該 "movie" 資料。
  }

  // 陣列[].findIndex()：回傳.find()找的元素的位置。
  // 注意：資料變數"movies"是從 localStorage 抓出 Favorite 清單。 
  const movieIndex = movies.findIndex(isMovieIdMatched)
  // return console.log(movieIndex)  //注意：回傳"位置"，非"id"。

  movies.splice(movieIndex, 1)  //原陣列[] movies，第movieIndex個位置、刪除一個。

  // JSON.stringify(list)，參數 改成 JSON.stringify(movies)
  localStorage.setItem("favoriteMovies", JSON.stringify(movies))

  // 再次 render 頁面，就會即時顯示刪除後的畫面，不須透過F5重整。
  renderMovieList(movies)
}

// 匿名函數：不易debug找出實際error函數。
dataPanel.addEventListener("click", function onPanelClicked(event) {
  // More按鈕：顯示modal。
  if (event.target.matches(".btn-show-movie")) {
    // console.log(event.target.dataset.id)
    // 注意!!! 因為"event.target.dataset"是字串，要轉成數字。
    showMovieModal(Number(event.target.dataset.id))

    // Favorite按鈕：收藏電影。注意：(".btn-add-favorite") 記得改成 (".btn-remove-favorite")。
  } else if (event.target.matches(".btn-remove-favorite")) {
    // console.log(event.target.dataset.id)  // 也可僅寫 console.log(id)

    // addToFavorite 改成 removeFromFavorite
    removeFromFavorite(Number(event.target.dataset.id))
  }
})

renderMovieList(movies)
