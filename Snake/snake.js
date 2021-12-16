// -----[ Game Settings ]-----
const size = 20
const height = size
const width = size
const boardSize = height * width
let movementDirection = 1
let gameSpeed = 250 // Lower is faster?
let level = 1
const Http = new XMLHttpRequest();
const url='http://charlesparmley.tech/scores';
const urlPost='http://charlesparmley.tech/scoresUpdate';
let gameVolume = .2
const music = document.getElementById('bgMusic')
music.volume = gameVolume
const lossSound = new Audio('resources/loss.mp3')
lossSound.volume = gameVolume
const goalSound  = new Audio('resources/goal.mp3')
goalSound.volume = gameVolume
let highScore = 10
let highScoreMinimum = 100
let runGame = false
let sound = true
let showSplash = true
let initialized = false
let direction = '0'


//  -----[ Game Setup ]-----
// constructs a game square when called
let createSquare = () =>{
    let square = document.createElement('div')
    square.classList.add('gameSquare')
    return square
}

// Builds the board using specified settings
let createBoard = (boardSize) =>{
    const board = document.getElementById('board')
    board.style.height = 'max-content';
    board.style.width = `${size+4}rem`;
    board.style.padding = '1rem'
    board.style.flexDirection = 'row';
    board.style.justifyContent = 'center';
    board.style.margin = 'auto';
    board.style.marginTop = '3rem'

    for(i=0;i<boardSize;i++){
        let square = createSquare()
        square.id = i
        document.getElementById('board').append(square)
    }
}

// Places goal square on the board
let createGoal = (boardSize) =>{
    // picks a random square on the board
    const goal = Math.floor(Math.random() * boardSize)
    goalSquare = document.getElementById(goal)
    // and now it is food
    goalSquare.classList.add('goalSquare')
}

// Creates the initial snake head node
let createSnakeHead = () =>{
    let snakeHead = document.getElementById(parseInt(boardSize*.5))
    snakeHead.classList.add('snakeHead')
    return
}

// increase length of snake
let growSnake=()=>{
    level++
}
// The plan for implimenting body movement is to leave the previously moved to square the same
//   color as the snake, for a number of turns equal to the snakes length value
let moveSnake=(oldHead,newHead)=>{
    
    // remove head from old square
    oldHead.classList.remove('snakeHead')
    // place on new square
    newHead.classList.add('snakeHead')
    // place body piece on old head location
    oldHead.classList.add('snakeBody')

    // move the tongue
    $('#headImage').remove()
    let headImage = document.createElement('img')
    $(headImage).attr('src', 'resources/SnakeHead.png')
    headImage.id = 'headImage'
    $(headImage).addClass('headImage')
    $('.snakeHead').append(headImage)
    $('.headImage').css('transform', `rotate(${direction}deg)`)

    // set the how long it will last using the 'level' setting as a timer starting number
    oldHead.setAttribute('value', level)
    
    // Array containing all existing body sections of the snake
    let snakeBody = document.getElementsByClassName('snakeBody')

    // for every section of the body
    for(let i=0;i<snakeBody.length;i++){
        // save section to variable
        let section = snakeBody.item(i)
        // get the value of it's existing timer
        let timer = parseInt(section.getAttribute('value'))
        // if there is still time on the timer
        if(timer > 0){
            // lower the timer by 1
            timer--
            // and update the section with the new timer value
            section.setAttribute('value', timer)
        }
    }
    return
}
//checking for collision with edge of map
let collisionChecker=(newLocation,movementDirection)=>{
    // look our location on the map
    newLocation = parseInt(newLocation)
    // On an edge piece, and moving away from map center, OR on a snake body piece
    //      Then we have LOST
    if((newLocation % width === 0 & movementDirection === 1) || ((newLocation+1) % width === 0 & movementDirection === -1) || newLocation >= boardSize || newLocation < 0 || document.getElementById(String(newLocation)).classList.contains('snakeBody') === true){
        runGame = false
        music.pause()
        goalSound.pause()
        lossSound.play()
        // If score is in the top 3 scores
        if((level-1) > highScoreMinimum){
            // Prompt user to submit name to leaderboard
            let userName = window.prompt('High Score! Enter Name!')

            // Post request. If you are reading this, here is where you would cheat....
            // Please don't. Doing so will delete valid high scores and I would rather not
            // put forth effort to write a workaround... 
            // Hope you've enjoyed so far!
            if(userName != null){
                $.ajax(urlPost, {
                    type: 'POST',
                    url: urlPost,
                    dataType: "json",
                    data: {
                        user : userName,
                        score : level-1
                    },
                    success: function(){
                        // console.log('Success')
                    },
                    error: function(){
                        // console.log('Failure')
                    }
                });
            }
        }
        // Ask user to play again, and show their score.
        playAgain()
    }
}

