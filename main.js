// 캔버스 세팅
let canvas;
let ctx;   // 이미지를 그리는것을 도와주는 변수

// 방법 1
// canvas = document.createElement("canvas") // 캔버스 제작
// document.body.appendChild(canvas) // 캔버스를 HTML에 붙이기

// 방법 2
canvas = document.getElementById("canvas")
ctx = canvas.getContext("2d");   // 2d, 3d처럼 2d의 세계를 가져온다는 의미

canvas.width = 400;
canvas.height = 700;

// 캔버스 이미지 삽입
let backgroundImg, spaceshipImg, bulletImg, enemyImg, gameOverImg

// 우주선 좌표 (동적으로 변하기에 변수를 따로 할당)
let spaceshipX = canvas.width / 2 - 32
let spaceshipY = canvas.height - 64          // 캔버스와 우주선 이미지의 크기 계산값

// 이미지 가져오기
function loadImage() {
    backgroundImg = new Image()
    backgroundImg.src = "img/space-background.gif"

    spaceshipImg = new Image()
    spaceshipImg.src = "img/spaceship2.png"

    bulletImg = new Image()
    bulletImg.src = "img/bullet.png"

    enemyImg = new Image()
    enemyImg.src = "img/ufo-1.png"

    gameOverImg = new Image()
    gameOverImg.src = "img/gameover.jpg"
}

// 키 셋업 함수
let keyPress = {}
function setUpKeyboardListener() {
    document.addEventListener("keydown", function(e) {   // 키보드 누를 때
        keyPress[e.key] = true
        console.log(keyPress)
    })
    document.addEventListener("keyup", function(e) { 
        delete keyPress[e.key]
        console.log("삭제: ",keyPress)
    })
}

// 좌표 업데이트 
function update() {
    if('ArrowRight' in keyPress) {
        if(spaceshipX < 336) {    // 캔버스를 벗어나지 않도록 설정
            spaceshipX += 3       // 우주선 움직이는 속도   // 오른쪽 이동
        }       
    } else if('ArrowLeft' in keyPress) {
        if(spaceshipX > 0) {
            spaceshipX -= 3       // 왼쪽 이동
        }
    } else if('ArrowUp' in keyPress) {
        if(spaceshipY > 0) {
            spaceshipY -= 3       // 위로 이동
        }
    } else if('ArrowDown' in keyPress) {
        if(spaceshipY < 636) {
            spaceshipY += 3       // 아래로 이동
        }
    }

    // if(enemy.y > 660) {
    //     delete enemy
    // }
}

class Enemy {
    constructor() {
        this.x = Math.ceil(Math.random() * 350)
        this.y = 0
    }
    draw() {
        // ctx.fillStyle = "red"
        // ctx.fillRect(this.x, this.y, 40, 40)     // 적 히트박스
        ctx.drawImage(enemyImg, this.x, this.y)
    }
}

class Bullet {
    constructor() {
        this.x = spaceshipX+15
        this.y = spaceshipY-18
    }
    shoot() {
        // ctx.fillStyle = "green"
        // ctx.fillRect(this.x, this.y, 35, 25)      // 총알 히트박스
        ctx.drawImage(bulletImg, this.x, this.y)
    }
}

let timer = 0
let enemyList = []
let score = 0
let bulletList = []
let level = 1

document.addEventListener("keydown", function(e) {
    if(e.key === " ") {
        makeBullet()
    }
})

function makeBullet() {
    let bullet = new Bullet
    bulletList.push(bullet)
    console.log(bulletList)
}



// 이미지를 그리는 함수
function render() {
    ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height)   // drawImage 함수는 내장, 인자로 image, dx, dy, dWidth, dHeight
    ctx.drawImage(spaceshipImg, spaceshipX, spaceshipY)
    
    enemyList.forEach(function(enemy, i, o) {      // enemy 각각
        
        if(enemy.y > 700) {
            o.splice(i,1)     // 적이 땅에 닿으면 사라짐
            gameOver()
        }
        enemy.y += 1           // 적이 이동하는 속도
        enemy.draw()          // 적을 캔버스에 그리기

        
    }) 
    
    bulletList.forEach(function(bullet, i, o) {    // bullet 각각
        if(bullet.y < 0) {
            o.splice(i,1)                // 총알이 천장에 닿으면 사라짐
        }

        bullet.y -= 3           // 총알 속도

        bullet.shoot()          // 총알 발사 함수
    })

    enemyList.forEach(function(enemy,i, e_o) {
        bulletList.forEach(function(bullet,j ,b_o) {
            collision(enemy, bullet,i ,j, e_o, b_o)
        })
    })

    function collision (enemy, bullet, i, j, e_o, b_o) {
        let attackY = (enemy.y + 40) - bullet.y
        let attackX = (enemy.x-20) - bullet.x
        let attackXend = (enemy.x + 30) - bullet.x

        if (attackY > 0 && attackX <= 0 && attackXend > 0) {
            console.log("적 맞춤")
            score += 1

            e_o.splice(i,1)
            b_o.splice(j,1)

            if(score >= 10 && score < 20) {
                level = 2
            } else if(score >= 20) {
                level = 3
            }
        }
    }

    ctx.font = "20px gothic";  // 폰트 크기, 스타일
    ctx.fillStyle = "rgb(255,255,255)";  // 색상
    ctx.fillText(`Score: ${score}`, 5, 20);  // canvas에 text 추가
    
    ctx.font = "20px gothic";  // 폰트 크기, 스타일
    ctx.fillStyle = "gray";  // 색상
    ctx.fillText(`Level: ${level}`, 315, 20);  // canvas에 text 추가

}

let animation

// Math.ceil(Math.random() * 1000 === 0)

// 렌더링을 계속 호출하는 함수
function main() {
    timer ++
    if(timer % Math.ceil(Math.random() * 1000) === 0){    // 일정하지 않고 랜덤한 확률로 적 등장
        let enemy = new Enemy()
        enemyList.push(enemy)
        console.log(enemyList)
    }
    
    update()    // 좌표 업데이트
    render()     // 캔버스 그리기
    animation = requestAnimationFrame(main)  // 애니메이션처럼 프레임을 계속해서 보여주는 함수 (main을 계속 호출하여 렌더링을 계속 함)
}

// 게임오버 함수
function gameOver() {
    console.log("죽음", animation)
    cancelAnimationFrame(animation)
}

loadImage()
setUpKeyboardListener()
main()