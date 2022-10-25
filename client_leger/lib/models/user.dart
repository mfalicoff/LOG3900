class User {
  late String username;
  late String email;
  late String? cookie;
  late String id;

  User(this.username, this.email);

  User.fromJson(Map parsed){
    username = parsed["data"]["name"] ?? "Failed";
    email = parsed["data"]["email"] ?? "Failed";
    id = parsed["data"]["_id"] ?? "Failed";
  }



  User clear() {
    return User("", "");
  }
}
