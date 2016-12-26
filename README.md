# HacksBall
Welcome to HacksBall, the project that aims to implement a fully functional HaxBall clone in HTML5 using WebRTC. This name is only temporary as an official name for the project has not been decided yet.

## Reasons for HacksBall
Flash is dying slowly but undeniably. Within the next few weeks, [Chrome will make Flash content click-to-play](https://blog.google/products/chrome/flash-and-chrome/). This may not be an issue for long-term users but it will possibly discourage new players from joining the community. Furthermore, HaxBall is not open source causing a lack of customizability and extensibility. Therefore, highly requested features, such as a user registration system or even player bots, are missing. In addition, Flash performance is poor, even on dedicated high-end servers.

## Contributing
Everybody is welcome to contribute to the project, be it by programming, testing and reporting bugs or suggesting enhancements.
When submitting code to the master branch, please make sure that functionality is extended only. Consider the creation of new branches for non-functional code in order to avoid regression on the master branch.

## Development setup
A development version currently runs at https://dev.shamequit.com. The client requires a modern browser with WebRTC support, the server infrastructure requires nodejs and, in case TLS support for the websocket is desired, a web server supporting proxy functionality for websockets, such as nginx.

In order to set up the client locally, serve `src/web/` on localhost using a web server, such as nginx. You can use [Web Server for Chrome](https://chrome.google.com/webstore/detail/ofhbbkphhbklhfoeikjpcbhemlocgigb) as well. In this case, make sure to tick the option `Automatically show index.html` and simply browse to the URL provided by the app.

As soon as you have set up the client locally, it will still connect to the default master server. In order to run your own master server, browse to `src/server`, install the required dependencies using `npm install` once and finally run the master server using `node server.js` or `nodejs server.js`, depending on your Linux distribution. Finally, instruct your JavaScript client to use this master server by calling `Debug.enable("ws://127.0.0.1:9090/");` from within your browser's developer console. This will set a `localStorage` cookie and your local master server will then be used until you run `Debug.disable();`.

## Security
When you submit code, verify that your code does not introduce any security vulnerabilities. This includes, but is not limited to, XSS injections, imperformant code that can result in Denial of Service (DoS) attacks or code enabling privilege escalations. Also make sure to understand the client-server model and especially that data input from clients cannot be trusted under any circumstances. Therefore, it is essential to transmit minimal events over the network only (e.g. transsion of movement indicators from client to server on key press instead of player position coordinates). As a consequence, strong security assumptions will help mitigating the risk of cheaters. For instance, HaxBall suffers from a security vulnerability allowing to passively join password-protected rooms and overhear ongoing conversations because it is the client, instead of the server, closing the network connection after receiving a failure event.

It is acceptable to neglect security related aspects during development only if the source code is commented with TODOs indicating the deficits.
