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
canvas.height = 900;

// 캔버스 이미지 삽입
let backgroundImg, spaceshipImg, bulletImg, enemyImg, gameOverImg, hitImg, specialMoveImg

// 우주선 좌표 (동적으로 변하기에 변수를 따로 할당)
let spaceshipX = canvas.width / 2 - 32
let spaceshipY = canvas.height - 64          // 캔버스와 우주선 이미지의 크기 계산값

// 이미지 가져오기
function loadImage() {
    backgroundImg = new Image()
    backgroundImg.src = "img/space-background.gif"

    spaceshipImg = new Image()
    spaceshipImg.src = "img/spaceship.png"

    bulletImg = new Image()
    bulletImg.src = "img/bullet.png"

    enemyImg = new Image()
    enemyImg.src = "img/ufo-1.png"

    forcedEnemyImg = new Image()
    forcedEnemyImg.src = "img/ufo-2.png"

    gameOverImg = new Image()
    gameOverImg.src = "img/gameover.png"

    hitImg = new Image()
    hitImg.src = "img/hit.png"

    specialMoveImg = new Image()
    specialMoveImg.src = "img/specialMove.png"
}

// 키 셋업 함수
let keyPress = {}
function setUpKeyboardListener() {
    document.addEventListener("keydown", function(e) {   // 키보드 누를 때
        keyPress[e.key] = true
        // console.log(keyPress)
    })
    document.addEventListener("keyup", function(e) { 
        delete keyPress[e.key]
        // console.log("삭제: ",keyPress)
    })
}

// 좌표 업데이트 
function update() {
    if('ArrowRight' in keyPress) {
        if(spaceshipX < 336) {    // 캔버스를 벗어나지 않도록 설정
            spaceshipX += 4       // 우주선 움직이는 속도   // 오른쪽 이동
        }       
    } else if('ArrowLeft' in keyPress) {
        if(spaceshipX > 0) {
            spaceshipX -= 4      // 왼쪽 이동
        }
    } else if('ArrowUp' in keyPress) {
        if(spaceshipY > 0) {
            spaceshipY -= 4       // 위로 이동
        }
    } else if('ArrowDown' in keyPress) {
        if(spaceshipY < 836) {
            spaceshipY += 4       // 아래로 이동
        }
    }
}

class Enemy {
    constructor() {
        this.x = Math.ceil(Math.random() * 360)
        this.y = 0
    }
    draw() {
        // ctx.fillStyle = "red"
        // ctx.fillRect(this.x, this.y, 40, 40)     // 적 히트박스
        ctx.drawImage(enemyImg, this.x, this.y)
    }
}

class ForcedEnemy {
    constructor() {
        this.x = Math.ceil(Math.random() * 345)
        this.y = 0
        this.life = 1
    }
    draw() {
        ctx.drawImage(forcedEnemyImg, this.x, this.y)
    }
}

class Bullet {
    constructor() {
        this.x = spaceshipX+15
        this.y = spaceshipY-18
        this.life = 0
    }
    shoot() {
        // ctx.fillStyle = "green"
        // ctx.fillRect(this.x, this.y, 35, 25)      // 총알 히트박스
        ctx.drawImage(bulletImg, this.x, this.y)
    }
}

class SpecialBomb {
    constructor() {
        this.x = 0
        this.y = 900
    }
    shoot() {
        for(let i=0; i<400; i+=40){
            ctx.drawImage(specialMoveImg, i, this.y)
        }
    }
}

let timer = 0
let score = 0
let level = 1
let enemyList = []
let bulletList = []
let isPause = false
let specialMove = 0
let specialBombList = []

document.addEventListener("keydown", function(e) {
    if(e.key === " ") {
        makeBullet()
    }
})

function makeBullet() {
    let bullet = new Bullet
    bulletList.push(bullet)
    // console.log(bulletList)
}

function makeSpecialMove() {
  specialMove += 1;
  if (specialMove > 1) {
    specialMove = 1;
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Control") {
      if (specialMove <= 0) {
        specialMove = 0;
      } else {
        specialMove -= 1;
        shootSpecialBomb()
      }
    }
  });
}

function shootSpecialBomb() {
    let specialBomb = new SpecialBomb
    specialBombList.push(specialBomb)
    console.log("필살기",specialBombList)
}

function enemyDevelope(species) {
    species.forEach(function(enemy, i, o) {      // enemy 각각
        if(enemy.y > 900) {
            o.splice(i,1)     // 적이 땅에 닿으면 사라짐
            gameOver()
        }
        
        switch (level) {
            case 2:
                enemy.y += 1.2       // 적이 이동하는 속도
                break
            case 3:
                enemy.y += 1.4
                break
            case 4:
                enemy.y += 1.7
                break
            case 5:
                enemy.y += 2
                break
            default:
                enemy.y += 1
        }
             
        enemy.draw()          // 적을 캔버스에 그리기

        let enemySpaceX = (enemy.x-60)-spaceshipX
        let enemySpaceXend = (enemy.x+35)-spaceshipX
        let enemySpaceY = (enemy.y+35)-spaceshipY
        let enemySpaceYend = enemy.y-(spaceshipY+60)
        if(enemySpaceX <= 0 && enemySpaceXend > 0 && enemySpaceY > 0 && enemySpaceYend < 0) {
            gameOver()
        }
    }) 
}