// Create game scoreboard
let createScoreboard =()=>{
    // create board html element
    let scoreboard = document.createElement('div')
    scoreboard.className = 'scoreboard'

    // add style for scoreboard
    scoreboard.classList.add('scoreboard')
    scoreboard.style.display = 'flex'
    scoreboard.style.justifyContent = 'center'
    // create score counter element
    let scoreCounter = document.createElement('h2')
    // set counter to current level
    scoreCounter.innerText = `Score: ${level-1}`
    scoreCounter.id = 'currentScore'
    // add it to the DOM
    scoreboard.appendChild(scoreCounter)
    try{
        $('.scoreboard').remove()
    }
    catch{

    }
    $('main').append(scoreboard)
}

// Create leaderboard
let createLeaderboard=(data=[])=>{
    // Check if this has already happened
    if (initialized === true){
        // if so, dont recreate the leaderboard
        return
    }
    let parsedData = data
    // if the data is not a js object
    if(typeof(parsedData)!='object'){
        // parse it into one
        parsedData = JSON.parse(parsedData)
    }

    // I don't remember why I did this.... Delete if still not used after Dec 16
    // Why would it matter if the data was longer than 30 or shorter than one?
    // If leaderboard gets weird ------!!! BUG HERE !!!-----
    // if(parsedData.length>30 || data.length < 1){
    //     return
    // }
    let leaderboardTitle = document.createElement('h1')
    leaderboardTitle.id = 'leaderboardTitle'
    $(leaderboardTitle).text('High Scores')
    $(leaderboardTitle).insertBefore($('#board'))

    let leaderboard = document.createElement('div')
    leaderboard.id = 'leaderboard'
    $(leaderboard).insertBefore($('#board'))
    // loop over leaderboard data
    for(i=0;i<parsedData.length;i++){
        // create a div for each one
        let userScore = document.createElement('div')
        userScore.className = 'leaderScore'

        // finding the minimum high score needed for leaderboard
        //    again, no cheating please. I'll emojify this whole thing
        if(parsedData[i].score < highScoreMinimum){
            highScoreMinimum = parsedData[i].score
        }

        // Grabbing user data from data supplied
        username = parsedData[i].user
        score = parsedData[i].score

        // Giving their respective elements identifying attributtes
        userScore.id = parsedData[i].user
        userScore.setAttribute('value', parsedData[i].score)

        // creating element and giving it the username and score
        let scoreText = document.createElement('p')
        scoreText.innerText = `${username}: ${score}`

        // flatten the elements to the leaderboard
        userScore.appendChild(scoreText)
        leaderboard.appendChild(userScore)
    }

    
    // loop a dictionary of scores kept in a local json file,
    // use the data per username to display high scores
    initialized = true
    return data
}



// Updates scoreboard value when needed    Example: snake reaches food piece
let updateScoreboard =()=>{
    let currentScore = document.getElementById('currentScore')
    currentScore.innerText = `Score: ${level-1}`
    createScoreboard()
}

