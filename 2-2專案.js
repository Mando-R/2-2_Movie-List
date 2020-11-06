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
              <button class="btn btn-info btn-add-favorite" data-id="${arrayData[i].id}">＋</button>
            </div>
          </div>
        </div>
      </div>
`
  dataPanel.innerHTML = rawHTML
}

// 陣列[]資料，把網址的資料，放入所有movies。
const movies = []

// 存放搜尋完的結果，因為let filteredMovies=[]在searchFrom內部，所以當searchForm結束，filteredMovies也消滅。
// 原在searchForm內部，改放到上層 const movies = []下面，變成全域，可以存取。
// 若filteredMovies為空陣列[]，表示使用者未作搜尋動作。
let filteredMovies = []

axios.get(INDEX_URL)
  .then(function (response) {
    // Array(80)
    // console.log(response.data.results)

    // 使console單純只顯示80個資料，沒有其他層；.push()：把資料放入。注意!!!不是.put()。
    // 方法一：for(const 參數(單個) of 總數){}，把個別 "movie"，".push()" 送入 "movies"。
    //for (const movie of response.data.results) {
    //  movies.push(movie)
    //}

    // 方法二：前面加"..."
    movies.push(...response.data.results)

    // 這段程式碼是第一次呼叫，參數原本是"movies"，改代入"getMoviesByPage(1)"，即顯示開頭12部電影。
    renderMovieList(getMoviesByPage(1))

    // 對應下方函數 renderPaginator(amount)
    renderPaginator(movies.length)
  })

  .catch(function (error) {
    console.log(error)
  })

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

// Favorite清單，by "id"。
function addToFavorite(id) {  //點擊"click"到的 "id"。

  // 建立收藏清單變數"list"。取出目前在 local storage 的資料，放進收藏清單"list"。
  // 第一次點擊"click"，此時 local storage 是空的，會取回 null 值，因此會回傳一個空陣列[]至"list"。之後 local storage 有存入東西時，就可透過 localStorage.getItem('favoriteMovies') 取得資料。
  const list = JSON.parse(localStorage.getItem("favoriteMovies")) || []

  // 比對函數
  function isMovieIdMatched(movie) {
    // 左邊 movie.id：此內層函數的"movie"，只是先設為參數名稱，須對應下面"const movie"，把"陣列[]movies"內的"個別物件{}movie"，放入find()內的函數式。
    // 右邊 id：指外層函數 addToFavorite(id)，點擊"click"到的 "id"。。
    return movie.id === id    // 若左右相同，表示"TRUE"，則回傳該 "movie" 資料。
  }

  // 搜尋。用"find()"查找電影總表，找出 id 相同的電影物件回傳，暫存在 movie。
  const movie = movies.find(isMovieIdMatched)  //注意：find()回傳元素值 "movie"資料。

  // 比對"click"的"id"，和 "收藏清單list"裡所有movie的id，若相同，則return alert。
  if (list.some(isMovieIdMatched)) {      //注意：some() 回傳布林值TRUE、FALSE。和find()不同。
    return alert("此電影已在收藏清單中!")
  }

  // 把已搜尋到的 "movie" ，用 ".push()" 放入 "收藏清單"list"。
  list.push(movie)

  // 呼叫"localStorage.setItem"，把更新後的收藏清單同步到 local stroage
  localStorage.setItem("favoriteMovies", JSON.stringify(list))

  // const jasonString = JSON.stringify(list)
  // console.log("jason string: ", jasonString)              // JavaScript轉為JSON字串
  // console.log("jason object: ", JSON.parse(jasonString))  // JSON字串轉回JavaScript
}

// 匿名函數：不易debug找出實際error函數。
dataPanel.addEventListener("click", function onPanelClicked(event) {
  // More按鈕：顯示modal。
  if (event.target.matches(".btn-show-movie")) {
    // console.log(event.target.dataset.id)
    // 注意!!! 因為"event.target.dataset"是字串，要轉成數字。
    showMovieModal(Number(event.target.dataset.id))

    // Favorite按鈕：收藏電影。
  } else if (event.target.matches(".btn-add-favorite")) {
    // console.log(event.target.dataset.id)  // 也可僅寫 console.log(id)
    addToFavorite(Number(event.target.dataset.id))
  }
})

// 測試 localStorage 函數應用
// localStorage.setItem("default_language", "english")     // Application localStorage：default_language, english
// console.log(localStorage.getItem("default_language"))   // console：english
// localStorage.removeItem("default_language")             // 刪除english
// console.log(localStorage.getItem("default_language"))   // console：null

// Search Form & Search Input
const searchForm = document.querySelector("#search-form")

const searchInput = document.querySelector("#search-input")

searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  event.preventDefault()  // event.preventDefault()：請瀏覽器終止元件的預設行為，控制權交給 JavaScript。
  // console.log(searchInput.value)

  const keyword = searchInput.value.trim().toLowerCase()  // toLowerCase()：把字串轉成小寫。

  //存放搜尋完的結果，因為let filteredMovies=[]在searchFrom內部，所以當searchForm結束，filteredMovies也消滅。
  //原在searchForm內部，改放到上層 const movies = []下面，變成全域，可以存取。
  // let filteredMovies = []  

  //檢驗：若為0，回傳alert。  !：NOT。
  if (!keyword.length) {  // (1)反向思考 "keyword.length"。(2)也可改成(keyword.length === 0)
    return alert("Please enter a valid string")
  }

  // 篩選電影標題 方法一(1)：資料陣列[].filter( function( ){} )，用於篩選陣列[]，與 forEach 類似。
  filteredMovies = movies.filter(function (movie) {

    return movie.title.toLowerCase().includes(keyword)    // 記得"return"結果
  })

  // 錯誤處理：無符合條件的結果。 注意!!!記得用".length"。
  if (filteredMovies.length === 0) {
    return alert("Can't find movies with keyword: " + keyword)
    // return alert(`Can't find movies with keyword: ${keyword}`)  //反引號``，字元封閉，插入Template Literal。
  }

  // //重製分頁器。filteredMovies.length：表示搜尋到的電影數量。
  renderPaginator(filteredMovies.length)

  // 用函數renderMovieList()，重新"Render" 已搜尋出的 "filteredMovies"
  // 預設顯示第1頁的搜尋結果。  原：renderMovieList(filteredMovies)，修改為renderMovieList(getMoviesByPage(1))。
  renderMovieList(getMoviesByPage(1))

  // 篩選電影標題 方法一(2)
  // filteredMovies = movies.filter((movie) =>
  //   movie.title.toLowerCase().includes(keyword)
  // )
  // renderMovieList(filteredMovies)

  // 篩選電影標題 方法二：for(const...of...)、.includes()、.push()。
  // for (const movie of movies) {
  //   if (movie.title.toLowerCase().includes(keyword)) {
  //     filteredMovies.push(movie)    //把搜尋到的個別 "movie"，".push()" 放入 "filteredMovies"。
  //     console.log(movie)            //印出搜尋到的個別"movie"。
  //   }
  // }
  // renderMovieList(filteredMovies)
})