function hitEnemy(species, bulletType) {
    species.forEach(function(enemy, i, e_o) {  // i는 적의 index, e_o는 enemyList
        bulletType.forEach(function(bullet, j, b_o) { // j는 총알 index, b_o는 bulletList
            collision(enemy, bullet, i, j, e_o, b_o)
        })
    })
    
    function collision (enemy, bullet, i, j, e_o, b_o) {
        let attackY = (enemy.y + 40) - bullet.y
        let attackX = (enemy.x-20) - bullet.x
        let attackXend = (enemy.x + 30) - bullet.x
        let attackYend = enemy.y - (bullet.y+25)

        if (attackY > 0 && attackX <= 0 && attackXend > 0 && attackYend < 0) {
            if(bulletType == bulletList) {
                if(enemy.life == 1) {
                    b_o.splice(j,1)
                    enemy.life -= 1
                    console.log("강화된 적 맞춤")
                } else {
                    console.log("적 사살")
                    score += 1
                    ctx.drawImage(hitImg, enemy.x,enemy.y)
                    e_o.splice(i,1)
                    b_o.splice(j,1)

                    if(score % 10 == 0) {
                        makeSpecialMove()
                    }
                }
            } else if(bulletType == specialBombList) {
                score += 1
                ctx.drawImage(hitImg, enemy.x,enemy.y)
                e_o.splice(i,1)
            }
        }

        if(score >= 10 && score < 60) {
            level = 2
        } else if(score >= 60 && score < 100) {
            level = 3
        } else if(score >= 100 && score < 150) {
            level = 4
        } else if(score >= 150) {
            level = 5
        }
    }
}

// 이미지를 그리는 함수
function render() {
    ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height)   // drawImage 함수는 내장, 인자로 image, dx, dy, dWidth, dHeight
    ctx.drawImage(spaceshipImg, spaceshipX, spaceshipY)
       
    enemyDevelope(enemyList)
    
    bulletList.forEach(function(bullet, i, o) {    // bullet 각각
        if(bullet.y < 0) {
            o.splice(i,1)                // 총알이 천장에 닿으면 사라짐
        }

        bullet.y -= 10           // 총알 속도
        bullet.shoot()          // 총알 발사 함수
    })
    
    hitEnemy(enemyList, bulletList)
    
    specialBombList.forEach(function(specialBomb, i, o) {
        if(specialBomb.y < 0) {
            o.splice(i,1)                // 총알이 천장에 닿으면 사라짐
        }

        specialBomb.shoot()
        specialBomb.y -= 8
    })

    hitEnemy(enemyList ,specialBombList)
    
    ctx.font = "20px gothic";  // 폰트 크기, 스타일
    ctx.fillStyle = "rgb(255,255,255)"  // 색상
    ctx.fillText(`Score: ${score}`, 5, 20) // canvas에 text 추가
    
    ctx.fillStyle = "rgb(255,255,255)"
    ctx.fillText(`Chance: ${specialMove}`, 3, 45) //
    
    ctx.font = "20px gothic"  // 폰트 크기, 스타일
    ctx.fillStyle = "gray"  // 색상
    ctx.fillText(`Level: ${level}`, 315, 20)  // canvas에 text 추가
}

let animation

// Math.ceil(Math.random() * 1000 === 0)

// 렌더링을 계속 호출하는 함수
function main() {
    timer ++
    if(timer % Math.ceil(Math.random() * 1000) === 0){    // 일정하지 않고 랜덤한 확률로 적 등장
        if(level > 1) {
            let pickEnemy = Math.ceil(Math.random()*10)
            if(pickEnemy == 5) {
                let forcedEnemy = new ForcedEnemy()
                enemyList.push(forcedEnemy)
            } else {
                let enemy = new Enemy()
                enemyList.push(enemy)
            }
        } else {
            let enemy = new Enemy()
            enemyList.push(enemy)
        }
        console.log(enemyList)
    }
    
    update()    // 좌표 업데이트
    render()     // 캔버스 그리기
    
    if(isPause == false) {
        animation = requestAnimationFrame(main)  // 애니메이션처럼 프레임을 계속해서 보여주는 함수 (main을 계속 호출하여 렌더링을 계속 함) 
    } else {
        gameOver()
    }
}

// 게임오버 함수
function gameOver() {
    
    isPause = true
    ctx.drawImage(gameOverImg, 45, 250)
    ctx.fillText("Press [R] to Restart", 115, 550)
    ctx.fillStyle = "lightgrey"
    ctx.fillText(`Score: ${score}`, canvas.width/2-35, 510)
    cancelAnimationFrame(animation)
    
    console.log("Game Over",isPause)

    document.addEventListener("keydown", function(e) {
    if(e.key === "r") {
        reset()
    }})
}

function reset() {
    if(isPause == true) {
        window.location.reload()     // 페이지를 새로고침
    }
}

loadImage()
setUpKeyboardListener()
main()