let startGame=()=>{
    runGame = true
    $('#splashContainer').remove()
    music.play()
}

// Create function that runs before runtime starts
//    This function should be a splash screen that shows
//    rules for the game, gives options to start the game
//    shows github link, etc...
let volumeSwitcher=()=>{
    
    sound = !sound
    if(sound){
        $('#volumeSlider').text('Volume 🔊')
        gameVolume = .2
        music.volume = gameVolume
        goalSound.volume = gameVolume
        lossSound.volume = gameVolume
        return
    }
    gameVolume = 0
    music.volume = gameVolume
    goalSound.volume = gameVolume
    lossSound.volume = gameVolume
    $('#volumeSlider').text('Volume 🔇')

}
let splashScreen=()=>{
    if(showSplash===false){
        runGame = true
        showSplash = true
        return false
    }
    // container that covers the entire page, mainly for an opacity layer
    let splashContainer = document.createElement('div')
    splashContainer.id = 'splashContainer'
    $('body').append(splashContainer)

    // container for menu items
    let splashMenu = document.createElement('div')
    splashMenu.id = 'splashMenu'
    $(splashMenu).css('width', `${size+6}rem`)
    $(splashContainer).append(splashMenu)

    // Play button
    let playButton = document.createElement('div')
    playButton.id = 'playButton'
    $(playButton).on('click', ()=>startGame())

    let playButtonText = document.createElement('h1')
    $(playButtonText).text('Play ▶️')

    // Volume control
    let volumeControl = document.createElement('div')
    volumeControl.id = 'volumeControl'
    $(volumeControl).on('click',()=>volumeSwitcher())

    let volumeSlider = document.createElement('h1')
    volumeSlider.id = 'volumeSlider'
    $(volumeSlider).text('Volume 🔊')
    $(volumeControl).append(volumeSlider)

    // GitHub Link
    let gitContainer = document.createElement('div')
    gitContainer.id = 'gitContainer'
    let gitImage = document.createElement('img')
    gitImage.id = 'gitImage'
    $(gitImage).attr('src', 'resources/github.png')
    let gitLink = document.createElement('a')
    $(gitLink).attr('href', 'https://github.com/chparmley/Code-Immersives/tree/main/PY-113:%20Intro%20Web-Dev/Snake')
    $(gitLink).append(gitImage)
    $(gitContainer).append(gitLink)

    // Items on page
    $(playButton).append(playButtonText)
    $(splashMenu).append(playButton,volumeControl,gitContainer)
}

// Popup to play again after losing
let playAgain=()=>{
    let playAgainBG = document.createElement('div')
    playAgainBG.id = 'playAgainBG'

    let playAgainMenu = document.createElement('div')
    playAgainMenu.id = 'playAgainMenu'

    let playAgainTitle = document.createElement('div')
    playAgainTitle.id = 'playAgainTitle'
    let playAgainText = document.createElement('h1')
    $(playAgainText).text('Play Again?')
    $(playAgainTitle).append(playAgainText)

    let yes = document.createElement('div')
    $(yes).addClass('playAgainYes')
    yes.id = 'yes'
    $(yes).on('click',()=>{
        $('#playAgainBG').remove()
        showSplash = false
        // if user clicks to play again, reload the page
        $('#board').html('')
        $('#leaderboard').remove('')
        $('#leaderboardTitle').remove()
        music.play()
    })

    yesText = document.createElement('h1')
    $(yesText).text('Yes')

    let no = document.createElement('div')
    $(no).on('click',()=>{
        $('#playAgainBG').remove()
        splashScreen()
    })

    let noText = document.createElement('h1')
    $(noText).text('No')
    no.id = 'no'

    $(yes).append(yesText)
    $(no).append(noText)
    $(playAgainMenu).append(playAgainTitle, yes,no)
    $(playAgainBG).append(playAgainMenu)
    $('body').append(playAgainBG)
}



