$(document).ready(function() {
    /******************************FIREBASE**********************************/
    var data;
    (function() {
        var config = {
            apiKey: "AIzaSyAqGGjLPeSKxXrHWLguX0bQqCTAUdAbpV4",
            authDomain: "test-25df4.firebaseapp.com",
            databaseURL: "https://test-25df4.firebaseio.com",
            storageBucket: "test-25df4.appspot.com",
            // messagingSenderId: "184385613268"
        };
        firebase.initializeApp(config);
        data = firebase.database().ref().child("score");
        var ulList = $('#list')[0]; //Get document.getElementById()
        data.on('child_added', snap => {
            var li = document.createElement('li');
            li.id = snap.key;
            $(ulList).append(li);
            var count = $("ul").find("li").length;
            li.innerText = count + ". " + snap.val().join("  ");

            data.on('child_changed', snap => {
                var liChanged = $(snap.key)[0];
                liChanged.innerText = count + ". " + snap.val();
            });
        });
    }());
    /********************FIREBASE_END*******************************/
    //AUDIO files
    var foodEat = $("#foodEat");
    //zamiast wrzucać do html'a dzwięki lepiej:
    /*var audio = new Audio('audio_file.mp3');
    audio.play();*/
    var mainMenuMusic = $("#mainMenuMusic");
    var wallHit = $("#wallHit");
    var gameMusic = $("#gameMusic");
    var pause_me = $("#pause_me");
    /*******************************MENUS**************************/

    //GO TO CREDITS
    $("#creditsLink").on("click", function() {
            MainMenu.style.zIndex = "-1"; //dupa - zadeklaruj sobie var MainMenu = $('#MainMenu') i potem MainMenu.css({z-index: -1, display: block});
            credits.style.display = "block"
        })
        //RETURN
    $(".returnMain").on("click", function() {
            credits.style.display = "none";
            highscores.style.display = "none";
            MainMenu.style.zIndex = "12";
            mainMenuMusic[0].play();
        })
        //GO TO HIGHSCORES
    $("#highscore").on("click", function() {
            MainMenu.style.zIndex = "-1";
            highscores.style.display = "block";
        })
        //START GAME AFTER CLICK
    $("#start").on("click", function() {
        mainMenuMusic[0].pause();
        gameMusic[0].play();
        MainMenu.style.zIndex = "-1";
        $("#endMenu").hide();
        game_loop();
    });
    /***************************GLOBAL VARS*****************************/
    var canvas = $("canvas")[0]; //Znowu albo jQ albo js
    var ctx = canvas.getContext("2d");
    var width = $("canvas").width(); // zakeszuj canvas'a
    var height = $("canvas").height();
    var cw = 10;
    var game_speed = 100;
    var movement;
    var snake_array;
    var score = 0;
    var interval = setInterval(timer);
    /*************************GAME LOOP INIT***************************/
    function game_loop() {
        snake_create();
        food_create();
        food_create2();
        score = 0;
        movement = 'right';
        if (interval !== undefined)
            clearInterval(interval);
        interval = setInterval(timer, game_speed - Math.round(score / 2));
    }
    /*******************************TIMER**************************************/
    function timer() {
        clearInterval(interval);
        paint();
        if( interval == false){
          return false;
        }
        interval = setInterval(timer, game_speed - Math.round(score / 2));
    }

    function pauseme() {
        clearInterval(interval);
    }

    /********************************CREATING **************************************/
    function snake_create() {
        var length = 3;
        snake_array = [];
        for (var i = length; i > 0; i--) {
            snake_array.push({
                x: i,
                y: width / 20
            });
        }
        return false;
    }

    function food_create() {
    	//VAR!!!
        food = {
            x: Math.round(Math.random() * (width / cw - cw)),
            y: Math.round(Math.random() * (height / cw - cw))
        };
    }

    function food_create2() {
		//VAR!!!
        food2 = {
            x: Math.round(Math.random() * (width / cw - cw)),
            y: Math.round(Math.random() * (height / cw - cw)),
        };
    }

    /******************************MAIN PAINTING FUNCTION**********************/
    function paint() {
        ctx.fillStyle = "#112233";
        ctx.fillRect(0, 0, width, height);

        var pos_x = snake_array[0].x;
        var pos_y = snake_array[0].y;

        //CONTROLS_1
        if (movement == "right") pos_x++;
        else if (movement == "left") pos_x--;
        else if (movement == "up") pos_y--;
        else if (movement == "down") pos_y++; //lepszu bylby switch
        /***************COLLISION SNAKE-SNAKE***************/
        function collision(x, y, array) {
            for (var i = 0; i < array.length; i++) {
                if (array[i].x === x && array[i].y === y)
                    return true;
            }
            return false;
        }
        /**************COLLISION, NEW GAME, UPDATING SCORE**************/
        if (pos_x == -1 || pos_x == width / cw || pos_y <= -1 || pos_y >= height / cw || collision(pos_x, pos_y, snake_array)) //Dlaczego pos_y nie moze byc == -1;
        {
            wallHit[0].play();
            gameMusic[0].pause();//jsem dzwięki nie z html'a
            interval = false;
            $("#endMenu").show();
            $("#scoreValue").text(score);
            $("#scoreSubmit").one("click", function(e){ //formatowanie kodu w tym całym bloku
              e.preventDefault();

            data.once("value").then(function(snap) {
                var scoreArr = snap.val();

                function smallest(scoreArr) { //do refactora - nie czaje ocb tutaj chodzi
                    var x = [$("#scoreName").val(), score ];
                    if (scoreArr[9][1] < x[1]) {
                        scoreArr.pop();
                        scoreArr.push(x);
                    }
                    scoreArr.sort(function(a, b) {
                        return b[1] - a[1];
                    });
                    return scoreArr;
                }
                smallest(scoreArr);
                var highscoreRef = firebase.database().ref();
                highscoreRef.set({
                    "score": scoreArr
                });
            });

            return; //Return false

            });
            $(".playAgain").on("click", function() {
                $("#endMenu").hide(); //zakeszuj to
                gameMusic[0].play();
                game_loop();
            });


        }
        /*****************SNAKE MOVEMENT******************/
        var tail = snake_array.pop();
        tail.x = pos_x;
        tail.y = pos_y;
        snake_array.unshift(tail);
        //SNAKE POS
        for (var i = 0; i < snake_array.length; i++) {
            var c = snake_array[i];
            snake_paint(c);
        }
        /******************FOOD EATING*******************/
        if ((pos_x == food.x && pos_y == food.y)) {
            var add = {};
            foodEat[0].play();
            snake_array.push(add); // ??Nie łatwiej snake_array.push({}); ??
            score++;
            food_create();
        }
        if ((pos_x == food2.x && pos_y == food2.y)) {
            var add = {};
            foodEat[0].play();
            snake_array.push(add); // ??Nie łatwiej snake_array.push({}); ??
            score++;
            food_create2();

        }

        food_paint(food.x, food.y);
        food_paint2(food2.x, food2.y);
        /*SCORE PAINTING*/
        var score_text = "Score: " + score;
        ctx.fillText(score_text, 8, 15);
        ctx.font = "12px NES";

    }
    /*****************************PAINTING FUNCTIONS**************************/
    function snake_paint(c) {
        ctx.beginPath();
        ctx.shadowColor = 'blue'; //Doczytać o kolejności różnych elementów w CTX - OGROMNE ZNACZENIE
        ctx.shadowBlur = 3;
        ctx.fillStyle = "#0ae";
        ctx.fillRect(c.x * cw, c.y * cw, cw, cw);
        ctx.strokeStyle = "black";
        ctx.strokeRect(c.x * cw, c.y * cw, cw, cw);
        ctx.closePath();
    }

    function food_paint(x, y) {
        ctx.beginPath();
        ctx.fillStyle = "#0ae";
        ctx.fillRect(x * cw, y * cw, cw, cw);
        ctx.strokeStyle = "black";
        ctx.strokeRect(x * cw, y * cw, cw, cw);
        ctx.shadowBlur = 5;
        ctx.shadowColor = "blue";
        ctx.closePath();
    }

    function food_paint2(x, y) {
        ctx.beginPath();
        ctx.fillStyle = "#0ae";
        ctx.fillRect(x * cw, y * cw, cw, cw);
        ctx.strokeStyle = "black";;
        ctx.strokeRect(x * cw, y * cw, cw, cw);
        ctx.shadowBlur = 5;
        ctx.shadowColor = "blue";
        ctx.closePath();
    }

    /******************************GRABBING CONTROLS***************************/
    $(document).keydown(function(e) {
            var key = e.which;
            if (key == "37" && movement != 'right') movement = "left";
            else if (key == "38" && movement != 'down') movement = "up";
            else if (key == "39" && movement != "left") movement = "right";
            else if (key == "40" && movement != "up") movement = "down";
        })
        //  PAUSE / RESUME
    $(document).keydown(function(e) {
        var key = e.which;
        if (key == "80") // P PAUZA
            pauseme();

		if (key == "32") // SPACEBAR HOLD - ACCELERATE! / SPACEBAR - RESUME //lepiej wygląda parę ifów pod sobą w takim casie bo warunki powyższe odpowiadają za różna logikę
            timer();
    });
});
