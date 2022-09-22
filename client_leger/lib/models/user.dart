class User {
  late String username;
  late String email;

  User(this.username, this.email);
  User.fromJson(Map parsed){
    username = parsed["data"]["name"] ?? "Failed";
    email = parsed["data"]["email"] ?? "Failed";
  }
}
