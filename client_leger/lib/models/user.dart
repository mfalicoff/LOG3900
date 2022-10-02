class User {
  late String username;
  late String email;
  late String? cookie;

  User(this.username, this.email);

  User.fromJson(Map parsed){
    username = parsed["data"]["name"] ?? "Failed";
    email = parsed["data"]["email"] ?? "Failed";
  }

  User clear() {
    return User("", "");
  }
}
