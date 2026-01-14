from turtle import Turtle, Screen

tim = Turtle()
tim.shape("circle")
tim.color("blue", "green")
tim.pencolor("red")


for _ in range(15):
    tim.forward(10)
    tim.penup()
    tim.forward(10)
    tim.pendown()

screen = Screen()
