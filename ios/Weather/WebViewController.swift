import SwiftUI
import WebKit

class WebViewHelper: NSObject, WKNavigationDelegate {
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        print("webview didFinishNavigation")

        NotificationCenter.default.post(name: .didFinishNavigation, object: nil)
    }
}

//class MessageHandler: NSObject, WKScriptMessageHandler {
//    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
//        guard let dict = message.body as? [String : AnyObject] else {
//            return
//        }
//
//        print(dict)
//    }
//}

class WebViewController: UIViewController {
    let navigationHelper = WebViewHelper()
    var progressView: UIActivityIndicatorView?
//    let messageHandler = MessageHandler()

    let url = URL(string: "SET ME")

    private lazy var webView: WKWebView = {
        let webView = WKWebView(frame: self.view.frame)
        webView.translatesAutoresizingMaskIntoConstraints = false
        return webView
    }()

    override func viewDidLoad() {
        super.viewDidLoad()

        NotificationCenter.default.addObserver(self, selector: #selector(didFinishNavigation(notification:)), name: .didFinishNavigation, object: nil)
        NotificationCenter.default.addObserver(self, selector: #selector(didBecomeActive(notification:)), name: .didBecomeActive, object: nil)

        view.translatesAutoresizingMaskIntoConstraints = false

        webView.frame = view.frame

        view.addSubview(webView)

        let guide = view.safeAreaLayoutGuide

        NSLayoutConstraint.activate([
            webView.leadingAnchor.constraint(equalTo: guide.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: guide.trailingAnchor),
            webView.bottomAnchor.constraint(equalTo: guide.bottomAnchor),
            webView.topAnchor.constraint(equalTo: guide.topAnchor)
        ])

        webView.navigationDelegate = navigationHelper

//        let contentController = webView.configuration.userContentController
//        contentController.add(messageHandler, name: "bus")

        print("start navigation")
        let progressView = UIActivityIndicatorView(frame: CGRect(x: 0, y: 0, width: 100, height: 100))
        progressView.style = .large
        progressView.color = .gray
        progressView.translatesAutoresizingMaskIntoConstraints = false
        self.progressView = progressView
        view.addSubview(progressView)
        progressView.startAnimating()

        progressView.centerXAnchor.constraint(equalTo: view.centerXAnchor).isActive = true
        progressView.centerYAnchor.constraint(equalTo: view.centerYAnchor).isActive = true

        let request = URLRequest(url: self.url, cachePolicy: .returnCacheDataElseLoad)
        webView.load(request)
    }

    @objc func didFinishNavigation(notification: NSNotification) {
        progressView?.stopAnimating()
        progressView?.removeFromSuperview()
    }

    @objc func didBecomeActive(notification: NSNotification) {
        print("got onActive notification")

        webView.evaluateJavaScript("if (window.__onMessage) window.__onMessage('didBecomeActivective')")
    }
}
