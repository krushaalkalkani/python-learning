from turtle import Turtle, Screen
import random

is_turtle_race_on = False

# def move_forward():
#   new_turtle.forward(10)

# def move_backward():
#   new_turtle.backward(10)

# def move_left():
#   new_turtle.left(10)

# def move_right():
#   new_turtle.right(10)

# def clear_screen():
#   new_turtle.clear()
#   new_turtle.penup()
#   new_turtle.home()
#   new_turtle.pendown()


# new_turtle = Turtle()
# screen = Screen()

# screen.listen()
# screen.onkey(move_forward, "w")
# screen.onkey(move_backward, "s")
# screen.onkey(move_left, "a")
# screen.onkey(move_right, "d")
# screen.exitonclick()


screen = Screen()

screen.setup(width=600, height=500)
user_bet = screen.textinput(title="Make your bet",
                            prompt="Which turtle will win? Enter a color: ")
colors = ["red", "orange", "yellow", "green", "blue", "purple"]
y_positions = [-70, -40, -10, 20, 50, 80]
all_turtles = []

for turtle_index in range(0, 6):
    new_turtle = Turtle(shape="turtle")
    new_turtle.penup()
    new_turtle.goto(x=-280, y=y_positions[turtle_index])
    new_turtle.color(colors[turtle_index])
    all_turtles.append(new_turtle)

if user_bet:
    is_turtle_race_on = True

while is_turtle_race_on:
    for turtle in all_turtles:
        if turtle.xcor() > 280:
            wining_color = turtle.pencolor()
            if wining_color == user_bet:
                print(f"You've won! The {wining_color} turtle is the winner!")
            else:
                print(f"You've lost! The {wining_color} turtle is the winner!")
            is_turtle_race_on = False

        random_distance = random.randint(0, 10)
        turtle.forward(random_distance)

screen.exitonclick()
