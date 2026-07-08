from turtle import Screen
from paddle import Paddle
from ball import Ball
import time
from scoreboard import Scoreboard

screen = Screen()
screen.title("Pong Game")
screen.bgcolor("black")
screen.setup(width=800, height=600)
screen.tracer(0)

r_paddle =  Paddle((350, 0))
l_paddle =  Paddle((-350, 0))
ball = Ball()
scoreboard = Scoreboard()
# up and down keys to move the paddle
screen.listen()
screen.onkey(r_paddle.go_up, "Up")
screen.onkey(r_paddle.go_down, "Down")
screen.onkey(l_paddle.go_up, "w")
screen.onkey(l_paddle.go_down, "s")

game_is_on = True
while game_is_on:
    time.sleep(0.1)
    screen.update()
    ball.move()
    
    # detect the collision 
    if ball.ycor() > 280 or ball.ycor() < -280:
      ball.bounce_y()
    
    # detect the collision with the paddle
    if ball.distance(r_paddle) < 50 and ball.xcor() > 320 or ball.distance(l_paddle) < 50 and ball.xcor() < -320:
      ball.bounce_x()

    # Detect misses (ball goes past a paddle), then score and reset.
    # If the ball goes past the *left* boundary, the left paddle missed => right player scores.
    if ball.xcor() < -380:
      ball.reset_position()
      scoreboard.r_point()

    # If the ball goes past the *right* boundary, the right paddle missed => left player scores.
    if ball.xcor() > 380:
      ball.reset_position()
      scoreboard.l_point()
    
screen.exitonclick()