import colorgram as cg
from pathlib import Path
import turtle as turtle_module
from turtle import Turtle, Screen
import random

# img_path = Path(__file__).with_name("hirst.jpg")
# colors = cg.extract(str(img_path), 30)

# rgb_colors = []
# for color in colors:
#     r, g, b = color.rgb
#     rgb_colors.append((r, g, b))

# print(rgb_colors)
tim = turtle_module.Turtle()
turtle_module.colormode(255)
tim.speed("fastest")
tim.penup()
tim.hideturtle()

colors_list = [(197, 13, 32), (248, 236, 25), (40, 76, 188), (244, 247, 253), (239, 228, 5), (40, 216, 68), (227, 160, 50), (29, 40, 154), (212, 76, 15), (18, 153, 17), (241, 35, 161), (196, 16, 11), (67, 11, 31),
               (222, 21, 118), (61, 15, 8), (223, 141, 206), (11, 97, 62), (222, 158, 10), (51, 211, 231), (19, 21, 49), (238, 157, 216), (78, 74, 214), (72, 212, 170), (10, 227, 238), (94, 233, 196), (63, 232, 241), (219, 88, 50)]
# print(colors)

tim.setheading(225)
tim.forward(250)
tim.setheading(0)
number_of_dots = 100


for dot_count in range(1, number_of_dots + 1):
    tim.dot(20, random.choice(colors_list))
    tim.forward(50)
    if (dot_count + 1) % 10 == 0:
        tim.setheading(90)
        tim.forward(50)
        tim.setheading(180)
        tim.forward(500)
        tim.setheading(0)


screen = Screen()
screen.exitonclick()
