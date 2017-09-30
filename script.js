// счетчик очков

var para = document.querySelector('p');
var count = 0;

// setup canvas

var canvas = document.querySelector('canvas');// получает ссылку на <canvas> элемент
var ctx = canvas.getContext('2d');// ctx - это объект, который представляет область рисования холста и позволяет рисовать на нем 2D-фигуры

var width = canvas.width = window.innerWidth; // ширина элемента холста
var height = canvas.height = window.innerHeight;// высота элемента холста

// function to generate random number
// Эта функция принимает два числа в качестве аргументов и возвращает случайное число в диапазоне между ними
function random(min,max) {
  var num = Math.floor(Math.random()*(max-min)) + min;
  return num;
}

// Конструктор круга - пожирателя

function Shape(x, y, velX, velY, exists){
  this.x = x;
  this.y = y;
  this.velX = velX;
  this.velY = velY;
  this.exists = exists;
}

// Конструктор шаров

function Ball(x, y, velX, velY, exists, color, size) {
  Shape.call(this, x, y, velX, velY, exists);
  // this.x = x;  // x, y координаты - горизонтальные и вертикальные координаты, где шар наход. на экране.
  // this.y = y; // в диапазоне от 0 (верхний левый угол) до ширины и высоты окна просмотра браузера (нижний правый угол)
  // this.velX = velX; // горизонтальная и вертикальная скорость для каждого шара
  // this.velY = velY;
  this.color = color;
  this.size = size;
}

Ball.prototype = Object.create(Shape.prototype);
Ball.prototype.constructor = Ball;

// Рисование шара

Ball.prototype.draw = function() {
  ctx.beginPath(); // рисование формы
  ctx.fillStyle = this.color; // оперделяем цвет шара
  ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI); // x,y - центр шара, нач. и конеч. точка рисования дуги в 360
  ctx.fill();// конец формирования шара (Закончите рисование пути, с которого мы начали beginPath(), и заполните область, которую он занимает с цветом, который мы указали ранее fillStyle)
};

// Обновление данных мяча - для передвижения (меняем полярность движения, при столкновении со стенкой)

Ball.prototype.update = function() { // будет ли x координата больше ширины холста (мяч уходит с правого края)
  if((this.x + this.size) >= width) {
    this.velX = -(this.velX);
  }

  if((this.x - this.size) <= 0) { // будет ли x координата меньше 0 (мяч уходит с левого края)
    this.velX = -(this.velX);
  }

  if((this.y + this.size) >= height) { // удет ли y координата больше высоты холста (мяч уходит с нижнего края)
    this.velY = -(this.velY);
  }

  if((this.y - this.size) <= 0) { // будет ли y координата меньше 0 (мяч уходит с верхнего края)
    this.velY = -(this.velY);
  }

  this.x += this.velX; //  мяч перемещается при каждом вызове этого метода
  this.y += this.velY;
};

// Анимация при столкновении шаров

Ball.prototype.collisionDetect = function() {
  for (var j = 0; j < balls.length; j++) {
    if (!(this === balls[j])) { // алгоритм для проверки столкновения двух шаров
      var dx = this.x - balls[j].x;
      var dy = this.y - balls[j].y;
      var distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < this.size + balls[j].size) {
        balls[j].color = this.color = 'rgb(' + random(0, 255) + ',' + random(0, 255) + ',' + random(0, 255) +')';
      }
    }
  }
};

// Конструктор для круга - пожирателя

function EvilCircle(x, y, exists) {
  Shape.call(this, x, y, exists);

  this.color = 'white';
  this.size = 15;
  this.velX = 20;
  this.velY = 20;
}

EvilCircle.prototype = Object.create(Shape.prototype);
EvilCircle.prototype.constructor = EvilCircle;

EvilCircle.prototype.draw = function() {
  ctx.beginPath();
  ctx.strokeStyle = this.color;// не закрашиваем
  ctx.lineWidth = 3;
  ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
  ctx.stroke();
};

// Выход за пределы поля круга - пожирателя

EvilCircle.prototype.checkBounds = function() {
  if((this.x + this.size) >= width) {
    this.x -= this.size; // возврат на холст
  }

  if((this.x - this.size) <= 0) {
    this.x += this.size;
  }

  if((this.y + this.size) >= height) {
    this.y -= this.size;
  }

  if((this.y - this.size) <= 0) {
    this.y += this.size;
  }
};

// Управление кругом - пожирателем

EvilCircle.prototype.setControls = function() {
  var _this = this;
  window.onkeydown = function(e) { // e - объект события
    if(e.keyCode === 65) {        // a
      _this.x -= _this.velX;
    } else if(e.keyCode === 68) { // d
      _this.x += _this.velX;
    } else if(e.keyCode === 87) { // w
      _this.y -= _this.velY;
    } else if(e.keyCode === 83) { // s
      _this.y += _this.velY;
    }
  };
};

// Уничтожение шара при столкновении с кругом - пожирателем

EvilCircle.prototype.collisionDetect = function() {
  for(var j = 0; j < balls.length; j++) {
    if( balls[j].exists ) { // если еще шар существует (не съеден)
      var dx = this.x - balls[j].x;
      var dy = this.y - balls[j].y;
      var distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < this.size + balls[j].size) {
        balls[j].exists = false; // уничтожается
        count--;
        para.textContent = 'Ball count: ' + count;
      }
    }
  }
};


// Массив для хранения шаров

var balls = [];

var evil = new EvilCircle(random(0,width), random(0,height), true);
evil.setControls();

// Анимация шаров

function loop() {
  // поменять 0.25 на 1
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)'; // цвет заливки полупрозрачный черный
  ctx.fillRect(0, 0, width, height); // рисует прямоугольник цвета по всей ширине и высоте холста
// Это позволяет скрыть рисунок предыдущего кадра до того, как будет нарисован следующий
// Если этого не сделать, вы увидите, как длинные змеи ппрорисовываются за шаром, а не шары


  while (balls.length < 25) {
    var ball = new Ball(
      random(0,width),
      random(0,height),
      random(-7,7),
      random(-7,7),
      true,
      'rgb(' + random(0,255) + ',' + random(0,255) + ',' + random(0,255) +')',
      random(10,20)
    );
    balls.push(ball);
    count++;
    para.textContent = 'Ball count: ' + count;// счетчик шаров
  }

  for (var i = 0; i < balls.length; i++) {
    if (balls[i].exists){
          balls[i].draw();
          balls[i].update();
          balls[i].collisionDetect();
    }

  }

  evil.draw();
  evil.checkBounds();
  evil.collisionDetect();

  requestAnimationFrame(loop);// для создания плавной анимации
}

loop();