from turtle import Turtle, Screen

def move_forward():
  tim.forward(10)  

def move_backward():
  tim.backward(10)

def move_left():
  tim.left(10)

def move_right():
  tim.right(10)

def clear_screen():
  tim.clear()
  tim.penup()
  tim.home()
  tim.pendown()



tim = Turtle()
screen = Screen()

screen.listen()
screen.onkey(move_forward, "w")
screen.onkey(move_backward, "s")
screen.onkey(move_left, "a")
screen.onkey(move_right, "d")
screen.exitonclick()