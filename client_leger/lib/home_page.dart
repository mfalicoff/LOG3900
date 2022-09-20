import 'package:flutter/material.dart';

class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key});

  // This widget is the home page of your application. It is stateful, meaning
  // that it has a State object (defined below) that contains fields that affect
  // how it looks.

  // This class is the configuration for the state. It holds the values (in this
  // case the title) provided by the parent (in this case the App widget) and
  // used by the build method of the State. Fields in a Widget subclass are
  // always marked "final".

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {

  @override
  Widget build(BuildContext context) {
    // This method is rerun every time setState is called, for instance as done
    // by the _incrementCounter method above.
    //
    // The Flutter framework has been optimized to make rerunning build methods
    // fast, so that you can just rebuild anything that needs updating rather
    // than having to individually change instances of widgets.
    return Stack(
      children: <Widget>[
        Container(
          decoration: const BoxDecoration(
            image: DecorationImage(image: AssetImage("assets/background.jpg"), fit: BoxFit.cover,),
          ),
        ),
        Positioned(
            top: 10.0,
            right: 30.0,
            child: ElevatedButton(
                style: ButtonStyle(
                    padding: MaterialStateProperty.all(
                      const EdgeInsets.symmetric(vertical: 18.0, horizontal: 0.0),
                    ),
                    shape: MaterialStateProperty.all<RoundedRectangleBorder>(
                        RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(100.0)
                        )
                    )
                ),
                onPressed: _toChatPage,
                child: const Icon(Icons.chat))
        ),
        Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                ElevatedButton(onPressed: _toGameListPage, child: const Text("Mode Classique"))
              ],
            )
        )
      ],
    );
  }

  void _toChatPage() {
    Navigator.of(context).push(
        MaterialPageRoute(
            builder: (context) => const Text("Chat page")
        )
    );
  }

  void _toGameListPage() {
    Navigator.of(context).push(
        MaterialPageRoute(
            builder: (context) => const Text("Game list page")
        )
    );
  }
}