let variableReset=()=>{
    movementDirection = 1
    gameSpeed = 250 // Lower is faster?
    level = 1
    highScore = 10
    highScoreMinimum = 100
    runGame = true
    sound = true
    showSplash = true
    initialized = false
    direction = 0   
}


// -----[ Game Runtime ]-----
runtime=()=>{
    // Retrieve scores from database
    Http.open("GET", url);
    Http.send();
    Http.onreadystatechange = (e) => {
        const data = Http.response 
        createLeaderboard(data)
    }

    // Setup functions
    createBoard(boardSize)
    createGoal(boardSize)
    createSnakeHead(boardSize)
    createScoreboard()

    // check the current date down to the millisecond, minus the gamespeed (also milliseconds)
    let expected = Date.now() - gameSpeed;
    setTimeout(tick, gameSpeed);

    function tick() {
        // Setting up the game again without the splash screen
        if(showSplash === false){
            Http.open("GET", url);
            Http.send();
            Http.onreadystatechange = (e) => {
                const data = Http.response 
                createLeaderboard(data)
            }
            // Setup functions
            createBoard(boardSize)
            createGoal(boardSize)
            createSnakeHead(boardSize)
            createScoreboard()
            variableReset()
            expected = Date.now() - gameSpeed
        }
        let dt = Date.now() - expected; // the drift (positive for overshooting)
        if (dt > gameSpeed) {
            // if more time has occurred than specified by gamespeed
        }
        if(runGame===true){
            // -----[ Game Main Loop ]-----
            // goal location
            let goal = document.getElementsByClassName('goalSquare')[0]
            let goalLocation = goal.id

            // location of snake head
            let oldHead = document.getElementsByClassName('snakeHead')[0]
            // ID from it's division
            let location = parseInt(oldHead.id)
            // initializing new location
            let newLocation = '0'

            // find new location
            newLocation = String(parseInt(oldHead.id) + movementDirection)
            // grab division id of new location
            newHead = document.getElementById(newLocation)

            // Check for wall collision
            if (collisionChecker(newLocation,movementDirection)===true){
                return
            }

            // Move the snake
            moveSnake(oldHead,newHead)


            // Without this, snake poops sometimes. And they are literally deadly
            // Checks if any snakeBody elements have a value of '0'
            // If so remove the class snakeBody from it
            let snakeBody = document.getElementsByClassName('snakeBody')
            for(let i=0;i<snakeBody.length;i++){
                let section = snakeBody.item(i)
                let timer = parseInt(section.getAttribute('value'))
                if(timer < 1){
                    section.removeAttribute('value')
                    section.classList.remove('snakeBody')
                    section.classList.remove('snakeTail')
                    section.classList.remove('right','left','up','down')
                }
            }
            // If reached a food piece square
            if (newLocation === goalLocation){
                goalSound.load()
                goalSound.play()
                // remove the goal
                goal.classList.remove('goalSquare')
                // place a new one
                createGoal(boardSize)
                // enlarge snake by 1
                growSnake()
                // update html scoreboard DOM element
                updateScoreboard()
                // increace framerate by decreasing delay between snake movements
                gameSpeed = gameSpeed*.9 // multiplying by .9 increases the game speed by 10%
            }
        }
        // Set time when next game tick is allowed
        expected += gameSpeed;

        // IDK yet, still tyring to understand
        setTimeout(tick, Math.max(0, gameSpeed - dt)); // take into account drift
    }
}

// -- Movement Listener --
$(document).keydown(function(event){
    // [ KEY PRESSES ]
    switch (event.which){
        case 37: // LEFT
            movementDirection = -1
            direction = 180
            break;

        case 38: // UP
            movementDirection = -width
            direction = 270
            break;      
          
        case 39: // RIGHT
            movementDirection = 1
            direction = 0
            break;

        case 40: // DOWN
            movementDirection = width
            direction = 90
            break;
    }
});

// Run Game
splashScreen(runGame)
runtime(runGame)