// Pagination
// 每張頁面顯示12個資訊
const MOVIES_PER_PAGE = 12

// Pagination插入電影資料：輸入"參數page"，回傳該page的12部電影資訊。 
function getMoviesByPage(page) {
  // page 1：movies 0～11、page 2：movies 12～23 ...
  // filteredMovies.length：表示有搜尋到東西，即搜尋動作有效，則回傳"filteredMovies"；反之，若沒搜尋到東西，則為空陣列[]，則回傳"movies"。
  const data = filteredMovies.length ? filteredMovies : movies
  // const data = (filteredMovies.length === 0) ? movies : filteredMovies  //data也可改寫如左

  // slice切割：起點、終點(不含終點個體)
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  const endIndex = startIndex + MOVIES_PER_PAGE

  // "movies"修改為"data"。"data"依據"三元條件運算"，回傳"filteredMovies"或"movies"。
  // 搜尋到的電影"filteredMovies"放入"data"，再切出"各頁電影"。
  return data.slice(startIndex, endIndex)
}

// Pagination插入函數，類似function renderMovieList(arrayData)。
const paginator = document.querySelector("#paginator")

function renderPaginator(amount) {                           // amount：指電影總數。
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)  // 80/12=6...8=7。Math.ceil()無條件進位。

  let rawHTML = ``
  // 注意：在<a>標籤，加入 data-page="${page}" 屬性標注頁數，後續取用頁碼。<li>只是外觀。
  for (page = 1; page <= numberOfPages; page++) {
    rawHTML += `
      <li class="page-item"> <a class="page-link" href="#" data-page="${page}">${page}</a></li >
    `
  }

  paginator.innerHTML = rawHTML
}

paginator.addEventListener("click", function onPaginatorClicked(event) {
  //if (event.target.matches(".page-item"))
  // "A"：表示<a></a>。點擊"click"，若沒有抓到<a></a>，則不執行此函數。
  if (event.target.tagName !== "A") return
  // dataset：相關data屬性。
  console.log(event.target.dataset.page)          //檢驗console是否顯示點擊"click"到的頁數。

  // 也可寫成以下，精準抓取 <a>的class name。
  // if (event.target.matches(".page-link")) {
  //   console.log(event.target.dataset.page)
  // }

  const page = Number(event.target.dataset.page)  //把id轉成Number
  renderMovieList(getMoviesByPage(page))
})



