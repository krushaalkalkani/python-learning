# class User:
#     # constructor
#     def __init__(self, user_id, username):
#         self.id = user_id
#         self.username = username
#         self.followers = 0
#         pass

# user_1 = User()
# user_1.id = "001"
# user_1.username = "username"
# print(user_1.id)
#
# user_2 =User()
# user_2.id = "002"
# user_2.username = "kay"
# print(user_2.id)
# print(user_2.username)

# user_3 = User("001", "kay")
# print(user_3.username)


############### Method ##################

class User:
    # constructor
    def __init__(self, user_id, username):
        self.id = user_id
        self.username = username
        self.followers = 0
        self.following = 0

    def follow(self, user):
        user.followers += 1
        user.following += 1

user_1 = User("001", "kay")
user_2 = User("002", "Bob")

user_1.follow(user_2)
print(user_1.followers)
print(user_1.following)
print(user_2.followers)
print(user_2.following)


